/*
  # DCCS Dispute Resolution & Escrow System

  ## Overview
  Complete dispute management system for DCCS certificates with integrated escrow
  tracking, activity logging, and resolution workflows.

  ## New Tables
  
  ### 1. dccs_disputes
  - Core dispute tracking with parties, status, and resolution
  - Escrow fund management
  - Priority and category classification
  - Evidence storage
  
  ### 2. dccs_dispute_activity_logs
  - Complete audit trail of all dispute actions
  - Timeline tracking for transparency
  - Admin and automated action logging

  ### 3. dccs_dispute_escrow
  - Escrow account tracking for disputed funds
  - Automated hold and release
  - Multi-party distribution support

  ## Security
  - RLS enabled on all tables
  - Parties can view their own disputes
  - Admins have full access
  - Activity logs are immutable
  - Escrow funds protected

  ## Performance
  - Indexes on foreign keys
  - Indexes on status fields
  - Indexes on timestamps for sorting
*/

-- ============================================================================
-- 1. DCCS Disputes Main Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dispute Identity
  dispute_id text UNIQUE NOT NULL DEFAULT 'DCCS-DISPUTE-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  
  -- Certificate Reference
  certificate_id text REFERENCES dccs_certificates(certificate_id) ON DELETE CASCADE,
  snippet_id uuid REFERENCES audio_snippets(id) ON DELETE SET NULL,

  -- Parties Involved
  plaintiff_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  defendant_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Dispute Classification
  dispute_type text NOT NULL CHECK (dispute_type IN (
    'ownership_challenge',
    'copyright_infringement',
    'royalty_split_disagreement',
    'license_violation',
    'quality_complaint',
    'payment_dispute',
    'unauthorized_use',
    'attribution_dispute',
    'contract_breach',
    'other'
  )),
  dispute_category text DEFAULT 'general' CHECK (dispute_category IN (
    'legal', 'financial', 'technical', 'quality', 'general'
  )),
  
  -- Priority & Status
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status text DEFAULT 'open' CHECK (status IN (
    'open',
    'investigating',
    'evidence_review',
    'mediation',
    'arbitration',
    'resolved',
    'dismissed',
    'escalated'
  )),

  -- Dispute Details
  title text NOT NULL,
  description text NOT NULL,
  plaintiff_statement text,
  defendant_statement text,
  
  -- Evidence Storage
  plaintiff_evidence jsonb DEFAULT '[]'::jsonb,
  defendant_evidence jsonb DEFAULT '[]'::jsonb,
  additional_evidence jsonb DEFAULT '[]'::jsonb,

  -- Escrow Information
  has_escrow boolean DEFAULT false,
  escrow_amount numeric(10, 2) DEFAULT 0,
  escrow_currency text DEFAULT 'USD',
  escrow_status text DEFAULT 'none' CHECK (escrow_status IN (
    'none', 'pending', 'held', 'released_plaintiff', 
    'released_defendant', 'split', 'refunded'
  )),

  -- Resolution
  resolution_type text CHECK (resolution_type IN (
    'plaintiff_favor', 'defendant_favor', 'settlement', 
    'dismissed', 'withdrawn', 'split_ruling'
  )),
  resolution_summary text,
  resolution_details jsonb DEFAULT '{}'::jsonb,
  compensation_awarded numeric(10, 2),
  
  -- Admin Assignment
  assigned_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz,
  
  -- Timestamps
  filed_at timestamptz DEFAULT now() NOT NULL,
  defendant_notified_at timestamptz,
  defendant_responded_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  
  -- Metadata
  tags text[] DEFAULT ARRAY[]::text[],
  internal_notes text,
  
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT different_parties CHECK (plaintiff_id != defendant_id),
  CONSTRAINT valid_resolution CHECK (
    (status IN ('resolved', 'dismissed') AND resolution_type IS NOT NULL) OR
    (status NOT IN ('resolved', 'dismissed') AND resolution_type IS NULL)
  )
);

