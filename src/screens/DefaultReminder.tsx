import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useApp } from '../AppContext';

interface DefaultReminderProps {
    onBack: () => void;
}

type ReminderOption = {
    id: string;
    label: string;
    sublabel: string;
    minutes: number | null;
    iconName: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBg: string;
    iconBgDark: string;
};

type SnoozeOption = '5 minutes' | '10 minutes' | '15 minutes' | '30 minutes' | '1 hour';

const REMINDER_OPTIONS: ReminderOption[] = [
    {
        id: 'at_time',
        label: 'At time of task',
        sublabel: 'Remind me at the exact due time',
        minutes: 0,
        iconName: 'radio-button-on-outline',
        iconColor: '#0A66FF',
        iconBg: 'rgba(10,102,255,0.10)',
        iconBgDark: 'rgba(10,102,255,0.18)',
    },
    {
        id: '5min',
        label: '5 minutes before',
        sublabel: 'Remind me 5 minutes early',
        minutes: 5,
        iconName: 'timer-outline',
        iconColor: '#22C55E',
        iconBg: 'rgba(34,197,94,0.10)',
        iconBgDark: 'rgba(34,197,94,0.18)',
    },
    {
        id: '15min',
        label: '15 minutes before',
        sublabel: 'Remind me 15 minutes early',
        minutes: 15,
        iconName: 'time-outline',
        iconColor: '#F59E0B',
        iconBg: 'rgba(245,158,11,0.10)',
        iconBgDark: 'rgba(245,158,11,0.18)',
    },
    {
        id: '30min',
        label: '30 minutes before',
        sublabel: 'Remind me half an hour early',
        minutes: 30,
        iconName: 'hourglass-outline',
        iconColor: '#FF6B00',
        iconBg: 'rgba(255,107,0,0.10)',
        iconBgDark: 'rgba(255,107,0,0.18)',
    },
    {
        id: '1hr',
        label: '1 hour before',
        sublabel: 'Remind me an hour early',
        minutes: 60,
        iconName: 'alarm-outline',
        iconColor: '#8B5CF6',
        iconBg: 'rgba(139,92,246,0.10)',
        iconBgDark: 'rgba(139,92,246,0.18)',
    },
    {
        id: 'custom',
        label: 'Custom',
        sublabel: 'Choose a custom time',
        minutes: null,
        iconName: 'settings-outline',
        iconColor: '#EC4899',
        iconBg: 'rgba(236,72,153,0.10)',
        iconBgDark: 'rgba(236,72,153,0.18)',
    },
];

const SNOOZE_OPTIONS: SnoozeOption[] = ['5 minutes', '10 minutes', '15 minutes', '30 minutes', '1 hour'];

const labelToSnoozeMinutes = (value: SnoozeOption) => {
    switch (value) {
        case '5 minutes': return 5;
        case '10 minutes': return 10;
        case '15 minutes': return 15;
        case '30 minutes': return 30;
        case '1 hour': return 60;
        default: return 10;
    }
};

const snoozeMinutesToLabel = (minutes: number): SnoozeOption => {
    if (minutes === 5) return '5 minutes';
    if (minutes === 10) return '10 minutes';
    if (minutes === 15) return '15 minutes';
    if (minutes === 30) return '30 minutes';
    if (minutes === 60) return '1 hour';
    return '10 minutes';
};

const reminderMinutesToOptionId = (minutes: number) => {
    if (minutes === 0) return 'at_time';
    if (minutes === 5) return '5min';
    if (minutes === 15) return '15min';
    if (minutes === 30) return '30min';
    if (minutes === 60) return '1hr';
    return 'custom';
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ label: string; color: string }> = ({ label, color }) => (
    <Text style={[sectionLabelStyle.text, { color }]}>{label}</Text>
);
const sectionLabelStyle = StyleSheet.create({
    text: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 6,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
});

