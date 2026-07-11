/*
  # Fix All Broken Triggers on dccs_certificates

  ## Problem
  Three triggers on dccs_certificates reference wrong column names in audit_logs,
  causing every INSERT into dccs_certificates to fail. This cascades up and
  prevents any upload from ever reaching 'completed' status.

  ### Broken triggers:
  1. log_dccs_creation — inserts to audit_logs with columns:
       action, resource_type, resource_id, metadata
     Real columns are:
       event_type, event_category, related_entity_type, related_entity_id, event_data

  2. audit_dccs_modifications — same wrong column names on UPDATE

  3. auto_unlock_dccs_downloads — this one is fine (no DB writes), kept as-is

  ## Fix
  Rewrite log_dccs_creation and audit_dccs_modifications to use the correct
  audit_logs column names.
*/

CREATE OR REPLACE FUNCTION log_dccs_creation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    event_type,
    event_category,
    related_entity_type,
    related_entity_id,
    event_data
  ) VALUES (
    NEW.creator_id,
    'dccs_created',
    'certificate',
    'dccs_certificate',
    NEW.id,
    jsonb_build_object(
      'clearance_code',    NEW.clearance_code,
      'certificate_id',    NEW.certificate_id,
      'download_unlocked', NEW.download_unlocked
    )
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION audit_dccs_modifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.download_unlocked IS DISTINCT FROM NEW.download_unlocked THEN
    INSERT INTO audit_logs (
      user_id,
      event_type,
      event_category,
      related_entity_type,
      related_entity_id,
      event_data
    ) VALUES (
      NEW.creator_id,
      'download_unlocked_changed',
      'certificate',
      'dccs_certificate',
      NEW.id,
      jsonb_build_object(
        'old_value',     OLD.download_unlocked,
        'new_value',     NEW.download_unlocked,
        'clearance_code', NEW.clearance_code
      )
    );
  END IF;
  RETURN NEW;
END;
$$;
