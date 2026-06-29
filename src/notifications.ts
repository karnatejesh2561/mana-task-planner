import { PermissionsAndroid, Platform } from 'react-native';
import notifee, { AndroidImportance, AuthorizationStatus, TriggerType, TimestampTrigger } from '@notifee/react-native';

import { supabase } from './lib/supabase';

export type TaskNotificationPayload = {
  id?: string;
  title: string;
  dueDate?: string;
  dueTime?: string;
};

export const configureNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    const existingChannel = await notifee.getChannel('tasks');
    if (existingChannel) {
      await notifee.deleteChannel('tasks');
    }

    await notifee.createChannel({
      id: 'tasks',
      name: 'Task updates',
      importance: AndroidImportance.HIGH,
      sound: 'notification',
    });
  }
};

export const requestNotificationPermissionAsync = async () => {
  await configureNotificationsAsync();
  const settings = await notifee.requestPermission();

  if (Platform.OS === 'android' && Number(Platform.Version) >= 31) {
    const exactAlarmPermission = (PermissionsAndroid.PERMISSIONS as Record<string, string> | undefined)?.SCHEDULE_EXACT_ALARM;
    if (exactAlarmPermission) {
      const result = await PermissionsAndroid.request(exactAlarmPermission as any);
      if (result !== PermissionsAndroid.RESULTS.GRANTED && result !== PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
        console.warn('Exact alarm permission denied; scheduled reminders may not fire');
      }
    }
  }

  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
};

export const notifyTaskCreatedAsync = async (task: TaskNotificationPayload, body: string) => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) {
    console.warn('Notification permission denied for task creation');
    return false;
  }

  try {
    await notifee.displayNotification({
      title: task.title,
      body,
      data: {
        type: 'task-created',
        task: JSON.stringify(task),
      },
      android: {
        channelId: 'tasks',
        pressAction: {
          id: 'default',
        },
        sound: 'notification',
        smallIcon: 'ic_notification',
        largeIcon: 'ic_notification',
      },
      ios: {
        sound: 'notification',
      },
    });
    console.log('Local task-created notification displayed', task.title);
    return true;
  } catch (error) {
    console.warn('Local task-created notification failed', error);
    return false;
  }
};

export const notifyTaskDeletedAsync = async (task: TaskNotificationPayload, body: string) => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) {
    console.warn('Notification permission denied for task deletion');
    return false;
  }

  try {
    await notifee.displayNotification({
      title: task.title,
      body,
      data: {
        type: 'task-deleted',
        task: JSON.stringify(task),
      },
      android: {
        channelId: 'tasks',
        pressAction: {
          id: 'default',
        },
        sound: 'notification',
        smallIcon: 'ic_notification',   
      },
      ios: {
        sound: 'notification',
      },
    });
    console.log('Local task-deleted notification displayed', task.title);
    return true;
  } catch (error) {
    console.warn('Local task-deleted notification failed', error);
    return false;
  }
};

export const notifyTaskCompletedAsync = async (task: TaskNotificationPayload, body: string) => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) {
    console.warn('Notification permission denied for task completion');
    return false;
  }

  try {
    await notifee.displayNotification({
      title: task.title,
      body,
      data: {
        type: 'task-completed',
        task: JSON.stringify(task),
      },
      android: {
        channelId: 'tasks',
        pressAction: {
          id: 'default',
        },
        sound: 'notification',
        smallIcon: 'ic_notification',
      },
      ios: {
        sound: 'notification',
      },
    });
    console.log('Local task-completed notification displayed', task.title);
    return true;
  } catch (error) {
    console.warn('Local task-completed notification failed', error);
    return false;
  }
};

const parseLocalDateTimeToTimestamp = (dueDate: string | undefined, dueTime: string | undefined) => {
  if (!dueDate || !dueTime) return null;

  const [year, month, day] = dueDate.split('-').map(Number);
  const [hour, minute, second = 0] = dueTime.split(':').map(Number);
  if ([year, month, day, hour, minute].some(value => Number.isNaN(value))) return null;

  const localDate = new Date(year, month - 1, day, hour, minute, second);
  if (Number.isNaN(localDate.getTime())) return null;
  return localDate.getTime();
};

export const getReminderSchedule = (dueDate: string | undefined, dueTime: string | undefined, reminderMinutes: number) => {
  const baseTimestamp = parseLocalDateTimeToTimestamp(dueDate, dueTime);
  if (!baseTimestamp) {
    return { reminderTimestamp: null, dueTimestamp: null };
  }

  const reminderTimestamp = baseTimestamp - Math.max(reminderMinutes, 0) * 60000;
  return {
    reminderTimestamp: Number.isFinite(reminderTimestamp) ? reminderTimestamp : null,
    dueTimestamp: Number.isFinite(baseTimestamp) ? baseTimestamp : null,
  };
};

export const upsertTaskReminderRecordAsync = async (
  taskId: string,
  userId: string,
  dueDate: string | undefined,
  dueTime: string | undefined,
  reminderMinutes: number,
) => {
  if (!taskId || !userId || !supabase) return false;

  const { reminderTimestamp, dueTimestamp } = getReminderSchedule(dueDate, dueTime, reminderMinutes);
  const now = Date.now();
  const scheduledFor = reminderTimestamp && reminderTimestamp > now
    ? reminderTimestamp
    : dueTimestamp && dueTimestamp > now
      ? dueTimestamp
      : null;

  if (!scheduledFor) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('task_notifications')
      .upsert(
        {
          task_id: taskId,
          user_id: userId,
          scheduled_for: new Date(scheduledFor).toISOString(),
          status: 'pending',
          sent_at: null,
          error_message: null,
        },
        { onConflict: 'task_id' },
      );

    if (error) {
      console.warn('Unable to persist reminder record', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Unable to persist reminder record', error);
    return false;
  }
};

const getReminderNotificationId = (taskId: string) => `${taskId}-reminder`;
const getDueNotificationId = (taskId: string) => `${taskId}-due`;

export const acceptTaskNotificationAsync = async (taskId: string) => {
  if (!taskId || !supabase) return false;
  try {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)
      .eq('status', 'pending');

    if (error) {
      console.warn('Accept task notification failed', error.message);
      return false;
    }

    await notifee.cancelNotification(getDueNotificationId(taskId));
    await notifee.cancelNotification(getReminderNotificationId(taskId));
    await notifee.cancelNotification(taskId);
    return true;
  } catch (error) {
    console.warn('Accept task notification failed', error);
    return false;
  }
};