// ─── Main Component ───────────────────────────────────────────────────────────
export const DefaultReminder: React.FC<DefaultReminderProps> = ({ onBack }) => {
    const { theme, colorScheme, notificationSettings, notificationSettingsReady, updateNotificationSettings } = useApp();
    const isDark = colorScheme === 'dark';

    const [selectedReminder, setSelectedReminder] = useState<string>(
        reminderMinutesToOptionId(notificationSettings.defaultReminderMinutes),
    );
    const [selectedSnooze, setSelectedSnooze] = useState<SnoozeOption>(
        snoozeMinutesToLabel(notificationSettings.snoozeMinutes),
    );
    const [showSnoozeModal, setShowSnoozeModal] = useState(false);
    const [showCustomModal, setShowCustomModal] = useState(false);
    const [customMinutes, setCustomMinutes] = useState('');
    const [customMinutesSaved, setCustomMinutesSaved] = useState(
        notificationSettings.defaultReminderMinutes > 0 && ![5, 15, 30, 60].includes(notificationSettings.defaultReminderMinutes)
            ? `${notificationSettings.defaultReminderMinutes}`
            : '',
    );
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        setSelectedReminder(reminderMinutesToOptionId(notificationSettings.defaultReminderMinutes));
        setSelectedSnooze(snoozeMinutesToLabel(notificationSettings.snoozeMinutes));
        setCustomMinutesSaved(
            notificationSettings.defaultReminderMinutes > 0 && ![5, 15, 30, 60].includes(notificationSettings.defaultReminderMinutes)
                ? `${notificationSettings.defaultReminderMinutes}`
                : '',
        );
    }, [notificationSettings]);

    const persistPatch = async (patch: { defaultReminderMinutes?: number; snoozeMinutes?: number }) => {
        setIsSaving(true);
        const result = await updateNotificationSettings(patch);
        setIsSaving(false);
        if (!result.success) {
            Alert.alert('Default Reminder', result.error || 'Unable to save reminder settings');
        }
    };

    const handleSelectReminder = (id: string) => {
        if (id === 'custom') {
            setShowCustomModal(true);
            return;
        }
        setSelectedReminder(id);
        const selected = REMINDER_OPTIONS.find(o => o.id === id);
        if (selected && selected.minutes !== null) {
            void persistPatch({ defaultReminderMinutes: selected.minutes });
        }
    };

    const handleSaveCustom = () => {
        const mins = parseInt(customMinutes, 10);
        if (isNaN(mins) || mins <= 0) return;
        setCustomMinutesSaved(`${mins}`);
        setSelectedReminder('custom');
        setShowCustomModal(false);
        void persistPatch({ defaultReminderMinutes: mins });
    };

    const getCustomSublabel = () =>
        customMinutesSaved ? `Remind me ${customMinutesSaved} minutes before` : 'Choose a custom time';

    const screenBg = isDark ? '#081220' : '#F0F4FF';
    const cardBg = isDark ? '#0F1D2E' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    // Currently selected option info for hero display
    const activeOption = REMINDER_OPTIONS.find(o => o.id === selectedReminder) ?? REMINDER_OPTIONS[0];
    const activeLabel = selectedReminder === 'custom' ? getCustomSublabel() : activeOption.sublabel;

    if (!notificationSettingsReady) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: screenBg }}>
                <ActivityIndicator size="small" color="#0A66FF" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: screenBg }}>
            {/* Gradient */}
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
                    <Text style={[styles.headerTitle, { color: theme.text }]}>Default Reminder</Text>
                    <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
                        Set your preferred alert timing
                    </Text>
                </View>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

                {/* ── Hero Status Card ── */}
                <View
                    style={[
                        styles.heroCard,
                        {
                            backgroundColor: isDark ? 'rgba(255,107,0,0.12)' : 'rgba(255,107,0,0.07)',
                            borderColor: isDark ? 'rgba(255,107,0,0.30)' : 'rgba(255,107,0,0.20)',
                        },
                    ]}
                >
                    <LinearGradient
                        colors={isDark
                            ? ['rgba(255,107,0,0.15)', 'transparent']
                            : ['rgba(255,107,0,0.08)', 'transparent']}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    />
                    <View style={[styles.heroIconBox, { backgroundColor: isDark ? 'rgba(255,107,0,0.22)' : 'rgba(255,107,0,0.14)' }]}>
                        <Ionicons name="time" size={28} color="#FF6B00" />
                    </View>
                    <View style={styles.heroCopy}>
                        <Text style={[styles.heroLabel, { color: theme.textSecondary }]}>Current Reminder</Text>
                        <Text style={[styles.heroTitle, { color: theme.text }]}>{activeOption.label}</Text>
                        <Text style={[styles.heroSub, { color: theme.textSecondary }]}>{activeLabel}</Text>
                    </View>
                </View>

                {/* ── Reminder Time Options ── */}
                <SectionLabel label="Reminder Time" color={theme.textSecondary} />

                {REMINDER_OPTIONS.map((opt) => {
                    const isSelected = selectedReminder === opt.id;
                    const sublabel = opt.id === 'custom' ? getCustomSublabel() : opt.sublabel;
                    const bg = isDark ? opt.iconBgDark : opt.iconBg;

                    return (
                        <TouchableOpacity
                            key={opt.id}
                            onPress={() => handleSelectReminder(opt.id)}
                            activeOpacity={0.82}
                            style={[
                                styles.optionCard,
                                {
                                    backgroundColor: isSelected
                                        ? isDark ? 'rgba(10,102,255,0.12)' : 'rgba(10,102,255,0.06)'
                                        : cardBg,
                                    borderColor: isSelected
                                        ? isDark ? 'rgba(10,102,255,0.40)' : 'rgba(10,102,255,0.28)'
                                        : cardBorder,
                                    shadowColor: isDark ? '#000' : '#0A66FF',
                                    shadowOpacity: isDark ? 0.18 : 0.05,
                                    shadowRadius: 10,
                                    shadowOffset: { width: 0, height: 2 },
                                },
                            ]}
                        >
                            {/* Subtle selected tint */}
                            {isSelected && (
                                <LinearGradient
                                    colors={isDark
                                        ? ['rgba(10,102,255,0.14)', 'transparent']
                                        : ['rgba(10,102,255,0.07)', 'transparent']}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                            )}

                            {/* Icon Circle */}
                            <View style={[styles.optionIconCircle, { backgroundColor: isSelected ? bg : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)') }]}>
                                <Ionicons
                                    name={opt.iconName}
                                    size={20}
                                    color={isSelected ? opt.iconColor : (isDark ? '#4A6080' : '#B0BCC8')}
                                />
                            </View>

                            {/* Text */}
                            <View style={styles.optionTextBlock}>
                                <Text style={[
                                    styles.optionLabel,
                                    { color: isSelected ? '#0A66FF' : theme.text },
                                ]}>
                                    {opt.label}
                                </Text>
                                <Text style={[styles.optionSublabel, { color: theme.textSecondary }]} numberOfLines={1}>
                                    {sublabel}
                                </Text>
                            </View>

                            {/* Radio / Checkmark */}
                            {isSelected ? (
                                <View style={styles.checkCircle}>
                                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                                </View>
                            ) : (
                                <View style={[styles.radioEmpty, { borderColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)' }]} />
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* ── Snooze Section ── */}
                <SectionLabel label="Snooze Duration" color={theme.textSecondary} />

                <TouchableOpacity
                    onPress={() => setShowSnoozeModal(true)}
                    activeOpacity={0.82}
                    style={[
                        styles.snoozeCard,
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
                    <View style={[styles.optionIconCircle, { backgroundColor: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(99,102,241,0.10)' }]}>
                        <Ionicons name="alarm-outline" size={20} color="#6366F1" />
                    </View>
                    <View style={styles.optionTextBlock}>
                        <Text style={[styles.optionLabel, { color: theme.text }]}>Snooze Duration</Text>
                        <Text style={[styles.optionSublabel, { color: theme.textSecondary }]}>
                            How long to delay a snoozed alert
                        </Text>
                    </View>
                    <View style={styles.snoozeRight}>
                        <Text style={[styles.snoozeValue, { color: '#0A66FF' }]}>{selectedSnooze}</Text>
                        <Ionicons name="chevron-forward" size={16} color={isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'} />
                    </View>
                </TouchableOpacity>

            </ScrollView>

            {/* ── Snooze Picker Modal ── */}
            <Modal
                visible={showSnoozeModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSnoozeModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSnoozeModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: isDark ? '#0F1D2E' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                    >
                        {/* Modal header */}
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIconBox, { backgroundColor: isDark ? 'rgba(99,102,241,0.20)' : 'rgba(99,102,241,0.12)' }]}>
                                <Ionicons name="alarm-outline" size={22} color="#6366F1" />
                            </View>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Snooze Duration</Text>
                                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>Select delay time</Text>
                            </View>
                        </View>

                        {/* Options */}
                        {SNOOZE_OPTIONS.map((opt, idx) => {
                            const isSelected = selectedSnooze === opt;
                            const isLast = idx === SNOOZE_OPTIONS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    onPress={() => {
                                        setSelectedSnooze(opt);
                                        setShowSnoozeModal(false);
                                        void persistPatch({ snoozeMinutes: labelToSnoozeMinutes(opt) });
                                    }}
                                    activeOpacity={0.78}
                                    style={[
                                        styles.snoozeOptRow,
                                        !isLast && {
                                            borderBottomWidth: StyleSheet.hairlineWidth,
                                            borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
                                        },
                                    ]}
                                >
                                    <Text style={[
                                        styles.snoozeOptText,
                                        { color: isSelected ? '#0A66FF' : theme.text },
                                        isSelected && { fontWeight: '700' },
                                    ]}>
                                        {opt}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkCircleSmall}>
                                            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* ── Custom Reminder Modal ── */}
            <Modal
                visible={showCustomModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowCustomModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowCustomModal(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        style={[
                            styles.modalCard,
                            {
                                backgroundColor: isDark ? '#0F1D2E' : '#FFFFFF',
                                borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                            },
                        ]}
                        onPress={() => { }}
                    >
                        {/* Modal header */}
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalIconBox, { backgroundColor: isDark ? 'rgba(236,72,153,0.20)' : 'rgba(236,72,153,0.12)' }]}>
                                <Ionicons name="settings-outline" size={22} color="#EC4899" />
                            </View>
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Custom Reminder</Text>
                                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>Minutes before the task</Text>
                            </View>
                        </View>

                        {/* Input */}
                        <View style={[
                            styles.customInputRow,
                            {
                                backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                                borderColor: '#0A66FF',
                            },
                        ]}>
                            <TextInput
                                style={[styles.customInput, { color: theme.text }]}
                                value={customMinutes}
                                onChangeText={setCustomMinutes}
                                placeholder="e.g. 45"
                                placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                                keyboardType="number-pad"
                                maxLength={4}
                                autoFocus
                            />
                            <Text style={[styles.customInputUnit, { color: theme.textSecondary }]}>min</Text>
                        </View>

                        {/* Buttons */}
                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity
                                style={[
                                    styles.modalBtn,
                                    { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' },
                                ]}
                                onPress={() => setShowCustomModal(false)}
                            >
                                <Text style={[styles.modalBtnCancel, { color: theme.textSecondary }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#0A66FF' }]}
                                onPress={handleSaveCustom}
                                disabled={isSaving}
                            >
                                <LinearGradient
                                    colors={['#0A66FF', '#3B82F6']}
                                    style={StyleSheet.absoluteFill}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                />
                                <Text style={styles.modalBtnSave}>Set Reminder</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    // Header
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

    content: {
        paddingHorizontal: 18,
        paddingTop: 10,
        paddingBottom: 120,
    },

    // Hero Card
    heroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        borderRadius: 18,
        borderWidth: 1,
        marginBottom: 22,
        overflow: 'hidden',
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
    },
    heroIconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    heroCopy: { flex: 1 },
    heroLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 3,
    },
    heroTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 3,
    },
    heroSub: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 17,
    },

    // Option Cards
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
        overflow: 'hidden',
    },
    optionIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionTextBlock: {
        flex: 1,
        marginLeft: 14,
        marginRight: 10,
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 3,
    },
    optionSublabel: {
        fontSize: 12,
        fontWeight: '400',
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#0A66FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioEmpty: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
    },

    // Snooze Card
    snoozeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 10,
    },
    snoozeRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    snoozeValue: {
        fontSize: 13,
        fontWeight: '700',
    },

    // Modals
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalCard: {
        width: '100%',
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.30,
        shadowRadius: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(128,128,128,0.15)',
    },
    modalIconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        fontSize: 17,
        fontWeight: '800',
        marginBottom: 2,
    },
    modalSub: {
        fontSize: 12,
        fontWeight: '400',
    },

    // Snooze Modal Options
    snoozeOptRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    snoozeOptText: {
        fontSize: 15,
        fontWeight: '600',
    },
    checkCircleSmall: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#0A66FF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Custom Modal Inputs
    customInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        borderWidth: 2,
        paddingHorizontal: 16,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        height: 58,
    },
    customInput: {
        flex: 1,
        fontSize: 26,
        fontWeight: '700',
        paddingVertical: 0,
    },
    customInputUnit: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalBtnRow: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    modalBtn: {
        flex: 1,
        height: 50,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    modalBtnCancel: {
        fontSize: 15,
        fontWeight: '700',
    },
    modalBtnSave: {
        fontSize: 15,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});
