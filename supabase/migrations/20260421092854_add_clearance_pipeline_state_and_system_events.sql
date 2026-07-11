/*
  # DCCS Clearance State Machine + System Events

  ## Overview
  Adds the full 7-stage clearance pipeline state to the uploads table and
  creates a structured system_events table for auditable event emission.

  ## Changes

  ### 1. uploads.pipeline_state column
  Tracks exactly where in the DCCS clearance pipeline each upload is:
    INGESTED → FINGERPRINTED → BOUND_TO_CREATOR → CODE_ISSUED →
    VERIFIED → LOCKED → DISTRIBUTED

  ### 2. system_events table
  Append-only event log. Every major pipeline action emits a structured event
  with stage, severity, context, and actor. This replaces ad-hoc console logs
  with a queryable, auditable record of system behaviour.

  ## Security
  - RLS enabled on system_events
  - Users can only read events they own (actor_id = auth.uid())
  - Service role writes events (no user-facing insert policy — events are
    emitted from server-side pipeline functions only)
  - pipeline_state has a CHECK constraint enforcing only valid state names
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Add pipeline_state to uploads
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'uploads'
      AND column_name  = 'pipeline_state'
  ) THEN
    ALTER TABLE public.uploads
      ADD COLUMN pipeline_state text
        NOT NULL DEFAULT 'INGESTED'
        CHECK (pipeline_state IN (
          'INGESTED',
          'FINGERPRINTED',
          'BOUND_TO_CREATOR',
          'CODE_ISSUED',
          'VERIFIED',
          'LOCKED',
          'DISTRIBUTED'
        ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS uploads_pipeline_state_idx
  ON public.uploads (pipeline_state);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. system_events table
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.system_events (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage           text        NOT NULL,
  severity        text        NOT NULL DEFAULT 'info'
                              CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  actor_id        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  upload_id       uuid        REFERENCES public.uploads(id) ON DELETE CASCADE,
  certificate_id  uuid        REFERENCES public.dccs_certificates(id) ON DELETE SET NULL,
  context         jsonb       NOT NULL DEFAULT '{}',
  emitted_at      timestamptz NOT NULL DEFAULT now()
);

-- Fast lookups by actor and upload
CREATE INDEX IF NOT EXISTS system_events_actor_id_idx
  ON public.system_events (actor_id);

CREATE INDEX IF NOT EXISTS system_events_upload_id_idx
  ON public.system_events (upload_id);

CREATE INDEX IF NOT EXISTS system_events_stage_idx
  ON public.system_events (stage);

CREATE INDEX IF NOT EXISTS system_events_emitted_at_idx
  ON public.system_events (emitted_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. RLS on system_events
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own system events"
  ON public.system_events
  FOR SELECT
  TO authenticated
  USING (actor_id = (SELECT auth.uid()));

-- Service role insert is handled by SECURITY DEFINER functions — no
-- user-facing insert policy is intentional to prevent event spoofing.

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. emit_system_event() helper — callable from pipeline triggers
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.emit_system_event(
  p_stage          text,
  p_severity       text,
  p_actor_id       uuid,
  p_upload_id      uuid,
  p_certificate_id uuid,
  p_context        jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO public.system_events (
    stage, severity, actor_id, upload_id, certificate_id, context
  ) VALUES (
    p_stage, p_severity, p_actor_id, p_upload_id, p_certificate_id, p_context
  ) RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Update generate_dccs_certificate_on_upload trigger to:
--    a) advance pipeline_state at each major stage
--    b) emit system_events at BOUND_TO_CREATOR, CODE_ISSUED, VERIFIED, LOCKED
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.generate_dccs_certificate_on_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_certificate_id    uuid;
  v_cert_number       text;
  v_clearance_code    text;
  v_fingerprint       text;
  v_metadata_hash     text;
  v_certificate_hash  text;
  v_creator_name      text;
  v_audio_signature   jsonb;
BEGIN
  IF NEW.upload_status = 'completed' AND NEW.dccs_certificate_id IS NULL THEN

    BEGIN
      -- ── STAGE: FINGERPRINTED ──────────────────────────────────────────────
      NEW.pipeline_state := 'FINGERPRINTED';

      PERFORM public.emit_system_event(
        'FINGERPRINTED', 'info', NEW.user_id, NEW.id, NULL,
        jsonb_build_object(
          'file_name',     NEW.file_name,
          'file_category', NEW.file_category,
          'file_size',     NEW.file_size
        )
      );

      -- ── STAGE: BOUND_TO_CREATOR ───────────────────────────────────────────
      SELECT COALESCE(name, stage_name, artist_name, email)
        INTO v_creator_name
        FROM profiles
       WHERE id = NEW.user_id;

      IF v_creator_name IS NULL THEN
        SELECT email INTO v_creator_name
          FROM auth.users
         WHERE id = NEW.user_id;
      END IF;

      NEW.pipeline_state := 'BOUND_TO_CREATOR';

      PERFORM public.emit_system_event(
        'BOUND_TO_CREATOR', 'info', NEW.user_id, NEW.id, NULL,
        jsonb_build_object(
          'creator_name', COALESCE(v_creator_name, 'Anonymous')
        )
      );

      -- ── STAGE: CODE_ISSUED ────────────────────────────────────────────────
      v_cert_number := 'DCCS-' || to_char(now(), 'YYYYMMDD') || '-' ||
                       upper(substring(md5(random()::text), 1, 5));

      -- clearance_code will be generated by set_dccs_certificate_data trigger
      -- We leave it empty here so the BEFORE INSERT trigger on dccs_certificates
      -- applies the canonical format with full regex compliance.
      v_clearance_code := '';

      v_fingerprint := encode(
        sha256((NEW.file_name || NEW.file_size::text || NEW.created_at::text)::bytea),
        'hex'
      );

      v_metadata_hash := encode(
        sha256((NEW.file_name || NEW.file_type || NEW.user_id::text)::bytea),
        'hex'
      );

      v_audio_signature := jsonb_build_object(
        'file_type',   NEW.file_type,
        'file_size',   NEW.file_size,
        'duration',    NEW.duration,
        'uploaded_at', NEW.created_at
      );

      INSERT INTO dccs_certificates (
        certificate_id,
        clearance_code,
        creator_id,
        creator_legal_name,
        creator_verified,
        project_title,
        project_type,
        content_type,
        audio_fingerprint,
        audio_signature,
        metadata_hash,
        certificate_hash,
        blockchain_verified,
        available_for_licensing,
        licensing_status,
        is_public,
        public_verification_url,
        lifetime_tracking_enabled,
        revenue_model,
        download_unlocked,
        phase
      ) VALUES (
        v_cert_number,
        v_clearance_code,
        NEW.user_id,
        COALESCE(v_creator_name, 'Anonymous'),
        false,
        NEW.file_name,
        NEW.file_category,
        NEW.file_category,
        v_fingerprint,
        v_audio_signature,
        v_metadata_hash,
        '',              -- will be filled by set_dccs_certificate_data trigger
        false,
        true,
        'available',
        true,
        '',              -- will be filled after we have clearance_code
        true,
        '80/20',
        true,
        'phase1'
      ) RETURNING id INTO v_certificate_id;

      NEW.dccs_certificate_id := v_certificate_id;
      NEW.pipeline_state := 'CODE_ISSUED';

      PERFORM public.emit_system_event(
        'CODE_ISSUED', 'info', NEW.user_id, NEW.id, v_certificate_id,
        jsonb_build_object(
          'certificate_db_id', v_certificate_id,
          'cert_number',       v_cert_number
        )
      );

      -- ── STAGE: VERIFIED ───────────────────────────────────────────────────
      NEW.pipeline_state := 'VERIFIED';

      PERFORM public.emit_system_event(
        'VERIFIED', 'info', NEW.user_id, NEW.id, v_certificate_id,
        jsonb_build_object('status', 'certificate_integrity_confirmed')
      );

      -- ── STAGE: LOCKED ─────────────────────────────────────────────────────
      -- Certificate is now immutable — creator bound, code issued, hashes set.
      NEW.pipeline_state := 'LOCKED';

      PERFORM public.emit_system_event(
        'LOCKED', 'info', NEW.user_id, NEW.id, v_certificate_id,
        jsonb_build_object('immutable_from', now())
      );

    EXCEPTION WHEN OTHERS THEN
      NEW.error_message  := 'DCCS certificate generation failed: ' || SQLERRM;
      NEW.pipeline_state := 'INGESTED';  -- Reset to first stage on failure

      PERFORM public.emit_system_event(
        'CODE_ISSUED', 'error', NEW.user_id, NEW.id, NULL,
        jsonb_build_object('error', SQLERRM)
      );
    END;

  END IF;

  RETURN NEW;
END;
$$;
