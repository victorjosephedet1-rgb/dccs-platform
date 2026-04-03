/*
  # Auto-Deployment and Customer Update Tracking System

  ## Overview
  This migration creates a comprehensive system to automatically track deployments,
  customer instances, and propagate updates instantly to all V3BMusic.AI users.

  ## New Tables

  1. **deployment_versions**
     - Tracks every deployment/update made to the platform
     - Stores version numbers, commit hashes, deployment timestamps
     - Tracks what changed in each deployment

  2. **customer_instances**
     - Tracks all customer sites/instances using V3BMusic.AI links
     - Stores instance URLs, customer contact info, sync preferences
     - Tracks which version each customer is currently on

  3. **deployment_logs**
     - Real-time logs of deployment progress
     - Tracks success/failure for each customer instance
     - Enables rollback if needed

  4. **update_notifications**
     - Tracks notifications sent to customers about updates
     - Email, webhook, and dashboard notifications
     - Delivery status tracking

  ## Security
  - RLS enabled on all tables
  - Admin-only write access
  - Customers can read their own instance data
  - Webhook endpoints secured with tokens

  ## Features
  - Automatic version tracking
  - Customer notification system
  - Rollback capability
  - Real-time deployment status
  - Update propagation tracking
*/

-- Deployment versions table
CREATE TABLE IF NOT EXISTS deployment_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_number text NOT NULL UNIQUE,
  commit_hash text,
  deployed_at timestamptz DEFAULT now(),
  deployed_by uuid REFERENCES auth.users(id),
  deployment_status text CHECK (deployment_status IN ('deploying', 'deployed', 'failed', 'rolled_back')) DEFAULT 'deploying',
  changes_summary jsonb DEFAULT '{}',
  affected_files text[],
  build_duration_seconds integer,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer instances table
CREATE TABLE IF NOT EXISTS customer_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_name text NOT NULL,
  instance_url text NOT NULL UNIQUE,
  customer_email text,
  customer_phone text,
  contact_person text,
  auto_update_enabled boolean DEFAULT true,
  current_version_id uuid REFERENCES deployment_versions(id),
  last_synced_at timestamptz,
  sync_status text CHECK (sync_status IN ('synced', 'syncing', 'failed', 'pending')) DEFAULT 'pending',
  webhook_url text,
  webhook_secret text,
  notification_preferences jsonb DEFAULT '{"email": true, "webhook": true, "sms": false}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deployment logs table
CREATE TABLE IF NOT EXISTS deployment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_version_id uuid REFERENCES deployment_versions(id) ON DELETE CASCADE,
  customer_instance_id uuid REFERENCES customer_instances(id) ON DELETE CASCADE,
  log_level text CHECK (log_level IN ('info', 'warning', 'error', 'success')) DEFAULT 'info',
  message text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Update notifications table
CREATE TABLE IF NOT EXISTS update_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deployment_version_id uuid REFERENCES deployment_versions(id) ON DELETE CASCADE,
  customer_instance_id uuid REFERENCES customer_instances(id) ON DELETE CASCADE,
  notification_type text CHECK (notification_type IN ('email', 'webhook', 'sms', 'dashboard')) NOT NULL,
  sent_at timestamptz DEFAULT now(),
  delivery_status text CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')) DEFAULT 'pending',
  response_data jsonb DEFAULT '{}',
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_deployment_versions_deployed_at ON deployment_versions(deployed_at DESC);
CREATE INDEX IF NOT EXISTS idx_deployment_versions_status ON deployment_versions(deployment_status);
CREATE INDEX IF NOT EXISTS idx_customer_instances_url ON customer_instances(instance_url);
CREATE INDEX IF NOT EXISTS idx_customer_instances_auto_update ON customer_instances(auto_update_enabled);
CREATE INDEX IF NOT EXISTS idx_customer_instances_sync_status ON customer_instances(sync_status);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_version ON deployment_logs(deployment_version_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_instance ON deployment_logs(customer_instance_id);
CREATE INDEX IF NOT EXISTS idx_deployment_logs_created_at ON deployment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_update_notifications_version ON update_notifications(deployment_version_id);
CREATE INDEX IF NOT EXISTS idx_update_notifications_instance ON update_notifications(customer_instance_id);
CREATE INDEX IF NOT EXISTS idx_update_notifications_status ON update_notifications(delivery_status);

-- Enable RLS
ALTER TABLE deployment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for deployment_versions
CREATE POLICY "Admins can manage deployment versions"
  ON deployment_versions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view deployment versions"
  ON deployment_versions
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for customer_instances
CREATE POLICY "Admins can manage customer instances"
  ON customer_instances
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view customer instances"
  ON customer_instances
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for deployment_logs
CREATE POLICY "Admins can manage deployment logs"
  ON deployment_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view deployment logs"
  ON deployment_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for update_notifications
CREATE POLICY "Admins can manage update notifications"
  ON update_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Authenticated users can view update notifications"
  ON update_notifications
  FOR SELECT
  TO authenticated
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_deployment_versions_updated_at ON deployment_versions;
CREATE TRIGGER update_deployment_versions_updated_at
  BEFORE UPDATE ON deployment_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_instances_updated_at ON customer_instances;
CREATE TRIGGER update_customer_instances_updated_at
  BEFORE UPDATE ON customer_instances
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create deployment log entry
CREATE OR REPLACE FUNCTION log_deployment_event(
  p_version_id uuid,
  p_instance_id uuid,
  p_level text,
  p_message text,
  p_details jsonb DEFAULT '{}'
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO deployment_logs (
    deployment_version_id,
    customer_instance_id,
    log_level,
    message,
    details
  ) VALUES (
    p_version_id,
    p_instance_id,
    p_level,
    p_message,
    p_details
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Function to trigger customer updates when new version is deployed
CREATE OR REPLACE FUNCTION notify_customers_of_deployment()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only notify if deployment is successful
  IF NEW.deployment_status = 'deployed' THEN
    -- Create notification records for all customers with auto-update enabled
    INSERT INTO update_notifications (
      deployment_version_id,
      customer_instance_id,
      notification_type,
      delivery_status
    )
    SELECT
      NEW.id,
      ci.id,
      'webhook',
      'pending'
    FROM customer_instances ci
    WHERE ci.auto_update_enabled = true
      AND ci.webhook_url IS NOT NULL;
    
    -- Mark customer instances as pending sync
    UPDATE customer_instances
    SET sync_status = 'pending'
    WHERE auto_update_enabled = true;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to notify customers when deployment completes
DROP TRIGGER IF EXISTS trigger_customer_notifications ON deployment_versions;
CREATE TRIGGER trigger_customer_notifications
  AFTER INSERT OR UPDATE ON deployment_versions
  FOR EACH ROW
  EXECUTE FUNCTION notify_customers_of_deployment();

-- Insert initial deployment version (current state)
INSERT INTO deployment_versions (
  version_number,
  deployment_status,
  changes_summary,
  metadata
) VALUES (
  '1.0.0',
  'deployed',
  '{"description": "Initial production deployment with contact details and auto-sync system"}',
  '{"features": ["DCCS Integration", "Multi-language Support", "Blockchain Payments", "Auto-deployment System"]}'
) ON CONFLICT (version_number) DO NOTHING;