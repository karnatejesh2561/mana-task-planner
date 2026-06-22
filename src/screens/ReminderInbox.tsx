import React from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { AppTheme, useApp } from '../AppContext';
import { assertSupabaseConfigured } from '../lib/supabase';
import { glassButton, glassPanel } from '../theme/glass';

interface ReminderInboxProps {
    onBack: () => void;
}

type ReminderRow = {
    id: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    scheduled_for: string;
    tasks: {
        title: string;
        due_date: string;
        due_time: string;
    } | null;
};

type ReminderRowRaw = {
    id: string;
    status: 'pending' | 'sent' | 'failed' | 'cancelled';
    scheduled_for: string;
    tasks: { title: string; due_date: string; due_time: string }[] | { title: string; due_date: string; due_time: string } | null;
};

const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
};

export const ReminderInbox: React.FC<ReminderInboxProps> = ({ onBack }) => {
    const { theme, user, refreshNotificationBellCount } = useApp();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const [items, setItems] = React.useState<ReminderRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);

    const loadReminders = React.useCallback(async () => {
        if (!user) {
            setItems([]);
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            const client = assertSupabaseConfigured();
            const { data, error } = await client
                .from('task_notifications')
                .select('id, status, scheduled_for, tasks(title, due_date, due_time)')
                .eq('user_id', user.id)
                .order('scheduled_for', { ascending: false })
                .limit(100);

            if (error) throw error;
            const normalized = ((data || []) as ReminderRowRaw[]).map(item => ({
                id: item.id,
                status: item.status,
                scheduled_for: item.scheduled_for,
                tasks: Array.isArray(item.tasks) ? (item.tasks[0] || null) : item.tasks,
            }));
            setItems(normalized);
            await refreshNotificationBellCount(user.id);
        } catch (error) {
            console.warn('Unable to load reminders', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshNotificationBellCount, user]);

    React.useEffect(() => {
        void loadReminders();
    }, [loadReminders]);

    if (loading) {
        return (
            <View style={styles.centerScreen}>
                <ActivityIndicator size="small" color={theme.electricBlue} />
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <LinearGradient
                colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.82}>
                    <Ionicons name="chevron-back" size={24} color={theme.orangeAccent} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reminders</Text>
                <View style={styles.backButton} />
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.id}
                contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => {
                            setRefreshing(true);
                            void loadReminders();
                        }}
                        tintColor={theme.electricBlue}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Ionicons name="notifications-off-outline" size={28} color={theme.orangeAccent} />
                        <Text style={styles.emptyTitle}>No reminders yet</Text>
                        <Text style={styles.emptySub}>Create a task with due date and time to see reminders here.</Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const title = item.tasks?.title || 'Task reminder';
                    const dueText = item.tasks ? `${item.tasks.due_date} ${item.tasks.due_time}` : 'No task info';
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardTopRow}>
                                <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
                                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                            </View>
                            <Text style={styles.cardMeta}>Scheduled: {formatDateTime(item.scheduled_for)}</Text>
                            <Text style={styles.cardMeta}>Due: {dueText}</Text>
                        </View>
                    );
                }}
            />
        </View>
    );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    centerScreen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
    header: {
        paddingTop: 56,
        paddingBottom: 14,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        ...glassButton(theme, false, { borderRadius: 20 }),
    },
    headerTitle: {
        color: theme.text,
        fontSize: 18,
        fontWeight: '800',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
        paddingTop: 8,
    },
    card: {
        ...glassPanel(theme, { borderRadius: 18 }),
        padding: 14,
        marginBottom: 10,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    cardTitle: {
        color: theme.text,
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    statusText: {
        color: theme.electricBlue,
        fontSize: 11,
        fontWeight: '800',
    },
    cardMeta: {
        marginTop: 6,
        color: theme.textSecondary,
        fontSize: 12,
        fontWeight: '500',
    },
    emptyList: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    emptyWrap: {
        alignItems: 'center',
    },
    emptyTitle: {
        marginTop: 10,
        color: theme.text,
        fontSize: 17,
        fontWeight: '700',
    },
    emptySub: {
        marginTop: 6,
        color: theme.textSecondary,
        fontSize: 13,
        textAlign: 'center',
    },
});
