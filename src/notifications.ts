import { Platform } from 'react-native';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';
import messaging from '@react-native-firebase/messaging';

import { supabase } from './lib/supabase';

export type TaskNotificationPayload = {
  id?: string;
  title: string;
  dueDate?: string;
  dueTime?: string;
};

export const configureNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'tasks',
      name: 'Task updates',
      importance: AndroidImportance.HIGH,
      lightColor: '#6D4AFF',
    });
  }
};

export const requestNotificationPermissionAsync = async () => {
  await configureNotificationsAsync();
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus === AuthorizationStatus.AUTHORIZED;
};

export const notifyTaskCreatedAsync = async (task: TaskNotificationPayload, body: string) => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) return false;

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
    },
  });

  return true;
};

export const getPushTokenForBackendAsync = async () => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) return null;

  try {
    const token = await messaging().getToken();
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

  return true;
};