-- ============================================================================
-- 2. Dispute Activity Logs (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_dispute_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dispute Reference
  dispute_id uuid REFERENCES dccs_disputes(id) ON DELETE CASCADE NOT NULL,
  
  -- Activity Details
  activity_type text NOT NULL CHECK (activity_type IN (
    'dispute_filed',
    'defendant_notified',
    'defendant_responded',
    'evidence_submitted',
    'status_changed',
    'admin_assigned',
    'comment_added',
    'escrow_held',
    'escrow_released',
    'resolution_proposed',
    'dispute_resolved',
    'dispute_dismissed',
    'dispute_escalated',
    'settlement_reached',
    'automatic_action'
  )),
  
  -- Actor Information
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  actor_role text CHECK (actor_role IN ('plaintiff', 'defendant', 'admin', 'system')),
  
  -- Activity Content
  title text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- Visibility
  visible_to text[] DEFAULT ARRAY['plaintiff', 'defendant', 'admin']::text[],
  is_system_generated boolean DEFAULT false,
  
  -- Timestamps (immutable)
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. Dispute Escrow System
-- ============================================================================

CREATE TABLE IF NOT EXISTS dccs_dispute_escrow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dispute Reference
  dispute_id uuid REFERENCES dccs_disputes(id) ON DELETE CASCADE NOT NULL,
  
  -- Escrow Account Details
  escrow_account_id text UNIQUE NOT NULL,
  
  -- Financial Details
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  currency text DEFAULT 'USD' NOT NULL,
  
  -- Source Information
  source_type text CHECK (source_type IN ('royalty', 'license_fee', 'deposit', 'other')),
  source_transaction_id text,
  
  -- Escrow Status
  status text DEFAULT 'pending' CHECK (status IN (
    'pending',
    'held',
    'released',
    'distributed',
    'refunded',
    'expired'
  )),
  
  -- Hold Period
  held_at timestamptz,
  hold_until timestamptz,
  released_at timestamptz,
  
  -- Distribution Plan
  distribution_plan jsonb DEFAULT '{}'::jsonb,
  distributed_to jsonb DEFAULT '[]'::jsonb,
  
  -- Blockchain Reference
  blockchain_tx_hash text,
  blockchain_network text,
  
  -- Admin Control
  held_by_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  released_by_admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  release_reason text,
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_hold_period CHECK (
    hold_until IS NULL OR hold_until > held_at
  )
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- dccs_disputes indexes
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_certificate 
  ON dccs_disputes(certificate_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_snippet 
  ON dccs_disputes(snippet_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_plaintiff 
  ON dccs_disputes(plaintiff_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_defendant 
  ON dccs_disputes(defendant_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_assigned_admin 
  ON dccs_disputes(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_status 
  ON dccs_disputes(status);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_priority 
  ON dccs_disputes(priority);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_filed_at 
  ON dccs_disputes(filed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dccs_disputes_type 
  ON dccs_disputes(dispute_type);

-- dccs_dispute_activity_logs indexes
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_dispute 
  ON dccs_dispute_activity_logs(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_actor 
  ON dccs_dispute_activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_created 
  ON dccs_dispute_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_activity_type 
  ON dccs_dispute_activity_logs(activity_type);

-- dccs_dispute_escrow indexes
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_dispute 
  ON dccs_dispute_escrow(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_status 
  ON dccs_dispute_escrow(status);
CREATE INDEX IF NOT EXISTS idx_dccs_dispute_escrow_held_by 
  ON dccs_dispute_escrow(held_by_admin_id);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE dccs_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_dispute_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dccs_dispute_escrow ENABLE ROW LEVEL SECURITY;

-- dccs_disputes policies

CREATE POLICY "Users can view disputes where they are involved"
  ON dccs_disputes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = plaintiff_id OR 
    auth.uid() = defendant_id OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Plaintiffs can file disputes"
  ON dccs_disputes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = plaintiff_id);

CREATE POLICY "Parties can update their statements"
  ON dccs_disputes FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = plaintiff_id OR 
    auth.uid() = defendant_id
  )
  WITH CHECK (
    auth.uid() = plaintiff_id OR 
    auth.uid() = defendant_id
  );

CREATE POLICY "Admins have full access to disputes"
  ON dccs_disputes FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- dccs_dispute_activity_logs policies

CREATE POLICY "Users can view activity for their disputes"
  ON dccs_dispute_activity_logs FOR SELECT
  TO authenticated
  USING (
    dispute_id IN (
      SELECT id FROM dccs_disputes 
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Users and admins can create activity logs"
  ON dccs_dispute_activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- dccs_dispute_escrow policies

CREATE POLICY "Users can view escrow for their disputes"
  ON dccs_dispute_escrow FOR SELECT
  TO authenticated
  USING (
    dispute_id IN (
      SELECT id FROM dccs_disputes 
      WHERE plaintiff_id = auth.uid() OR defendant_id = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Admins can manage escrow"
  ON dccs_dispute_escrow FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- ============================================================================
-- Automatic Timestamp Updates
-- ============================================================================

CREATE OR REPLACE FUNCTION update_dccs_disputes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_dccs_disputes_timestamp
  BEFORE UPDATE ON dccs_disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_disputes_updated_at();

CREATE TRIGGER update_dccs_dispute_escrow_timestamp
  BEFORE UPDATE ON dccs_dispute_escrow
  FOR EACH ROW
  EXECUTE FUNCTION update_dccs_disputes_updated_at();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to automatically create activity log when dispute is created
CREATE OR REPLACE FUNCTION log_dispute_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO dccs_dispute_activity_logs (
    dispute_id,
    activity_type,
    actor_id,
    actor_role,
    title,
    description,
    is_system_generated
  ) VALUES (
    NEW.id,
    'dispute_filed',
    NEW.plaintiff_id,
    'plaintiff',
    'Dispute Filed',
    'A new dispute has been filed: ' || NEW.title,
    true
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_log_dispute_creation
  AFTER INSERT ON dccs_disputes
  FOR EACH ROW
  EXECUTE FUNCTION log_dispute_creation();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_dispute_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO dccs_dispute_activity_logs (
      dispute_id,
      activity_type,
      actor_id,
      actor_role,
      title,
      description,
      metadata,
      is_system_generated
    ) VALUES (
      NEW.id,
      'status_changed',
      auth.uid(),
      CASE 
        WHEN auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin') THEN 'admin'
        WHEN auth.uid() = NEW.plaintiff_id THEN 'plaintiff'
        WHEN auth.uid() = NEW.defendant_id THEN 'defendant'
        ELSE 'system'
      END,
      'Status Changed',
      'Dispute status changed from "' || OLD.status || '" to "' || NEW.status || '"',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      ),
      true
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_log_status_change
  AFTER UPDATE ON dccs_disputes
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION log_dispute_status_change();
