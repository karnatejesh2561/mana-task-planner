import React, { useMemo, useState } from 'react';
import { Modal, View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { Task } from '../types';
import { glassButton, glassPanel } from '../theme/glass';

interface CalendarScheduleProps {
    onBack: () => void;
    onAddTaskPress: (draft?: { dueDate: string; dueTime: string }) => void;
    onTaskPress?: (task: Task) => void;
    onMenuPress?: () => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ROW_HEIGHT = 56;
const TIME_COL_WIDTH = 72;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_TE = [
    'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
    'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
];
const DAY_LABELS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAY_LABELS_TE = ['సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని', 'ఆది'];

const ORDINAL_SUFFIX_MAP: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
const ordinal = (n: number) => `${n}${ORDINAL_SUFFIX_MAP[n] || ORDINAL_SUFFIX_MAP[n % 10] || 'th'}`;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateKey = (date: Date) => {
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${m}-${d}`;
};

const parseTaskDate = (value: string) => {
    const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
    if (!match) return null;
    const monthIndex = MONTHS.findIndex(month => month.toLowerCase() === match[1].toLowerCase());
    if (monthIndex < 0) return null;
    return new Date(Number(match[3]), monthIndex, Number(match[2]));
};

const formatTaskDate = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

// "Thursday, 18 June" style label for the selected date
const formatSelectedDateLabel = (date: Date) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${dayNames[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
};

const getMonday = (date: Date) => {
    const safe = startOfDay(date);
    const day = safe.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return new Date(safe.getTime() + diff * DAY_MS);
};

const buildWeek = (selectedDate: Date, dayLabels: string[]) => {
    const monday = getMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday.getTime() + index * DAY_MS);
        return {
            key: dateKey(date),
            date,
            label: dayLabels[index],
            day: `${date.getDate()}`,
        };
    });
};

const parseClockTime = (value: string) => {
    const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (!match) return null;
    let hour = Number(match[1]);
    const minutes = Number(match[2] || '0');
    const period = match[3].toUpperCase();
    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    return hour * 60 + minutes;
};

const getTaskTimes = (task: Task) => {
    const [rawStart, rawEnd] = task.timeSlot.split(/\s+-\s+/);
    const start = parseClockTime(rawStart || task.dueTime) ?? parseClockTime(task.dueTime) ?? 9 * 60;
    const end = parseClockTime(rawEnd || '') ?? start + 60;
    return {
        start,
        end: Math.max(end, start + 30),
        label: rawEnd ? task.timeSlot : `${task.dueTime} - ${formatMinutes(start + 60)}`,
    };
};

const formatMinutes = (minutes: number) => {
    const normalized = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60);
    const h24 = Math.floor(normalized / 60);
    const min = normalized % 60;
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${`${h12}`.padStart(2, '0')}:${`${min}`.padStart(2, '0')} ${period}`;
};

// "09:00 AM" format matching reference image
const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${`${h12}`.padStart(2, '0')}:00 ${period}`;
};

const getInitialDate = (_tasks: Task[]) => startOfDay(new Date());

export const CalendarSchedule: React.FC<CalendarScheduleProps> = ({ onAddTaskPress, onTaskPress, onMenuPress }) => {
    const { tasks, theme, language, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const isDark = theme.scheme === 'dark';

    const monthLabels = language === 'te' ? MONTHS_TE : MONTHS;
    const dayLabels = language === 'te' ? DAY_LABELS_TE : DAY_LABELS_SHORT;

    // Alternating blue/orange colors matching reference image
    const eventColors = React.useMemo(() => [
        {
            borderLeftColor: isDark ? '#0A3DBF' : '#0A66FF',
            bg: isDark ? 'rgba(10,60,180,0.85)' : '#E8F0FF',
            titleColor: isDark ? '#FFFFFF' : '#0A3DBF',
            timeColor: isDark ? 'rgba(255,255,255,0.75)' : '#3B6FD4',
        },
        {
            borderLeftColor: isDark ? '#FF6B00' : '#FF6B00',
            bg: isDark ? 'rgba(120,55,0,0.90)' : '#FFF0E0',
            titleColor: isDark ? '#FFFFFF' : '#FF6B00',
            timeColor: isDark ? 'rgba(255,255,255,0.75)' : '#A0540A',
        },
        {
            borderLeftColor: isDark ? '#0A3DBF' : '#0A66FF',
            bg: isDark ? 'rgba(10,60,180,0.85)' : '#E8F0FF',
            titleColor: isDark ? '#FFFFFF' : '#0A3DBF',
            timeColor: isDark ? 'rgba(255,255,255,0.75)' : '#3B6FD4',
        },
        {
            borderLeftColor: isDark ? '#783700' : '#FF6B00',
            bg: isDark ? 'rgba(120,55,0,0.90)' : '#FFF0E0',
            titleColor: isDark ? '#FFFFFF' : '#FF6B00',
            timeColor: isDark ? 'rgba(255,255,255,0.75)' : '#A0540A',
        },
        {
            borderLeftColor: isDark ? '#0A3DBF' : '#0A66FF',
            bg: isDark ? 'rgba(10,60,180,0.85)' : '#E8F0FF',
            titleColor: isDark ? '#FFFFFF' : '#0A3DBF',
            timeColor: isDark ? 'rgba(255,255,255,0.75)' : '#3B6FD4',
        },
        {
            borderLeftColor: isDark ? '#783700' : '#FF6B00',
            bg: isDark ? 'rgba(120,55,0,0.90)' : '#FFF0E0',
            titleColor: isDark ? '#FFFFFF' : '#FF6B00',
            timeColor: isDark ? 'rgba(255,255,255,0.75)' : '#A0540A',
        },
    ], [isDark]);

    const [selectedDate, setSelectedDate] = useState(() => getInitialDate(tasks));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(() => selectedDate.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(() => selectedDate.getMonth());

    const weekDates = useMemo(() => buildWeek(selectedDate, dayLabels), [selectedDate, dayLabels]);
    const selectedKey = dateKey(selectedDate);

    const selectedTasks = useMemo(() => (
        tasks
            .filter(t => !t.id.startsWith('c-'))
            .filter(t => {
                const td = parseTaskDate(t.dueDate);
                return td ? dateKey(td) === selectedKey : false;
            })
            .sort((a, b) => getTaskTimes(a).start - getTaskTimes(b).start)
    ), [tasks, selectedKey]);

    const scheduledItems = useMemo(() => selectedTasks.map((task, index) => {
        const times = getTaskTimes(task);
        const color = eventColors[index % eventColors.length];
        return { task, index, ...times, ...color };
    }), [selectedTasks, eventColors]);

    const timelineStartHour = Math.min(8, Math.max(0, Math.floor((scheduledItems[0]?.start ?? 8 * 60) / 60)));
    const timelineEndHour = Math.max(
        21,
        Math.min(24, Math.ceil(((scheduledItems[scheduledItems.length - 1]?.end ?? 21 * 60) + 30) / 60)),
    );
    const timelineHours = Array.from(
        { length: timelineEndHour - timelineStartHour + 1 },
        (_, i) => timelineStartHour + i,
    );
    const timelineHeight = timelineHours.length * ROW_HEIGHT;
    const todayKey = dateKey(new Date());
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const showNowLine = selectedKey === todayKey && nowMinutes >= timelineStartHour * 60 && nowMinutes <= timelineEndHour * 60;

    const changeWeek = (direction: -1 | 1) => {
        setSelectedDate(prev => new Date(prev.getTime() + direction * 7 * DAY_MS));
    };

    const openDatePicker = () => {
        setPickerYear(selectedDate.getFullYear());
        setPickerMonth(selectedDate.getMonth());
        setShowDatePicker(true);
    };

    const openCreateForTime = (minutes: number) => {
        onAddTaskPress({
            dueDate: formatTaskDate(selectedDate),
            dueTime: formatMinutes(minutes),
        });
    };

    const selectPickerDay = (day: number) => {
        setSelectedDate(new Date(pickerYear, pickerMonth, day));
        setShowDatePicker(false);
    };

    const pickerDays = useMemo(() => {
        const firstDayIndex = new Date(pickerYear, pickerMonth, 1).getDay();
        const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate();
        return [
            ...Array.from({ length: firstDayIndex }, () => null),
            ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
        ] as Array<number | null>;
    }, [pickerMonth, pickerYear]);

    const pickerYears = useMemo(() => (
        Array.from({ length: 7 }, (_, i) => pickerYear - 3 + i)
    ), [pickerYear]);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={isDark ? [theme.bgTop, theme.bgMid, theme.bgBottom] : ['#F4F8FF', '#FFFFFF', '#F0F4FF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7} onPress={onMenuPress}>
                    <Ionicons name="menu-outline" size={26} color={isDark ? '#F8FAFC' : '#1F2937'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.monthButton} onPress={openDatePicker} activeOpacity={0.8}>
                    <Text style={styles.monthText}>
                        {monthLabels[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={isDark ? '#F8FAFC' : '#1F2937'} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerIcon} onPress={() => openCreateForTime(9 * 60)} activeOpacity={0.7}>
                    <Ionicons name="calendar-outline" size={24} color={isDark ? '#F8FAFC' : '#1F2937'} />
                </TouchableOpacity>
            </View>

            {/* ── Week Strip ── */}
            <View style={styles.weekStrip}>
                {weekDates.map(item => {
                    const active = item.key === selectedKey;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.dayPill, active && styles.activeDayPill]}
                            onPress={() => setSelectedDate(item.date)}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.dayLabel, active && styles.activeDayLabel]}>{item.label}</Text>
                            <Text style={[styles.dayNumber, active && styles.activeDayNumber]}>{item.day}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── Selected Date Label ── */}
            <Text style={styles.selectedDateLabel}>
                {formatSelectedDateLabel(selectedDate)}
            </Text>

            {/* ── Timeline ── */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.timeline, { height: timelineHeight }]}>

                    {/* Current time indicator */}
                    {showNowLine && (
                        <View
                            style={[
                                styles.nowLine,
                                { top: ((nowMinutes - timelineStartHour * 60) / 60) * ROW_HEIGHT + 8 },
                            ]}
                        >
                            <View style={styles.nowDot} />
                        </View>
                    )}

                    {/* Hour rows */}
                    {timelineHours.map((hour, index) => (
                        <TouchableOpacity
                            key={hour}
                            style={styles.hourRow}
                            activeOpacity={0.6}
                            onPress={() => openCreateForTime(hour * 60)}
                        >
                            <Text style={styles.hourText}>{formatHourLabel(hour)}</Text>
                            <View style={[styles.hourLine, index === 0 && styles.hourLineFirst]} />
                        </TouchableOpacity>
                    ))}

                    {/* Event cards */}
                    {scheduledItems.map(item => {
                        const top = ((item.start - timelineStartHour * 60) / 60) * ROW_HEIGHT + 8;
                        const height = Math.max(52, ((item.end - item.start) / 60) * ROW_HEIGHT - 6);
                        return (
                            <TouchableOpacity
                                key={item.task.id}
                                style={[styles.eventCard, { top, height, backgroundColor: item.bg, borderWidth: 2, borderLeftWidth: 4, borderLeftColor: item.borderLeftColor, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}
                                activeOpacity={0.82}
                                onPress={() => onTaskPress ? onTaskPress(item.task) : openCreateForTime(item.start)}
                            >
                                <Text style={[styles.eventTitle, { color: item.titleColor }]} numberOfLines={1}>
                                    {item.task.title}
                                </Text>
                                <Text style={[styles.eventTime, { color: item.timeColor }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}

                    {/* Empty state */}
                    {scheduledItems.length === 0 && (
                        <TouchableOpacity
                            style={styles.emptyState}
                            activeOpacity={0.78}
                            onPress={() => openCreateForTime(9 * 60)}
                        >
                            <Ionicons name="calendar-clear-outline" size={36} color={theme.electricBlue} />
                            <Text style={styles.emptyTitle}>{t('noTasksScheduled')}</Text>
                            <Text style={styles.emptyText}>{formatTaskDate(selectedDate)}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            {/* ── Date Picker Modal ── */}
            <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity style={styles.pickerArrow} onPress={() => setPickerYear(y => y - 1)}>
                                <Ionicons name="chevron-back" size={22} color={theme.electricBlue} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.todayButton}
                                onPress={() => {
                                    const today = startOfDay(new Date());
                                    setPickerYear(today.getFullYear());
                                    setPickerMonth(today.getMonth());
                                    setSelectedDate(today);
                                    setShowDatePicker(false);
                                }}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.pickerTitle}>{monthLabels[pickerMonth]} {pickerYear}</Text>
                                <Text style={styles.todayText}>{t('today')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.pickerArrow} onPress={() => setPickerYear(y => y + 1)}>
                                <Ionicons name="chevron-forward" size={22} color={theme.electricBlue} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearStrip}>
                            {pickerYears.map(year => {
                                const active = year === pickerYear;
                                return (
                                    <TouchableOpacity
                                        key={year}
                                        style={[styles.yearPill, active && styles.activePickerPill]}
                                        onPress={() => setPickerYear(year)}
                                    >
                                        <Text style={[styles.yearText, active && styles.activePickerText]}>{year}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <View style={styles.monthGrid}>
                            {monthLabels.map((month, index) => {
                                const active = index === pickerMonth;
                                return (
                                    <TouchableOpacity
                                        key={month}
                                        style={[styles.monthPill, active && styles.activePickerPill]}
                                        onPress={() => setPickerMonth(index)}
                                    >
                                        <Text style={[styles.monthPillText, active && styles.activePickerText]}>{month.slice(0, 3)}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.weekdayRow}>
                            {(language === 'te'
                                ? ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ']
                                : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
                            ).map(d => (
                                <Text key={d} style={styles.weekdayText}>{d}</Text>
                            ))}
                        </View>

                        <View style={styles.dayGrid}>
                            {pickerDays.map((day, index) => {
                                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                                const active = selectedDate.getDate() === day
                                    && selectedDate.getMonth() === pickerMonth
                                    && selectedDate.getFullYear() === pickerYear;
                                return (
                                    <TouchableOpacity
                                        key={`${pickerYear}-${pickerMonth}-${day}`}
                                        style={[styles.dayCell, active && styles.activeDayCell]}
                                        onPress={() => selectPickerDay(day)}
                                    >
                                        <Text style={[styles.dayCellText, active && styles.activeDayCellText]}>{day}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const createStyles = (theme: AppTheme) => {
    const isDark = theme.scheme === 'dark';
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: 'transparent',
            paddingTop: 30,
        },

        // ── Header ──
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingBottom: 16,
        },
        headerIcon: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
        },
        monthButton: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        monthText: {
            color: isDark ? '#F8FAFC' : '#1F2937',
            fontSize: 20,
            fontWeight: '700',
            letterSpacing: -0.3,
        },

        // ── Week Strip ──
        weekStrip: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            marginBottom: 4,
        },
        dayPill: {
            width: 44,
            paddingVertical: 8,
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: 'transparent',
        },
        activeDayPill: {
            backgroundColor: '#0A66FF',
        },
        dayLabel: {
            fontSize: 12,
            fontWeight: '500',
            color: isDark ? 'rgba(248,250,252,0.55)' : '#6B7280',
            marginBottom: 6,
        },
        activeDayLabel: {
            color: '#FFFFFF',
        },
        dayNumber: {
            fontSize: 18,
            fontWeight: '700',
            color: isDark ? '#F8FAFC' : '#1F2937',
        },
        activeDayNumber: {
            color: '#FFFFFF',
        },

        // ── Selected Date Label ──
        selectedDateLabel: {
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '600',
            color: '#0A66FF',
            marginTop: 8,
            marginBottom: 12,
        },

        // ── Timeline ──
        scrollContent: {
            paddingBottom: 120,
        },
        timeline: {
            paddingHorizontal: 16,
            position: 'relative',
        },
        hourRow: {
            height: ROW_HEIGHT,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        hourText: {
            width: TIME_COL_WIDTH,
            fontSize: 12,
            fontWeight: '500',
            color: isDark ? 'rgba(248,250,252,0.5)' : '#9CA3AF',
            paddingTop: 2,
        },
        hourLine: {
            flex: 1,
            height: 1,
            backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)',
            marginTop: 7,
        },
        hourLineFirst: {
            backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)',
        },

        // Now line
        nowLine: {
            position: 'absolute',
            left: TIME_COL_WIDTH + 16,
            right: 16,
            height: 1.5,
            backgroundColor: '#0A66FF',
            zIndex: 3,
        },
        nowDot: {
            position: 'absolute',
            left: -5,
            top: -4,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#0A66FF',
        },

        // Event cards — full-width, no dot
        eventCard: {
            position: 'absolute',
            left: TIME_COL_WIDTH + 16 + 4,
            right: 16,
            borderRadius: 12,
            paddingHorizontal: 18,
            paddingVertical: 14,
            justifyContent: 'center',
            zIndex: 4,
        },
        eventTitle: {
            fontSize: 15,
            fontWeight: '700',
            marginBottom: 4,

        },
        eventTime: {
            fontSize: 13,
            fontWeight: '500',
        },

        // Empty state
        emptyState: {
            position: 'absolute',
            left: TIME_COL_WIDTH + 20,
            right: 16,
            top: 80,
            minHeight: 140,
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
        },
        emptyTitle: {
            color: theme.text,
            fontSize: 16,
            fontWeight: '700',
            marginTop: 12,
        },
        emptyText: {
            color: theme.textMuted,
            fontSize: 13,
            fontWeight: '500',
            marginTop: 4,
        },

        // ── Date Picker Modal ──
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 22,
        },
        pickerCard: {
            width: '100%',
            maxWidth: 420,
            backgroundColor: isDark ? '#14213D' : '#FFFFFF',
            borderRadius: 20,
            padding: 20,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        },
        pickerHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
        },
        pickerArrow: {
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,102,255,0.08)',
        },
        todayButton: {
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 150,
        },
        pickerTitle: {
            color: theme.text,
            fontSize: 18,
            fontWeight: '800',
        },
        todayText: {
            color: theme.electricBlue,
            fontSize: 12,
            fontWeight: '700',
            marginTop: 3,
        },
        yearStrip: {
            paddingVertical: 4,
            paddingRight: 8,
            marginBottom: 12,
        },
        yearPill: {
            minWidth: 66,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
        },
        yearText: {
            color: theme.textSecondary,
            fontSize: 13,
            fontWeight: '700',
        },
        monthGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            marginBottom: 14,
        },
        monthPill: {
            width: '23%',
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
        },
        monthPillText: {
            color: theme.textSecondary,
            fontSize: 13,
            fontWeight: '700',
        },
        activePickerPill: {
            backgroundColor: theme.electricBlue,
        },
        activePickerText: {
            color: '#FFFFFF',
        },
        weekdayRow: {
            flexDirection: 'row',
            marginBottom: 8,
        },
        weekdayText: {
            width: '14.28%',
            color: theme.textMuted,
            fontSize: 12,
            fontWeight: '700',
            textAlign: 'center',
        },
        dayGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
        },
        dayCell: {
            width: '14.28%',
            height: 38,
            borderRadius: 19,
            alignItems: 'center',
            justifyContent: 'center',
        },
        activeDayCell: {
            backgroundColor: theme.electricBlue,
        },
        dayCellText: {
            color: theme.text,
            fontSize: 13,
            fontWeight: '700',
        },
        activeDayCellText: {
            color: '#FFFFFF',
        },
    });
};
