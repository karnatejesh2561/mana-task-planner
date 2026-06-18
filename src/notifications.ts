import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

export type TaskNotificationPayload = {
  id?: string;
  title: string;
  dueDate?: string;
  dueTime?: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const configureNotificationsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('tasks', {
      name: 'Task updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6D4AFF',
      sound: 'default',
    });
  }

  return Notifications.getPermissionsAsync();
};

export const requestNotificationPermissionAsync = async () => {
  await configureNotificationsAsync();

  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
};

export const notifyTaskCreatedAsync = async (task: TaskNotificationPayload, body: string) => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) return false;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: task.title,
      body,
      data: {
        type: 'task-created',
        task,
      },
      sound: 'default',
    },
    trigger: null,
  });

  return true;
};

export const getExpoPushTokenForBackendAsync = async () => {
  const allowed = await requestNotificationPermissionAsync();
  if (!allowed) return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) return null;

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
};
