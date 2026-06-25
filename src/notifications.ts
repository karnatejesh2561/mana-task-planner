import { Platform } from 'react-native';
import notifee, { AndroidImportance, AuthorizationStatus } from '@notifee/react-native';

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
      lightColor: '#FF0000',
      sound: 'default',
    });
  }
};

export const requestNotificationPermissionAsync = async () => {
  await configureNotificationsAsync();
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
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
      sound: 'default',
    },
    ios: {
      sound: 'default',
    },
  });

  return true;
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
