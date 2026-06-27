// @ts-nocheck
// @ts-ignore Deno remote import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
// @ts-ignore Deno npm import
import { JWT } from 'npm:google-auth-library';

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

type PendingNotification = {
  id: string;
  task_id: string;
  user_id: string;
  scheduled_for: string;
  tasks: {
    title: string;
    due_date: string;
    due_time: string;
  } | null;
};

const jsonHeaders = { 'Content-Type': 'application/json' };

// @ts-ignore Deno global available in edge runtime
const getEnv = (name: string) => {
  const value = Deno.env.get(name)?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const getGoogleAccessToken = async (serviceAccount: ServiceAccount) => {
  const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });

  const tokens = await client.authorize();
  if (!tokens.access_token) throw new Error('Unable to mint Google access token.');
  return tokens.access_token;
};

const parseServiceAccount = (rawValue: string): ServiceAccount => {
  try {
    return JSON.parse(rawValue) as ServiceAccount;
  } catch {
    // Support base64-encoded secret values to avoid shell quoting issues.
    const decoded = atob(rawValue);
    return JSON.parse(decoded) as ServiceAccount;
  }
};

const sendFcmMessage = async (
  accessToken: string,
  projectId: string,
  token: string,
  notification: { title: string; body: string },
  data: Record<string, string>,
  imageUrl?: string | null,
) => {
  const bodyPayload: any = {
    message: {
      token,
      notification,
      android: {
        notification: {
          channel_id: 'tasks',
          sound: 'notification',
          default_sound: true,
          default_vibrate_timings: true,
        },
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            sound: 'notification',
          },
        },
      },
      data,
    },
  };

  if (imageUrl) {
    // Attach image for FCM/Android notification and APNS fcm_options
    bodyPayload.message.android.notification.image = imageUrl;
    bodyPayload.message.notification = { ...bodyPayload.message.notification, image: imageUrl };
    bodyPayload.message.apns.fcm_options = { image: imageUrl };
  }

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...jsonHeaders,
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(errorBody || `FCM request failed with ${response.status}`);
  }
};

// @ts-ignore Deno global available in edge runtime
Deno.serve(async (req: Request) => {
  try {
    const cronSecret = Deno.env.get('CRON_SECRET');
    if (cronSecret) {
      const authHeader = req.headers.get('Authorization');
      if (authHeader !== `Bearer ${cronSecret}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jsonHeaders });
      }
    }

    const supabaseUrl = getEnv('SUPABASE_URL');
    const supabaseServiceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const serviceAccount = parseServiceAccount(getEnv('FCM_SERVICE_ACCOUNT_JSON'));
    const accessToken = await getGoogleAccessToken(serviceAccount);
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const requestBody = req.method === 'POST'
      ? await req
          .text()
          .then(body => (body?.trim() ? JSON.parse(body) : {}))
          .catch(() => ({}))
      : {};
    const batchSize = Number(requestBody.batchSize || 50);
    const targetTaskId = requestBody.taskId || null;
    const forceSend = Boolean(requestBody.forceSend === true || requestBody.forceSend === 'true');
    const providedImageUrl = requestBody.imageUrl || null;

    // Resolve notification image URL: prefer provided, then env var, then user-provided public URL, then storage fallback.
    const envImageUrl = Deno.env.get('NOTIFICATION_IMAGE_URL')?.trim() || null;
    const userProvidedDefault = 'https://ztvmhrtpijevlujttegx.supabase.co/storage/v1/object/public/bucket/logo-m.svg';
    const fallbackStorageImage = `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/assets/logo-m.svg`;
    const resolvedImageUrl = providedImageUrl || envImageUrl || userProvidedDefault || fallbackStorageImage;

    let query = supabase
      .from('task_notifications')
      .select('id, task_id, user_id, scheduled_for, tasks(title, due_date, due_time)')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true })
      .limit(batchSize);

    if (targetTaskId) {
      // If specific task requested, limit to that task's notification(s)
      // Respect scheduling unless forceSend is requested.
      query = supabase
        .from('task_notifications')
        .select('id, task_id, user_id, scheduled_for, tasks(title, due_date, due_time)')
        .eq('status', 'pending')
        .eq('task_id', targetTaskId)
        .limit(50);
      if (!forceSend) query = query.lte('scheduled_for', new Date().toISOString());
    } else {
      query = query.lte('scheduled_for', new Date().toISOString());
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    const items = (notifications || []) as PendingNotification[];
    let sent = 0;
    let failed = 0;

    for (const item of items) {
      const title = item.tasks?.title || 'Task reminder';
      const body = item.tasks
        ? `${title} is due on ${item.tasks.due_date} at ${item.tasks.due_time}.`
        : 'You have a task reminder.';

      const { data: tokens, error: tokenError } = await supabase
        .from('fcm_tokens')
        .select('id, token')
        .eq('user_id', item.user_id);

      if (tokenError) {
        failed += 1;
        await supabase
          .from('task_notifications')
          .update({ status: 'failed', error_message: tokenError.message })
          .eq('id', item.id);
        continue;
      }

      let delivered = 0;
      let lastError = '';

      for (const tokenRecord of tokens || []) {
        try {
          await sendFcmMessage(
            accessToken,
            serviceAccount.project_id,
            tokenRecord.token,
            { title, body },
            {
                taskId: item.task_id,
                notificationId: item.id,
                type: 'task-reminder',
                dueDate: item.tasks?.due_date || '',
                dueTime: item.tasks?.due_time || '',
              },
            resolvedImageUrl,
          );
          delivered += 1;
        } catch (sendError) {
          lastError = sendError instanceof Error ? sendError.message : 'Unknown FCM error';
          if (lastError.includes('UNREGISTERED')) {
            await supabase.from('fcm_tokens').delete().eq('id', tokenRecord.id);
          }
        }
      }

      if (delivered > 0) {
        sent += 1;
        await supabase
          .from('task_notifications')
          .update({ status: 'sent', sent_at: new Date().toISOString(), error_message: null })
          .eq('id', item.id);
      } else {
        failed += 1;
        await supabase
          .from('task_notifications')
          .update({ status: 'failed', error_message: lastError || 'No FCM tokens available' })
          .eq('id', item.id);
      }
    }

    return new Response(JSON.stringify({ processed: items.length, sent, failed }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: jsonHeaders });
  }
});
