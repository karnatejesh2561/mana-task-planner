import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, NotificationSettingsState, useApp } from '../AppContext';
import { glassButton, glassPanel, glassSurface } from '../theme/glass';

interface NotificationSettingsProps {
    onBack: () => void;
    onNavigateToDefaultReminder: () => void;
}

interface NotificationState {
    masterEnabled: boolean;
    taskReminders: boolean;
    taskDueToday: boolean;
    taskOverdue: boolean;
    taskCompleted: boolean;
    tipsAndSuggestions: boolean;
    promotions: boolean;
}

const QUIET_HOURS_START = '10:00 PM';
const QUIET_HOURS_END = '7:00 AM';

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    onBack,
    onNavigateToDefaultReminder,
}) => {
    const { theme, notificationSettings, notificationSettingsReady, updateNotificationSettings } = useApp();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [state, setState] = useState<NotificationState>(notificationSettings);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        setState(notificationSettings);
    }, [notificationSettings]);

    const persistState = async (nextState: NotificationState) => {
        setIsSaving(true);
        const result = await updateNotificationSettings(nextState as Partial<NotificationSettingsState>);
        setIsSaving(false);
        if (!result.success) {
            Alert.alert('Notifications', result.error || 'Unable to save notification settings');
            setState(notificationSettings);
        }
    };

    const toggle = (key: keyof NotificationState) => {
        const nextState = (() => {
            if (key === 'masterEnabled') {
                const next = !state.masterEnabled;
                return {
                    ...state,
                    masterEnabled: next,
                    taskReminders: next ? state.taskReminders : false,
                    taskDueToday: next ? state.taskDueToday : false,
                    taskOverdue: next ? state.taskOverdue : false,
                    taskCompleted: next ? state.taskCompleted : false,
                    tipsAndSuggestions: next ? state.tipsAndSuggestions : false,
                    promotions: next ? state.promotions : false,
                };
            }
            return { ...state, [key]: !state[key] };
        })();

        setState(nextState);
        void persistState(nextState);
    };

    const isDisabled = !state.masterEnabled;

    const trackColor = {
        false: theme.scheme === 'dark' ? '#2A3650' : '#E5E7EB',
        true: theme.electricBlue,
    };

    if (!notificationSettingsReady) {
        return (
            <View style={styles.loadingScreen}>
                <ActivityIndicator size="small" color={theme.electricBlue} />
            </View>
        );
    }

    const renderSwitch = (key: keyof NotificationState, disabled?: boolean) => (
        <Switch
            value={state[key] as boolean}
            onValueChange={() => toggle(key)}
            disabled={disabled || isSaving}
            trackColor={trackColor}
            thumbColor={state[key] ? '#FFFFFF' : '#FFFFFF'}
            ios_backgroundColor={theme.scheme === 'dark' ? '#2A3650' : '#E5E7EB'}
        />
    );

    return (
        <View style={styles.screen}>
            <LinearGradient
                colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
                    <Ionicons name="chevron-back" size={24} color={theme.orangeAccent} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Master Toggle Card */}
                <View style={styles.masterCard}>
                    <View style={styles.masterIconBox}>
                        <Ionicons name="notifications-outline" size={24} color={theme.orangeAccent} />
                    </View>
                    <View style={styles.masterCopy}>
                        <Text style={styles.masterTitle}>Notifications</Text>
                        <Text style={styles.masterSub}>
                            Manage how and when you get notified{'\n'}about your tasks.
                        </Text>
                    </View>
                    {renderSwitch('masterEnabled')}
                </View>

                {/* Notification Types Section */}
                <Text style={styles.sectionLabel}>Notification Types</Text>
                <View style={styles.card}>
                    <NotifRow
                        icon="notifications-outline"
                        title="Task Reminders"
                        subtitle="Get reminded about upcoming tasks"
                        value={state.taskReminders}
                        onToggle={() => toggle('taskReminders')}
                        disabled={isDisabled}
                        isLast={false}
                        styles={styles}
                        theme={theme}
                        trackColor={trackColor}
                    />
                    <NotifRow
                        icon="calendar-outline"
                        title="Task Due Today"
                        subtitle="Daily summary of today's tasks"
                        value={state.taskDueToday}
                        onToggle={() => toggle('taskDueToday')}
                        disabled={isDisabled}
                        isLast={false}
                        styles={styles}
                        theme={theme}
                        trackColor={trackColor}
                    />
                    <NotifRow
                        icon="time-outline"
                        title="Task Overdue"
                        subtitle="Alerts for tasks that are overdue"
                        value={state.taskOverdue}
                        onToggle={() => toggle('taskOverdue')}
                        disabled={isDisabled}
                        isLast={false}
                        styles={styles}
                        theme={theme}
                        trackColor={trackColor}
                    />
                    <NotifRow
                        icon="checkmark-circle-outline"
                        title="Task Completed"
                        subtitle="Get notified when you complete a task"
                        value={state.taskCompleted}
                        onToggle={() => toggle('taskCompleted')}
                        disabled={isDisabled}
                        isLast={false}
                        styles={styles}
                        theme={theme}
                        trackColor={trackColor}
                    />
                    <NotifRow
                        icon="bulb-outline"
                        title="Tips & Suggestions"
                        subtitle="Helpful tips to stay productive"
                        value={state.tipsAndSuggestions}
                        onToggle={() => toggle('tipsAndSuggestions')}
                        disabled={isDisabled}
                        isLast={false}
                        styles={styles}
                        theme={theme}
                        trackColor={trackColor}
                    />
                    <NotifRow
                        icon="megaphone-outline"
                        title="Promotions"
                        subtitle="Updates about new features"
                        value={state.promotions}
                        onToggle={() => toggle('promotions')}
                        disabled={isDisabled}
                        isLast
                        styles={styles}
                        theme={theme}
                        trackColor={trackColor}
                    />
                </View>

                {/* Quiet Hours Section */}
                <Text style={styles.sectionLabel}>Quiet Hours</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.quietRow}
                        activeOpacity={0.8}
                        disabled={isDisabled}
                        onPress={() => {/* quiet hours picker */ }}
                    >
                        <View style={[styles.notifIconBox, isDisabled && styles.disabledIconBox]}>
                            <Ionicons
                                name="moon-outline"
                                size={20}
                                color={isDisabled ? theme.textMuted : theme.orangeAccent}
                            />
                        </View>
                        <View style={styles.notifCopy}>
                            <Text style={[styles.notifTitle, isDisabled && styles.disabledText]}>
                                Quiet Hours
                            </Text>
                            <Text style={[styles.notifSub, isDisabled && styles.disabledText]}>
                                Turn off notifications during this time
                            </Text>
                        </View>
                        <Text style={[styles.quietTimeText, isDisabled && styles.disabledText]}>
                            {QUIET_HOURS_START} – {QUIET_HOURS_END}
                        </Text>
                        <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={isDisabled ? theme.textMuted : theme.orangeAccent}
                            style={{ marginLeft: 4 }}
                        />
                    </TouchableOpacity>
                </View>

                {/* Default Reminder Link */}
                <Text style={styles.sectionLabel}>Reminder</Text>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.85}
                    onPress={onNavigateToDefaultReminder}
                    disabled={isSaving}
                >
                    <View style={styles.reminderRow}>
                        <View style={styles.notifIconBox}>
                            <Ionicons name="time-outline" size={20} color={theme.orangeAccent} />
                        </View>
                        <View style={styles.notifCopy}>
                            <Text style={styles.notifTitle}>Default Reminder</Text>
                            <Text style={styles.notifSub}>Set the default reminder time for new tasks</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={theme.orangeAccent} />
                    </View>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

