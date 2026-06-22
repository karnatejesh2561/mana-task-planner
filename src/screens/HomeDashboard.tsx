import React from 'react';
import { Alert, Image, View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { Task } from '../types';

interface HomeDashboardProps {
    onNavigate: (screen: string) => void;
    onAddTaskPress: () => void;
    onTaskPress?: (task: Task) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({ onAddTaskPress, onTaskPress }) => {
    const { tasks, user, deleteTask, theme, t } = useApp();
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
            <View style={styles.header}>
                <View style={styles.greetingRow}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&q=80' }}
                        style={styles.profileImage}
                    />
                    <Text style={styles.greeting}>{t('homeGreeting', { name: firstName })}</Text>
                </View>
                <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
                    <Ionicons name="notifications-outline" size={24} color={theme.icon} />
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
                                <Ionicons name={decor.icon as any} size={22} color={decor.color} />
                            </View>

                            <View style={styles.taskCopy}>
                                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                                <View style={styles.dueRow}>
                                    <Ionicons name="time-outline" size={14} color={theme.textSecondary} />
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
        backgroundColor: theme.background,
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
        minHeight: 92,
        backgroundColor: theme.surface,
        borderRadius: 16,
        marginBottom: 14,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: theme.cardShadowOpacity,
        shadowRadius: 22,
        elevation: 3,
    },
    leadingIcon: {
        width: 42,
        height: 42,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    taskCopy: {
        flex: 1,
        minWidth: 0,
    },
    taskTitle: {
        color: theme.text,
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 12,
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
        marginLeft: 12,
    },
    trailingIcon: {
        width: 35,
        height: 35,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    deleteIcon: {
        backgroundColor: theme.dangerBg,
    },
    addButton: {
        position: 'absolute',
        right: 24,
        bottom: 112,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#5851E8',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#5851E8',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 10,
    },
});
