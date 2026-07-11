/*
  # Fix audit_logs event_category — use allowed enum value

  audit_logs.event_category has a CHECK constraint allowing only:
  ('licensing','payment','legal','content','user','admin')

  The previous fix used 'certificate' which is not in that list.
  DCCS certificate events belong to 'content'.
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
    'content',
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
      'content',
      'dccs_certificate',
      NEW.id,
      jsonb_build_object(
        'old_value',      OLD.download_unlocked,
        'new_value',      NEW.download_unlocked,
        'clearance_code', NEW.clearance_code
      )
    );
  END IF;
  RETURN NEW;
END;
$$;
