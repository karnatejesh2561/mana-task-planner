import React from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useApp } from '../AppContext';
import { assertSupabaseConfigured } from '../lib/supabase';

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
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Today, ${time}`;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` • ${time}`;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; bgDark: string; icon: string; label: string }> = {
    pending: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', bgDark: 'rgba(245,158,11,0.20)', icon: 'time-outline', label: 'Pending' },
    sent: { color: '#22C55E', bg: 'rgba(34,197,94,0.10)', bgDark: 'rgba(34,197,94,0.18)', icon: 'checkmark-circle-outline', label: 'Sent' },
    failed: { color: '#EF4444', bg: 'rgba(239,68,68,0.10)', bgDark: 'rgba(239,68,68,0.18)', icon: 'close-circle-outline', label: 'Failed' },
    cancelled: { color: '#6B7280', bg: 'rgba(107,114,128,0.10)', bgDark: 'rgba(107,114,128,0.18)', icon: 'ban-outline', label: 'Cancelled' },
};

export const ReminderInbox: React.FC<ReminderInboxProps> = ({ onBack }) => {
    const { theme, colorScheme, user, notificationSettings, refreshNotificationBellCount, markNotificationsAsSeen } = useApp();
    const isDark = colorScheme === 'dark';

    const [items, setItems] = React.useState<ReminderRow[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [refreshing, setRefreshing] = React.useState(false);
    const [snoozingIds, setSnoozingIds] = React.useState<string[]>([]);

    const screenBg = isDark ? '#081220' : '#F0F4FF';

    const handleSnoozeReminder = async (item: ReminderRow) => {
        if (!user) return;
        const snoozeMinutes = notificationSettings.snoozeMinutes;
        const snoozedAt = new Date(Date.now() + snoozeMinutes * 60000).toISOString();

        setSnoozingIds(prev => [...prev, item.id]);
        try {
            const client = assertSupabaseConfigured();
            const { error } = await client
                .from('task_notifications')
                .update({ scheduled_for: snoozedAt, status: 'pending' })
                .eq('id', item.id)
                .eq('user_id', user.id);
            if (error) throw error;
            await loadReminders();
            await refreshNotificationBellCount(user.id);
            Alert.alert('Reminder Snoozed', `Snoozed for ${snoozeMinutes} minute${snoozeMinutes === 1 ? '' : 's'}.`);
        } catch (err) {
            console.warn('Unable to snooze reminder', err);
            Alert.alert('Reminder Snooze Failed', 'Unable to snooze this reminder.');
        } finally {
            setSnoozingIds(prev => prev.filter(id => id !== item.id));
        }
    };
    const cardBg = isDark ? '#0F1D2E' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';

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
        } catch (err) {
            console.warn('Unable to load reminders', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [refreshNotificationBellCount, user]);

    React.useEffect(() => {
        const initialize = async () => {
            await loadReminders();
            markNotificationsAsSeen();
        };

        void initialize();
    }, [loadReminders, markNotificationsAsSeen]);

    // ── Stats bar counts
    const counts = React.useMemo(() => ({
        pending: items.filter(i => i.status === 'pending').length,
        sent: items.filter(i => i.status === 'sent').length,
        failed: items.filter(i => i.status === 'failed').length,
        cancelled: items.filter(i => i.status === 'cancelled').length,
    }), [items]);

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: screenBg, alignItems: 'center', justifyContent: 'center' }}>
                <LinearGradient
                    colors={isDark ? ['#081220', '#0D1825', '#132438'] : ['#F7FAFF', '#FFFFFF', '#F0F4FF']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                />
                <ActivityIndicator size="small" color="#0A66FF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: screenBg }}>
            {/* Background */}
            <LinearGradient
                colors={isDark ? ['#081220', '#0D1825', '#132438'] : ['#F7FAFF', '#FFFFFF', '#F0F4FF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            {!isDark && (
                <Image
                    source={require('../../assets/background-image.png')}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.35 }}
                    resizeMode="cover"
                />
            )}

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backBtn, {
                        backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                    }]}
                    onPress={onBack}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Reminder Inbox</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        {items.length} scheduled reminder{items.length !== 1 ? 's' : ''}
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <FlatList
                data={items}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.listContent,
                    items.length === 0 && styles.emptyContent,
                ]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => { setRefreshing(true); void loadReminders(); }}
                        tintColor="#0A66FF"
                    />
                }
                ListHeaderComponent={items.length > 0 ? (
                    // ── Stats Summary Row ──
                    <View style={styles.statsRow}>
                        {[
                            { key: 'sent', count: counts.sent },
                            { key: 'pending', count: counts.pending },
                            { key: 'failed', count: counts.failed },
                        ].map(({ key, count }, index) => {
                            const cfg = STATUS_CONFIG[key];
                            return (
                                <View
                                    key={key}
                                    style={[
                                        styles.statCard,
                                        index < 2 && styles.statCardSpacing,
                                        {
                                            backgroundColor: isDark ? cfg.bgDark : cfg.bg,
                                            borderColor: isDark ? `${cfg.color}33` : `${cfg.color}22`,
                                        },
                                    ]}
                                >
                                    <Ionicons name={cfg.icon as any} size={18} color={cfg.color} />
                                    <Text style={[styles.statCount, { color: cfg.color }]}>{count}</Text>
                                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{cfg.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                ) : null}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <View style={[styles.emptyIconBox, {
                            backgroundColor: isDark ? 'rgba(10,102,255,0.12)' : 'rgba(10,102,255,0.08)',
                        }]}>
                            <Ionicons name="notifications-off-outline" size={32} color="#0A66FF" />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.text }]}>No reminders yet</Text>
                        <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                            Create a task with due date and time{'\n'}to see reminders here.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => {
                    const cfg = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
                    const title = item.tasks?.title || 'Task reminder';

                    return (
                        <View style={[
                            styles.card,
                            {
                                backgroundColor: cardBg,
                                borderColor: cardBorder,
                                shadowColor: isDark ? '#000' : '#0A66FF',
                                shadowOpacity: isDark ? 0.20 : 0.06,
                            },
                        ]}>
                            {/* Left accent bar */}
                            <View style={[styles.cardAccent, { backgroundColor: cfg.color }]} />

                            {/* Icon */}
                            <View style={[styles.cardIconBox, {
                                backgroundColor: isDark ? cfg.bgDark : cfg.bg,
                            }]}>
                                <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
                            </View>

                            {/* Content */}
                            <View style={styles.cardBody}>
                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={2}>
                                    {title}
                                </Text>
                                <Text style={[styles.cardTime, { color: theme.textSecondary }]}>
                                    {formatDateTime(item.scheduled_for)}
                                </Text>
                                {item.tasks && (
                                    <Text style={[styles.cardDue, { color: theme.textSecondary }]} numberOfLines={1}>
                                        Due {item.tasks.due_date}
                                        {item.tasks.due_time ? ` • ${item.tasks.due_time}` : ''}
                                    </Text>
                                )}
                            </View>

                            {/* Footer: status badge left, actions right */}
                            <View style={styles.cardFooter}>
                                <View style={[styles.statusBadge, {
                                    backgroundColor: isDark ? cfg.bgDark : cfg.bg,
                                    borderColor: isDark ? `${cfg.color}44` : `${cfg.color}33`,
                                }]}>
                                    <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
                                </View>

                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 12,
        paddingHorizontal: 18,
    },
    backBtn: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flex: 1,
        paddingLeft: 14,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: -0.4,
        marginBottom: 1,
    },
    headerSubtitle: {
        fontSize: 12,
        fontWeight: '400',
    },
    headerSpacer: { width: 42 },

    listContent: {
        paddingHorizontal: 18,
        paddingTop: 8,
        paddingBottom: 120,
    },
    emptyContent: {
        flexGrow: 1,
        justifyContent: 'center',
    },

    // Stats Row
    statsRow: {
        flexDirection: 'row',
        marginBottom: 18,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
    },
    statCardSpacing: {
        marginRight: 10,
    },
    statCount: {
        fontSize: 18,
        fontWeight: '800',
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Reminder Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 10,
        elevation: 3,
    },
    cardAccent: {
        width: 4,
        alignSelf: 'stretch',
    },
    cardIconBox: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        marginVertical: 12,
    },
    cardBody: {
        flex: 1,
        minWidth: 0,
        marginLeft: 12,
        marginVertical: 12,
        marginRight: 8,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 3,
    },
    cardTime: {
        fontSize: 12,
        fontWeight: '500',
        marginBottom: 2,
    },
    cardDue: {
        fontSize: 11,
        fontWeight: '400',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        marginRight: 12,
        flexShrink: 0,
        alignSelf: 'center',
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },

    cardActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginRight: 12,
        flexShrink: 0,
        alignSelf: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        backgroundColor: '#0A66FF',
    },
    actionButtonDisabled: {
        opacity: 0.65,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
        marginLeft: 8,
    },

    // Empty state
    emptyWrap: {
        alignItems: 'center',
        paddingVertical: 40,
    },

    // Card footer (status + actions)
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingBottom: 12,
        paddingTop: 4,
    },
    emptyIconBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
});
