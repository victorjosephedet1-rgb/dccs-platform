/*
  # Deployment Pipeline Helper Functions

  Adds the increment_health_check_count RPC used by the
  deploy-health-monitor edge function.
*/

CREATE OR REPLACE FUNCTION increment_health_check_count(p_run_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE deployment_runs
  SET health_check_count = health_check_count + 1
  WHERE id = p_run_id;
END;
$$;
