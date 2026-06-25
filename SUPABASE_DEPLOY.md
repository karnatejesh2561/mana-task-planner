Setup and deployment notes for Push Reminders

1) Environment variables (edge function)
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- FCM_SERVICE_ACCOUNT_JSON (JSON string or base64)
- NOTIFICATION_IMAGE_URL (optional; we set to your public SVG by default)
- CRON_SECRET (optional but recommended)

2) Upload notification image
- You already uploaded logo at:
  https://ztvmhrtpijevlujttegx.supabase.co/storage/v1/object/public/bucket/logo-m.png
- If you want a PNG instead (recommended for Android largeIcon), upload PNG to same bucket and set NOTIFICATION_IMAGE_URL accordingly.

3) Deploy edge function
- From Supabase dashboard, create/update function `send-task-reminders` with the edited source.
- Add environment variables above in the function settings.

4) Schedule automatic runs
- Option A (recommended): Use GitHub Actions workflow `.github/workflows/send-task-reminders.yml`.
  - Set repo secrets `SUPABASE_SEND_TASK_REMINDERS_URL` (function invoke URL) and `CRON_SECRET` (value set for function).
  - Workflow runs every 5 minutes and will trigger pending reminders.
- Option B: Use any external cron/job to POST to the function with header `Authorization: Bearer <CRON_SECRET>`.

5) Testing
- Create a task due in a few minutes with your user having `default_reminder_minutes` set to desired offset.
- Confirm `task_notifications` row scheduled_for equals `due_at - default_reminder_minutes`.
- In app, create a task; the client will call the edge function with `forceSend: true` to attempt immediate delivery.
- Or call the function manually:

  curl -X POST "<FUNCTION_URL>" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <CRON_SECRET>" \
    -d '{"taskId":"<TASK_ID>", "forceSend": true}'

6) Client behavior
- App registers FCM token and syncs to `fcm_tokens` table.
- App displays incoming remote notifications using `notifee` (foreground and background).

7) Notes
- Android smallIcon must be a resource name bundled with the app to show in status bar; remote image is used as large/big picture.
- Ensure `FCM_SERVICE_ACCOUNT_JSON` has `firebase.messaging` scope permissions.
