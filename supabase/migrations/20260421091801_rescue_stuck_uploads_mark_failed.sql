/*
  # Rescue Stuck Uploads

  ## Problem
  19 upload records are permanently stuck at upload_status = 'uploading'
  with no file_url and no dccs_certificate_id. These were created before
  the trigger chain was fixed. They can never complete because:
  1. The storage files may or may not exist (no way to verify without the client)
  2. The DCCS trigger would need to be re-fired manually
  3. Users see an empty downloads page and have no feedback

  ## Fix
  Mark all stuck uploads as 'failed' with a clear error_message so:
  - They no longer pollute upload counts
  - Users can see what happened if they query failed records
  - The downloads page (which only shows 'completed') is unaffected
  - Users can simply re-upload their files now that the system works

  Note: We only touch records with no file_url AND no dccs_certificate_id,
  which confirms they never successfully completed storage upload either.
*/

UPDATE uploads
SET
  upload_status = 'failed',
  error_message = 'Upload did not complete due to a platform configuration issue that has since been resolved. Please re-upload your file.'
WHERE
  upload_status = 'uploading'
  AND file_url IS NULL
  AND dccs_certificate_id IS NULL;