/* ─── Row sub-component ─────────────────────────────────────────────── */
const NotifRow = ({
    icon,
    title,
    subtitle,
    value,
    onToggle,
    disabled,
    isLast,
    styles,
    theme,
    trackColor,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    disabled: boolean;
    isLast: boolean;
    styles: ReturnType<typeof createStyles>;
    theme: AppTheme;
    trackColor: { false: string; true: string };
}) => (
    <View style={[styles.notifRow, !isLast && styles.rowDivider]}>
        <View style={[styles.notifIconBox, disabled && styles.disabledIconBox]}>
            <Ionicons
                name={icon}
                size={20}
                color={disabled ? theme.textMuted : theme.orangeAccent}
            />
        </View>
        <View style={styles.notifCopy}>
            <Text style={[styles.notifTitle, disabled && styles.disabledText]}>{title}</Text>
            <Text style={[styles.notifSub, disabled && styles.disabledText]}>{subtitle}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={trackColor}
            thumbColor="#FFFFFF"
            ios_backgroundColor={theme.scheme === 'dark' ? '#2A3650' : '#E5E7EB'}
        />
    </View>
);

/* ─── Styles ────────────────────────────────────────────────────────── */
const createStyles = (theme: AppTheme) =>
    StyleSheet.create({
        loadingScreen: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
        },
        screen: {
            flex: 1,
            backgroundColor: 'transparent',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 56,
            paddingBottom: 14,
            paddingHorizontal: 16,
            backgroundColor: 'transparent',
        },
        backBtn: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            ...glassButton(theme, false, { borderRadius: 20 }),
        },
        headerTitle: {
            flex: 1,
            textAlign: 'center',
            fontSize: 17,
            fontWeight: '700',
            color: theme.text,
            marginRight: 40,
        },
        headerSpacer: { width: 40 },
        content: {
            paddingHorizontal: 18,
            paddingBottom: 110,
            paddingTop: 6,
        },

        /* Master Toggle */
        masterCard: {
            flexDirection: 'row',
            alignItems: 'center',
            ...glassPanel(theme, { borderRadius: 18 }),
            padding: 16,
            marginBottom: 24,
        },
        masterIconBox: {
            width: 44,
            height: 44,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            ...glassButton(theme, false, { borderRadius: 12, backgroundColor: theme.avatarBg }),
        },
        masterCopy: { flex: 1, minWidth: 0, marginRight: 12 },
        masterTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 3,
        },
        masterSub: {
            fontSize: 12,
            color: theme.textSecondary,
            lineHeight: 17,
        },

        /* Section label */
        sectionLabel: {
            fontSize: 13,
            fontWeight: '700',
            color: theme.textSecondary,
            marginBottom: 10,
            marginTop: 2,
            letterSpacing: 0.2,
        },

        /* Card wrapper */
        card: {
            ...glassPanel(theme, { borderRadius: 18 }),
            marginBottom: 20,
            overflow: 'hidden',
        },

        /* Notification row */
        notifRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 14,
        },
        rowDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.divider,
        },
        notifIconBox: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            ...glassButton(theme, false, { borderRadius: 10, backgroundColor: theme.avatarBg }),
        },
        disabledIconBox: {
            backgroundColor: theme.glassBgMuted,
        },
        notifCopy: { flex: 1, minWidth: 0, marginRight: 10 },
        notifTitle: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 2,
        },
        notifSub: {
            fontSize: 12,
            color: theme.textSecondary,
            lineHeight: 16,
        },
        disabledText: { color: theme.textMuted },

        /* Quiet Hours */
        quietRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 14,
        },
        quietTimeText: {
            fontSize: 12,
            fontWeight: '600',
            color: theme.textSecondary,
        },

        /* Default Reminder link */
        reminderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 14,
        },
    });
