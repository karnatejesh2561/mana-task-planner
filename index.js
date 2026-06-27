/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee from '@notifee/react-native';

try {
    // Handle background messages and show a local notification using notifee.
    const messagingModule = require('@react-native-firebase/messaging');
    const messaging = messagingModule.default ?? messagingModule;

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        try {
            const notification = remoteMessage.notification || {};
            const data = remoteMessage.data || {};
            const title = notification.title || data.title || 'Task reminder';
            const body = notification.body || data.body || `${data.taskTitle || 'You have a task'} at ${data.dueTime || ''}`;
            const image = notification.image || data.image || data.imageUrl;

            await notifee.displayNotification({
                title: String(title),
                body: String(body),
                android: {
                    channelId: 'tasks',
                    sound: 'notification',
                    smallIcon: 'ic_notification',
                    largeIcon: 'ic_notification',
                },
                ios: {
                    sound: 'notification',
                },
                data,
            });
        } catch (e) {
            console.warn('Background message handling failed', e);
        }
    });
} catch (e) {
    console.warn('FCM background handler not registered (firebase not ready)', e?.message || e);
}

AppRegistry.registerComponent(appName, () => App);
