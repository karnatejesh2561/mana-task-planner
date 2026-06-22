import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { glassButton, glassInput, glassPanel } from '../theme/glass';

interface DefaultReminderProps {
    onBack: () => void;
}

type ReminderOption = {
    id: string;
    label: string;
    sublabel: string;
    minutes: number | null; // null = custom
};

type SnoozeOption = '5 minutes' | '10 minutes' | '15 minutes' | '30 minutes' | '1 hour';

const REMINDER_OPTIONS: ReminderOption[] = [
    { id: 'at_time', label: 'At time of task', sublabel: 'Remind me at the exact due time', minutes: 0 },
    { id: '5min', label: '5 minutes before', sublabel: 'Remind me 5 minutes before', minutes: 5 },
    { id: '15min', label: '15 minutes before', sublabel: 'Remind me 15 minutes before', minutes: 15 },
    { id: '30min', label: '30 minutes before', sublabel: 'Remind me 30 minutes before', minutes: 30 },
    { id: '1hr', label: '1 hour before', sublabel: 'Remind me 1 hour before', minutes: 60 },
    { id: 'custom', label: 'Custom', sublabel: 'Choose a custom time', minutes: null },
];

const SNOOZE_OPTIONS: SnoozeOption[] = ['5 minutes', '10 minutes', '15 minutes', '30 minutes', '1 hour'];