export const cancelScheduledReminderAsync = async (taskId: string) => {
  try {
    await notifee.cancelNotification(getDueNotificationId(taskId));
    await notifee.cancelNotification(getReminderNotificationId(taskId));
    await notifee.cancelNotification(taskId);
    return true;
  } catch (error) {
    console.warn('Cancel scheduled reminder failed', error);
    return false;
  }
};

export const scheduleTaskReminderAsync = async (
  task: TaskNotificationPayload & { id: string },
  body: string,
  reminderMinutes: number,
) => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) {
    console.warn('Notification permission not granted — skipping local Notifee scheduling for', task.id);
    return false;
  }

  const { reminderTimestamp, dueTimestamp } = getReminderSchedule(task.dueDate, task.dueTime, reminderMinutes);
  const now = Date.now();

  console.log('Scheduling reminder:', { taskId: task.id, dueDate: task.dueDate, dueTime: task.dueTime, reminderMinutes, reminderTimestamp: reminderTimestamp ? new Date(reminderTimestamp).toISOString() : null, dueTimestamp: dueTimestamp ? new Date(dueTimestamp).toISOString() : null, now: new Date(now).toISOString() });

  if ((!reminderTimestamp || reminderTimestamp <= now) && (!dueTimestamp || dueTimestamp <= now)) {
    console.warn('Not scheduling: reminder and due timestamps are in the past or invalid for task', task.id);
    return false;
  }

  try {
    await notifee.cancelNotification(getDueNotificationId(task.id));
    await notifee.cancelNotification(getReminderNotificationId(task.id));
    await notifee.cancelNotification(task.id);

    if (reminderTimestamp && reminderTimestamp > now) {
      const reminderTrigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: reminderTimestamp,
        alarmManager: true,
      };

      await notifee.createTriggerNotification(
        {
          id: getReminderNotificationId(task.id),
          title: task.title,
          body,
          data: {
            type: 'task-reminder',
            taskId: task.id,
            dueDate: task.dueDate || '',
            dueTime: task.dueTime || '',
          },
          android: {
            channelId: 'tasks',
            pressAction: {
              id: 'default',
            },
            sound: 'default',
            smallIcon: 'ic_notification',
          },
          ios: {
            sound: 'default',
          },
        },
        reminderTrigger,
      );

      console.log('Scheduled task reminder', getReminderNotificationId(task.id), new Date(reminderTimestamp).toISOString());
    }

    if (dueTimestamp && dueTimestamp > now) {
      const dueTrigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: dueTimestamp,
        alarmManager: true,
      };

      await notifee.createTriggerNotification(
        {
          id: getDueNotificationId(task.id),
          title: task.title,
          body: `Your task is due at ${task.dueTime || ''}. Tap Accept to complete.`,
          data: {
            type: 'task-due',
            taskId: task.id,
            dueDate: task.dueDate || '',
            dueTime: task.dueTime || '',
          },
          android: {
            channelId: 'tasks',
            pressAction: {
              id: 'default',
            },
            actions: [{
              title: 'Accept',
              pressAction: {
                id: 'accept',
              },
            }],
            sound: 'default',
            smallIcon: 'ic_notification',
          },
          ios: {
            sound: 'default',
          },
        },
        dueTrigger,
      );

      console.log('Scheduled task due notification', getDueNotificationId(task.id), new Date(dueTimestamp).toISOString());
    }

    return true;
  } catch (error) {
    console.warn('Schedule task reminder failed', error);
    return false;
  }
};

// Small helper to increment bell count on create via AppContext. Kept here to centralize notification behavior.

export const getPushTokenForBackendAsync = async () => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) return null;

  try {
    const messagingModule = await import('@react-native-firebase/messaging');
    const messaging = messagingModule.default ?? messagingModule;

    if (typeof messaging().registerDeviceForRemoteMessages === 'function') {
      try {
        await messaging().registerDeviceForRemoteMessages();
      } catch (registrationError) {
        console.warn('Remote messages registration failed', registrationError);
      }
    }

    const isSupportedFn = (messaging as any).isSupported;
    if (typeof isSupportedFn === 'function') {
      const isSupported = await isSupportedFn.call(messaging);
      if (!isSupported) return null;
    }

    const token = await messaging().getToken();
    console.log('Fetched FCM token for backend sync:', token ? token.substring(0, 8) + '...' : null);
    return token;
  } catch (e) {
    console.warn('FCM token fetch failed', e);
    return null;
  }
};

export const syncPushTokenToBackendAsync = async (userId: string) => {
  if (!supabase || !userId) return false;

  const token = await getPushTokenForBackendAsync();
  if (!token) return false;

  const { error } = await supabase
    .from('fcm_tokens')
    .upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: 'token',
      },
    );

  if (error) {
    console.warn('Unable to sync FCM token', error.message);
    return false;
  }

  console.log('FCM token synced to backend for user', userId);
  return true;
};
