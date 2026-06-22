import React from 'react';
import { Alert, Image, View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { Task } from '../types';
import { glassButton, glassSurface, glowShadow } from '../theme/glass';

interface HomeDashboardProps {
    onNavigate: (screen: string) => void;
    onAddTaskPress: () => void;
    onTaskPress?: (task: Task) => void;
    onBellPress?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onAddTaskPress, onTaskPress, onBellPress }) => {
    const { tasks, user, deleteTask, theme, t, notificationBellCount, refreshNotificationBellCount } = useApp();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const taskDecor = React.useMemo(() => [
        { color: '#6D5DF6', bg: theme.scheme === 'dark' ? 'rgba(109,93,246,0.18)' : '#F0ECFF', icon: 'calendar-outline' },
        { color: '#E8A025', bg: theme.scheme === 'dark' ? 'rgba(232,160,37,0.18)' : '#FFF4DC', icon: 'briefcase-outline' },
        { color: '#2E8BDF', bg: theme.scheme === 'dark' ? 'rgba(46,139,223,0.18)' : '#E8F3FF', icon: 'chatbubble-ellipses-outline' },
        { color: '#39A96B', bg: theme.scheme === 'dark' ? 'rgba(57,169,107,0.18)' : '#EAF8EF', icon: 'barbell-outline' },
        { color: '#9A7BFF', bg: theme.scheme === 'dark' ? 'rgba(154,123,255,0.18)' : '#F1EAFE', icon: 'book-outline' },
    ], [theme.scheme]);
    const listTasks = tasks.filter(task => !task.id.startsWith('c-')).slice(0, 5);
    const firstName = user?.name?.split(' ')[0] || 'Hemanth';

    React.useEffect(() => {
        void refreshNotificationBellCount();
        // refresh when task list changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks.length]);

    React.useEffect(() => {
        const timer = setInterval(() => {
            void refreshNotificationBellCount();
        }, 30000);

        return () => clearInterval(timer);
        // keep bell count fresh while home screen is open
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleDeleteTask = (task: Task) => {
        Alert.alert(
            t('deleteTask'),
            t('deleteTaskMessage', { title: task.title }),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('delete'),
                    style: 'destructive',
                    onPress: () => {
                        void deleteTask(task.id);
                    },
                },
            ],
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <View style={styles.header}>
                <View style={styles.greetingRow}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&q=80' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.greeting}>{t('homeGreeting', { name: firstName })}</Text>
                </View>
                <TouchableOpacity style={styles.iconButton} activeOpacity={0.8} onPress={onBellPress}>
                    <Ionicons name="notifications-outline" size={24} color={theme.orangeAccent} />
                    {notificationBellCount > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{notificationBellCount > 9 ? '9+' : `${notificationBellCount}`}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.titleRow}>
                <View>
                    <Text style={styles.sectionTitle}>{t('myTasks')}</Text>
                    <Text style={styles.dateText}>{t('todayDate')}</Text>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.taskList}
            >
                {listTasks.map((task, index) => {
                    const decor = taskDecor[index % taskDecor.length];

                    return (
                        <TouchableOpacity
                            key={task.id}
                            style={styles.taskCard}
                            activeOpacity={0.85}
                            onPress={() => onTaskPress?.(task)}
                        >
                            <View style={[styles.leadingIcon, { backgroundColor: decor.bg }]}>
                                <Ionicons name={decor.icon as any} size={22} color={theme.orangeAccent} />
                            </View>

                            <View style={styles.taskCopy}>
                                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                <View style={styles.dueRow}>
                                    <Ionicons name="time-outline" size={14} color={theme.orangeAccent} />
                                    <Text style={styles.dueText} numberOfLines={1}>{t('dueTodayAt', { time: task.dueTime })}</Text>
                                </View>
                            </View>

                            <View style={styles.actionGroup}>
                                <TouchableOpacity
                                    style={[styles.trailingIcon, { backgroundColor: decor.bg }]}
                                    onPress={() => onTaskPress?.(task)}
                                    activeOpacity={0.82}
                                >
                                    <Ionicons name="pencil-outline" size={16} color={decor.color} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.trailingIcon, styles.deleteIcon]}
                                    onPress={() => handleDeleteTask(task)}
                                    activeOpacity={0.82}
                                >
                                    <Ionicons name="trash-outline" size={16} color="#CF3333" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={onAddTaskPress} activeOpacity={0.86}>
                <Ionicons name="add" size={36} color="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
        paddingTop: 58,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
    },
    greeting: {
        flex: 1,
        color: theme.text,
        fontSize: 22,
        fontWeight: '800',
    },
    greetingRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        minWidth: 0,
    },
    profileImage: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
        backgroundColor: theme.avatarBg,
    },
    iconButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...glassButton(theme, false, { borderRadius: 21 }),
    },
    badge: {
        position: 'absolute',
        top: 3,
        right: 2,
        minWidth: 17,
        height: 17,
        borderRadius: 9,
        paddingHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EF4444',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        marginTop: 48,
    },
    sectionTitle: {
        color: theme.text,
        fontSize: 24,
        fontWeight: '800',
        marginBottom: 20,
    },
    dateText: {
        color: theme.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    taskList: {
        paddingHorizontal: 22,
        paddingTop: 18,
        paddingBottom: 118,
    },
    taskCard: {
        minHeight: 80,
        ...glassSurface(theme, 'regular', { borderRadius: 18 }),
        marginBottom: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leadingIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    taskCopy: {
        flex: 1,
        minWidth: 0,
    },
    taskTitle: {
        color: theme.text,
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 4,
    },
    dueRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dueText: {
        color: theme.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 5,
    },
    actionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    trailingIcon: {
        width: 35,
        height: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: theme.glassBorder,
    },
    deleteIcon: {
        backgroundColor: theme.dangerBg,
    },
    addButton: {
        position: 'absolute',
        right: 24,
        bottom: 112,
        width: 65,
        height: 65,
        borderRadius: 32.5,
        backgroundColor: theme.orangeAccent,
        alignItems: 'center',
        justifyContent: 'center',
        ...glowShadow(theme, theme.orangeAccent, 0.35),
    },
});
