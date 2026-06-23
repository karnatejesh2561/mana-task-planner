import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, NotificationSettingsState, useApp } from '../AppContext';

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

// ─── Icon Circle ──────────────────────────────────────────────────────────────
const IconCircle: React.FC<{
    name: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
    size?: number;
}> = ({ name, color, bgColor, size = 20 }) => (
    <View style={[iconCircleStyles.circle, { backgroundColor: bgColor }]}>
        <Ionicons name={name} size={size} color={color} />
    </View>
);
const iconCircleStyles = StyleSheet.create({
    circle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

// ─── Toggle Row Card ──────────────────────────────────────────────────────────
interface ToggleRowCardProps {
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    disabled?: boolean;
    theme: AppTheme;
}

const ToggleRowCard: React.FC<ToggleRowCardProps> = ({
    iconName,
    iconColor,
    iconBg,
    title,
    subtitle,
    value,
    onToggle,
    disabled,
    theme,
}) => {
    const isDark = theme.scheme === 'dark';
    const cardBg = isDark ? '#0F1D2E' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
    const disabledBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';

    return (
        <View
            style={[
                rowStyles.card,
                {
                    backgroundColor: disabled ? disabledBg : cardBg,
                    borderColor: cardBorder,
                    shadowColor: isDark ? '#000' : '#0A66FF',
                    shadowOpacity: isDark ? 0.18 : 0.05,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 2 },
                },
            ]}
        >
            <IconCircle
                name={iconName}
                color={disabled ? (isDark ? '#3A4A60' : '#C0C8D4') : iconColor}
                bgColor={disabled ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)') : iconBg}
            />
            <View style={rowStyles.textBlock}>
                <Text
                    style={[
                        rowStyles.title,
                        { color: disabled ? (isDark ? '#3A4A60' : '#C0C8D4') : theme.text },
                    ]}
                >
                    {title}
                </Text>
                <Text
                    style={[
                        rowStyles.subtitle,
                        { color: disabled ? (isDark ? '#2A3A50' : '#D0D8E4') : theme.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {subtitle}
                </Text>
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                disabled={disabled}
                trackColor={{
                    false: isDark ? '#1E2D40' : '#E2E8F0',
                    true: '#0A66FF',
                }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={isDark ? '#1E2D40' : '#E2E8F0'}
            />
        </View>
    );
};

const rowStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    textBlock: {
        flex: 1,
        marginLeft: 14,
        marginRight: 10,
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 12,
        fontWeight: '400',
    },
});

// ─── Chevron Row Card ─────────────────────────────────────────────────────────
interface ChevronRowCardProps {
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    rightLabel?: string;
    onPress: () => void;
    disabled?: boolean;
    theme: AppTheme;
}

const ChevronRowCard: React.FC<ChevronRowCardProps> = ({
    iconName,
    iconColor,
    iconBg,
    title,
    subtitle,
    rightLabel,
    onPress,
    disabled,
    theme,
}) => {
    const isDark = theme.scheme === 'dark';
    const cardBg = isDark ? '#0F1D2E' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.82}
            style={[
                rowStyles.card,
                {
                    backgroundColor: cardBg,
                    borderColor: cardBorder,
                    shadowColor: isDark ? '#000' : '#0A66FF',
                    shadowOpacity: isDark ? 0.18 : 0.05,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 2 },
                },
            ]}
        >
            <IconCircle name={iconName} color={iconColor} bgColor={iconBg} />
            <View style={rowStyles.textBlock}>
                <Text style={[rowStyles.title, { color: theme.text }]}>{title}</Text>
                <Text style={[rowStyles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
            {rightLabel && (
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary, marginRight: 6 }}>
                    {rightLabel}
                </Text>
            )}
            <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'}
            />
        </TouchableOpacity>
    );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ label: string; theme: AppTheme }> = ({ label, theme }) => (
    <Text
        style={{
            fontSize: 12,
            fontWeight: '700',
            color: theme.textSecondary,
            marginBottom: 8,
            marginTop: 6,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
        }}
    >
        {label}
    </Text>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    onBack,
    onNavigateToDefaultReminder,
}) => {
    const { theme, colorScheme, notificationSettings, notificationSettingsReady, updateNotificationSettings } = useApp();
    const isDark = colorScheme === 'dark';

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
    const screenBg = isDark ? '#081220' : '#F0F4FF';

    if (!notificationSettingsReady) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: screenBg }}>
                <ActivityIndicator size="small" color="#0A66FF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: screenBg }}>
            {/* Gradient background */}
            <LinearGradient
                colors={isDark ? ['#081220', '#0D1825', '#132438'] : ['#F7FAFF', '#FFFFFF', '#F0F4FF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Light mode soft bg */}
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
                    style={[
                        styles.backBtn,
                        {
                            backgroundColor: isDark ? 'rgba(10, 22, 40, 0.5)' : 'rgba(255, 255, 255, 0.45)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                        },
                    ]}
                    onPress={onBack}
                    activeOpacity={0.8}
                >
                    <Ionicons name="chevron-back" size={22} color={theme.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Manage your preferences
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* ── Master Toggle Hero Card ── */}
                <View
                    style={[
                        styles.masterCard,
                        {
                            backgroundColor: isDark
                                ? state.masterEnabled ? 'rgba(10,102,255,0.14)' : '#0F1D2E'
                                : state.masterEnabled ? 'rgba(10,102,255,0.08)' : '#FFFFFF',
                            borderColor: isDark
                                ? state.masterEnabled ? 'rgba(10,102,255,0.35)' : 'rgba(255,255,255,0.07)'
                                : state.masterEnabled ? 'rgba(10,102,255,0.25)' : 'rgba(0,0,0,0.07)',
                        },
                    ]}
                >
                    {/* Subtle gradient accent when enabled */}
                    {state.masterEnabled && (
                        <LinearGradient
                            colors={isDark
                                ? ['rgba(10,102,255,0.18)', 'transparent']
                                : ['rgba(10,102,255,0.10)', 'transparent']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        />
                    )}
                    <View
                        style={[
                            styles.masterIconBox,
                            {
                                backgroundColor: state.masterEnabled
                                    ? isDark ? 'rgba(10,102,255,0.25)' : 'rgba(10,102,255,0.15)'
                                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            },
                        ]}
                    >
                        <Ionicons
                            name="notifications"
                            size={26}
                            color={state.masterEnabled ? '#0A66FF' : (isDark ? '#4A6080' : '#B0BCC8')}
                        />
                    </View>
                    <View style={styles.masterCopy}>
                        <Text style={[styles.masterTitle, { color: theme.text }]}>
                            Push Notifications
                        </Text>
                        <Text style={[styles.masterSub, { color: theme.textSecondary }]}>
                            {state.masterEnabled
                                ? 'Notifications are enabled'
                                : 'Enable to receive alerts & reminders'}
                        </Text>
                    </View>
                    <Switch
                        value={state.masterEnabled}
                        onValueChange={() => toggle('masterEnabled')}
                        disabled={isSaving}
                        trackColor={{
                            false: isDark ? '#1E2D40' : '#E2E8F0',
                            true: '#0A66FF',
                        }}
                        thumbColor="#FFFFFF"
                        ios_backgroundColor={isDark ? '#1E2D40' : '#E2E8F0'}
                    />
                </View>

                {/* ── Task Notifications ── */}
                <SectionLabel label="Task Alerts" theme={theme} />

                <ToggleRowCard
                    iconName="notifications-outline"
                    iconColor="#0A66FF"
                    iconBg={isDark ? 'rgba(10,102,255,0.18)' : 'rgba(10,102,255,0.10)'}
                    title="Task Reminders"
                    subtitle="Get reminded about upcoming tasks"
                    value={state.taskReminders}
                    onToggle={() => toggle('taskReminders')}
                    disabled={isDisabled}
                    theme={theme}
                />

                <ToggleRowCard
                    iconName="calendar-outline"
                    iconColor="#22C55E"
                    iconBg={isDark ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.10)'}
                    title="Task Due Today"
                    subtitle="Daily summary of today's tasks"
                    value={state.taskDueToday}
                    onToggle={() => toggle('taskDueToday')}
                    disabled={isDisabled}
                    theme={theme}
                />

                <ToggleRowCard
                    iconName="time-outline"
                    iconColor="#FF6B00"
                    iconBg={isDark ? 'rgba(255,107,0,0.18)' : 'rgba(255,107,0,0.10)'}
                    title="Task Overdue"
                    subtitle="Alerts for tasks that are overdue"
                    value={state.taskOverdue}
                    onToggle={() => toggle('taskOverdue')}
                    disabled={isDisabled}
                    theme={theme}
                />

                <ToggleRowCard
                    iconName="checkmark-circle-outline"
                    iconColor="#8B5CF6"
                    iconBg={isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.10)'}
                    title="Task Completed"
                    subtitle="Celebrate when you finish a task"
                    value={state.taskCompleted}
                    onToggle={() => toggle('taskCompleted')}
                    disabled={isDisabled}
                    theme={theme}
                />

                {/* ── General Notifications ── */}
                <SectionLabel label="General" theme={theme} />

                <ToggleRowCard
                    iconName="bulb-outline"
                    iconColor="#F59E0B"
                    iconBg={isDark ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.10)'}
                    title="Tips & Suggestions"
                    subtitle="Helpful tips to stay productive"
                    value={state.tipsAndSuggestions}
                    onToggle={() => toggle('tipsAndSuggestions')}
                    disabled={isDisabled}
                    theme={theme}
                />

                <ToggleRowCard
                    iconName="megaphone-outline"
                    iconColor="#EC4899"
                    iconBg={isDark ? 'rgba(236,72,153,0.18)' : 'rgba(236,72,153,0.10)'}
                    title="Promotions"
                    subtitle="Updates about new features & offers"
                    value={state.promotions}
                    onToggle={() => toggle('promotions')}
                    disabled={isDisabled}
                    theme={theme}
                />

                {/* ── Schedule ── */}
                <SectionLabel label="Schedule" theme={theme} />

                <ChevronRowCard
                    iconName="moon-outline"
                    iconColor="#6366F1"
                    iconBg={isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)'}
                    title="Quiet Hours"
                    subtitle="Turn off notifications during this time"
                    rightLabel={`${QUIET_HOURS_START} – ${QUIET_HOURS_END}`}
                    onPress={() => { /* quiet hours picker */ }}
                    disabled={isDisabled}
                    theme={theme}
                />

                {/* ── Reminder ── */}
                <SectionLabel label="Reminder" theme={theme} />

                <ChevronRowCard
                    iconName="time-outline"
                    iconColor="#0EA5E9"
                    iconBg={isDark ? 'rgba(14,165,233,0.18)' : 'rgba(14,165,233,0.10)'}
                    title="Default Reminder"
                    subtitle="Set the default reminder time for new tasks"
                    onPress={onNavigateToDefaultReminder}
                    disabled={isSaving}
                    theme={theme}
                />
            </ScrollView>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    headerSpacer: {
        width: 42,
    },
    content: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 120,
    },

    // Master Toggle Hero Card
    masterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 22,
        overflow: 'hidden',
        shadowColor: '#0A66FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
    },
    masterIconBox: {
        width: 52,
        height: 52,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    masterCopy: {
        flex: 1,
        marginRight: 12,
    },
    masterTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    masterSub: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 17,
    },
});