const labelToSnoozeMinutes = (value: SnoozeOption) => {
    switch (value) {
        case '5 minutes':
            return 5;
        case '10 minutes':
            return 10;
        case '15 minutes':
            return 15;
        case '30 minutes':
            return 30;
        case '1 hour':
            return 60;
        default:
            return 10;
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

export const DefaultReminder: React.FC<DefaultReminderProps> = ({ onBack }) => {
    const { theme, notificationSettings, notificationSettingsReady, updateNotificationSettings } = useApp();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const [selectedReminder, setSelectedReminder] = useState<string>(reminderMinutesToOptionId(notificationSettings.defaultReminderMinutes));
    const [selectedSnooze, setSelectedSnooze] = useState<SnoozeOption>(snoozeMinutesToLabel(notificationSettings.snoozeMinutes));
    const [showSnoozeDropdown, setShowSnoozeDropdown] = useState(false);
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
        const selected = REMINDER_OPTIONS.find(option => option.id === id);
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

    const getCustomSublabel = () => {
        if (customMinutesSaved) {
            return `Remind me ${customMinutesSaved} minutes before`;
        }
        return 'Choose a custom time';
    };

    if (!notificationSettingsReady) {
        return (
            <View style={styles.loadingScreen}>
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
                    <Ionicons name="chevron-back" size={24} color={theme.orangeAccent} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Default Reminder</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {/* Hero Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIconBox}>
                        <Ionicons name="time-outline" size={24} color={theme.orangeAccent} />
                    </View>
                    <View style={styles.heroCopy}>
                        <Text style={styles.heroTitle}>Default Reminder</Text>
                        <Text style={styles.heroSub}>
                            Set the default reminder time for{'\n'}new tasks.
                        </Text>
                    </View>
                </View>

                {/* Reminder Time Section */}
                <Text style={styles.sectionLabel}>Reminder Time</Text>
                <View style={styles.card}>
                    {REMINDER_OPTIONS.map((opt, idx) => {
                        const isSelected = selectedReminder === opt.id;
                        const isLast = idx === REMINDER_OPTIONS.length - 1;
                        const sublabel = opt.id === 'custom' ? getCustomSublabel() : opt.sublabel;

                        return (
                            <TouchableOpacity
                                key={opt.id}
                                style={[styles.reminderRow, !isLast && styles.rowDivider]}
                                activeOpacity={0.75}
                                onPress={() => handleSelectReminder(opt.id)}
                            >
                                {/* Radio */}
                                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                                    {isSelected && <View style={styles.radioDot} />}
                                </View>

                                <View style={styles.reminderCopy}>
                                    <Text style={[styles.reminderLabel, isSelected && styles.reminderLabelActive]}>
                                        {opt.label}
                                    </Text>
                                    <Text style={styles.reminderSub}>{sublabel}</Text>
                                </View>

                                {isSelected && (
                                    <Ionicons name="checkmark-circle" size={20} color={theme.orangeAccent} />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Snooze Option Section */}
                <Text style={styles.sectionLabel}>Snooze Option</Text>
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.snoozeRow}
                        activeOpacity={0.8}
                        onPress={() => setShowSnoozeDropdown(true)}
                    >
                        <View style={styles.snoozeIconBox}>
                            <Ionicons name="alarm-outline" size={20} color={theme.orangeAccent} />
                        </View>
                        <Text style={styles.snoozeLabel}>Snooze Duration</Text>
                        <View style={styles.snoozeRight}>
                            <Text style={styles.snoozeValue}>{selectedSnooze}</Text>
                            <Ionicons name="chevron-down" size={16} color={theme.orangeAccent} />
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Snooze Dropdown Modal */}
            <Modal
                visible={showSnoozeDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSnoozeDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSnoozeDropdown(false)}
                >
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownTitle}>Snooze Duration</Text>
                        {SNOOZE_OPTIONS.map((opt, idx) => {
                            const isSelected = selectedSnooze === opt;
                            const isLast = idx === SNOOZE_OPTIONS.length - 1;
                            return (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.dropdownRow, !isLast && styles.dropdownDivider]}
                                    activeOpacity={0.75}
                                    onPress={() => {
                                        setSelectedSnooze(opt);
                                        setShowSnoozeDropdown(false);
                                        void persistPatch({ snoozeMinutes: labelToSnoozeMinutes(opt) });
                                    }}
                                >
                                    <Text style={[styles.dropdownOpt, isSelected && styles.dropdownOptActive]}>
                                        {opt}
                                    </Text>
                                    {isSelected && (
                                        <Ionicons name="checkmark" size={18} color={theme.orangeAccent} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Custom Reminder Modal */}
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
                        style={styles.customModalCard}
                        activeOpacity={1}
                        onPress={() => { /* prevent close */ }}
                    >
                        <Text style={styles.customModalTitle}>Custom Reminder</Text>
                        <Text style={styles.customModalSub}>Enter minutes before the task</Text>
                        <View style={styles.customInputRow}>
                            <TextInput
                                style={styles.customInput}
                                value={customMinutes}
                                onChangeText={setCustomMinutes}
                                placeholder="e.g. 45"
                                placeholderTextColor={theme.placeholder}
                                keyboardType="number-pad"
                                maxLength={4}
                                autoFocus
                            />
                            <Text style={styles.customInputUnit}>min</Text>
                        </View>
                        <View style={styles.customModalButtons}>
                            <TouchableOpacity
                                style={[styles.customModalBtn, styles.customModalBtnCancel]}
                                onPress={() => setShowCustomModal(false)}
                            >
                                <Text style={styles.customModalBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.customModalBtn, styles.customModalBtnSave]}
                                onPress={handleSaveCustom}
                                disabled={isSaving}
                            >
                                <Text style={styles.customModalBtnSaveText}>Set</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

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

        /* Hero card */
        heroCard: {
            flexDirection: 'row',
            alignItems: 'center',
            ...glassPanel(theme, { borderRadius: 18 }),
            padding: 16,
            marginBottom: 24,
        },
        heroIconBox: {
            width: 48,
            height: 48,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
            ...glassButton(theme, false, { borderRadius: 12, backgroundColor: theme.avatarBg }),
        },
        heroCopy: { flex: 1, minWidth: 0 },
        heroTitle: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.text,
            marginBottom: 4,
        },
        heroSub: {
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

        /* Card */
        card: {
            ...glassPanel(theme, { borderRadius: 18 }),
            marginBottom: 20,
            overflow: 'hidden',
        },

        /* Reminder rows */
        reminderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 14,
        },
        rowDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.divider,
        },
        radio: {
            width: 22,
            height: 22,
            borderRadius: 11,
            borderWidth: 2,
            borderColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
        },
        radioSelected: {
            borderColor: theme.electricBlue,
            backgroundColor: theme.scheme === 'dark' ? 'rgba(109,74,255,0.15)' : '#F3EEFF',
        },
        radioDot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: theme.electricBlue,
        },
        reminderCopy: { flex: 1, minWidth: 0 },
        reminderLabel: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 2,
        },
        reminderLabelActive: {
            color: theme.electricBlue,
            fontWeight: '700',
        },
        reminderSub: {
            fontSize: 12,
            color: theme.textSecondary,
            lineHeight: 16,
        },

        /* Snooze */
        snoozeRow: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingVertical: 15,
        },
        snoozeIconBox: {
            width: 38,
            height: 38,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            ...glassButton(theme, false, { borderRadius: 10, backgroundColor: theme.avatarBg }),
        },
        snoozeLabel: {
            flex: 1,
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
        },
        snoozeRight: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        snoozeValue: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.textSecondary,
        },

        /* Modals */
        modalOverlay: {
            flex: 1,
            backgroundColor: theme.glassOverlay,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 28,
        },
        dropdownContainer: {
            width: '100%',
            ...glassPanel(theme, { borderRadius: 18 }),
            paddingVertical: 8,
        },
        dropdownTitle: {
            fontSize: 14,
            fontWeight: '800',
            color: theme.text,
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.divider,
        },
        dropdownRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingVertical: 15,
        },
        dropdownDivider: {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: theme.divider,
        },
        dropdownOpt: {
            fontSize: 14,
            fontWeight: '600',
            color: theme.text,
        },
        dropdownOptActive: {
            color: theme.electricBlue,
            fontWeight: '700',
        },

        /* Custom reminder modal */
        customModalCard: {
            width: '100%',
            ...glassPanel(theme, { borderRadius: 18 }),
            padding: 24,
        },
        customModalTitle: {
            fontSize: 17,
            fontWeight: '800',
            color: theme.text,
            marginBottom: 6,
        },
        customModalSub: {
            fontSize: 13,
            color: theme.textSecondary,
            marginBottom: 20,
        },
        customInputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            ...glassInput(theme, true, { borderRadius: 14 }),
            paddingHorizontal: 16,
            marginBottom: 22,
            height: 52,
        },
        customInput: {
            flex: 1,
            fontSize: 22,
            fontWeight: '700',
            color: theme.text,
            paddingVertical: 0,
        },
        customInputUnit: {
            fontSize: 15,
            fontWeight: '600',
            color: theme.textSecondary,
        },
        customModalButtons: {
            flexDirection: 'row',
            gap: 12,
        },
        customModalBtn: {
            flex: 1,
            height: 48,
            borderRadius: 10,
            alignItems: 'center',
            justifyContent: 'center',
        },
        customModalBtnCancel: {
            backgroundColor: theme.scheme === 'dark' ? 'rgba(100,116,139,0.16)' : '#F3F4F6',
        },
        customModalBtnSave: {
            backgroundColor: theme.electricBlue,
        },
        customModalBtnCancelText: {
            fontSize: 15,
            fontWeight: '700',
            color: theme.textSecondary,
        },
        customModalBtnSaveText: {
            fontSize: 15,
            fontWeight: '700',
            color: '#FFFFFF',
        },
    });
