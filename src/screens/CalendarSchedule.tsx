import React, { useMemo, useState } from 'react';
import { Modal, View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, useApp } from '../AppContext';
import { Task } from '../types';

interface CalendarScheduleProps {
    onBack: () => void;
    onAddTaskPress: (draft?: { dueDate: string; dueTime: string }) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const ROW_HEIGHT = 56;
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_TE = [
    'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
    'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
];
const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_TE = ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'];
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const dateKey = (date: Date) => {
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
};

const parseTaskDate = (value: string) => {
    const match = value.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
    if (!match) return null;

    const monthIndex = MONTHS.findIndex(month => month.toLowerCase() === match[1].toLowerCase());
    if (monthIndex < 0) return null;

    return new Date(Number(match[3]), monthIndex, Number(match[2]));
};

const formatTaskDate = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const getMonday = (date: Date) => {
    const safeDate = startOfDay(date);
    const day = safeDate.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    return new Date(safeDate.getTime() + diff * DAY_MS);
};

const buildWeek = (selectedDate: Date, dayLabels: string[]) => {
    const monday = getMonday(selectedDate);
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(monday.getTime() + index * DAY_MS);
        return {
            key: dateKey(date),
            date,
            label: dayLabels[date.getDay()],
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
    const hour24 = Math.floor(normalized / 60);
    const minute = normalized % 60;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${`${hour12}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')} ${period}`;
};

const formatHourLabel = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12} ${period}`;
};

const getInitialDate = (tasks: Task[]) => {
    const datedTask = tasks
        .filter(task => !task.id.startsWith('c-'))
        .map(task => parseTaskDate(task.dueDate))
        .filter((date): date is Date => Boolean(date))
        .sort((a, b) => a.getTime() - b.getTime())[0];

    return datedTask || startOfDay(new Date());
};

export const CalendarSchedule: React.FC<CalendarScheduleProps> = ({ onAddTaskPress }) => {
    const { tasks, theme, language, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const monthLabels = language === 'te' ? MONTHS_TE : MONTHS;
    const dayLabels = language === 'te' ? DAY_LABELS_TE : DAY_LABELS;
    const eventColors = React.useMemo(() => [
        { dot: '#8B7CFF', bg: theme.scheme === 'dark' ? 'rgba(109,93,246,0.18)' : '#EFEAFF' },
        { dot: '#F9B521', bg: theme.scheme === 'dark' ? 'rgba(249,181,33,0.18)' : '#FFF6E3' },
        { dot: '#4AB0FF', bg: theme.scheme === 'dark' ? 'rgba(46,155,239,0.18)' : '#E9F4FF' },
        { dot: '#55C982', bg: theme.scheme === 'dark' ? 'rgba(67,179,110,0.18)' : '#EAF8EE' },
        { dot: '#8B7CFF', bg: theme.scheme === 'dark' ? 'rgba(109,93,246,0.18)' : '#EFEAFF' },
        { dot: '#F06A8C', bg: theme.scheme === 'dark' ? 'rgba(216,79,116,0.18)' : '#FFEAF0' },
    ], [theme.scheme]);
    const [selectedDate, setSelectedDate] = useState(() => getInitialDate(tasks));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerYear, setPickerYear] = useState(() => selectedDate.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(() => selectedDate.getMonth());

    const weekDates = useMemo(() => buildWeek(selectedDate, dayLabels), [selectedDate, dayLabels]);
    const selectedKey = dateKey(selectedDate);

    const selectedTasks = useMemo(() => (
        tasks
            .filter(task => !task.id.startsWith('c-'))
            .filter(task => {
                const taskDate = parseTaskDate(task.dueDate);
                return taskDate ? dateKey(taskDate) === selectedKey : false;
            })
            .sort((a, b) => getTaskTimes(a).start - getTaskTimes(b).start)
    ), [tasks, selectedKey]);

    const scheduledItems = useMemo(() => selectedTasks.map((task, index) => {
        const times = getTaskTimes(task);
        const color = eventColors[index % eventColors.length];
        return { task, index, ...times, ...color };
    }), [selectedTasks]);

    const timelineStartHour = Math.min(8, Math.max(0, Math.floor((scheduledItems[0]?.start ?? 8 * 60) / 60)));
    const timelineEndHour = Math.max(
        21,
        Math.min(24, Math.ceil(((scheduledItems[scheduledItems.length - 1]?.end ?? 21 * 60) + 30) / 60)),
    );
    const timelineHours = Array.from(
        { length: timelineEndHour - timelineStartHour + 1 },
        (_, index) => timelineStartHour + index,
    );
    const timelineHeight = timelineHours.length * ROW_HEIGHT;
    const todayKey = dateKey(new Date());
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const showNowLine = selectedKey === todayKey && nowMinutes >= timelineStartHour * 60 && nowMinutes <= timelineEndHour * 60;

    const changeWeek = (direction: -1 | 1) => {
        setSelectedDate(prev => new Date(prev.getTime() + direction * 7 * DAY_MS));
    };

    const jumpToToday = () => setSelectedDate(startOfDay(new Date()));
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
            ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
        ] as Array<number | null>;
    }, [pickerMonth, pickerYear]);
    const pickerYears = useMemo(() => (
        Array.from({ length: 7 }, (_, index) => pickerYear - 3 + index)
    ), [pickerYear]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.monthControls}>
                    <TouchableOpacity style={styles.weekButton} onPress={() => changeWeek(-1)} activeOpacity={0.8}>
                        <Ionicons name="chevron-back" size={20} color={theme.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.monthButton} onPress={openDatePicker} activeOpacity={0.8}>
                        <Text style={styles.monthText}>{monthLabels[selectedDate.getMonth()]} {selectedDate.getFullYear()}</Text>
                        <Ionicons name="chevron-down" size={18} color={theme.icon} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekButton} onPress={() => changeWeek(1)} activeOpacity={0.8}>
                        <Ionicons name="chevron-forward" size={20} color={theme.icon} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.iconButton} onPress={() => openCreateForTime(9 * 60)} activeOpacity={0.8}>
                    <Ionicons name="add-circle-outline" size={28} color={theme.icon} />
                </TouchableOpacity>
            </View>

            <View style={styles.daysRow}>
                {weekDates.map(item => {
                    const active = item.key === selectedKey;
                    return (
                        <TouchableOpacity
                            key={item.key}
                            style={[styles.dayPill, active && styles.activeDayPill]}
                            onPress={() => setSelectedDate(item.date)}
                            activeOpacity={0.82}
                        >
                            <Text style={[styles.dayLabel, active && styles.activeDayText]}>{item.label}</Text>
                            <Text style={[styles.dayNumber, active && styles.activeDayText]}>{item.day}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineScroll}>
                <View style={[styles.timeline, { height: timelineHeight }]}>
                    {showNowLine && (
                        <View
                            style={[
                                styles.currentTimeLine,
                                { top: ((nowMinutes - timelineStartHour * 60) / 60) * ROW_HEIGHT + 6 },
                            ]}
                        >
                            <View style={styles.currentDot} />
                        </View>
                    )}

                    {timelineHours.map((hour, index) => (
                        <TouchableOpacity
                            key={hour}
                            style={styles.hourRow}
                            activeOpacity={0.72}
                            onPress={() => openCreateForTime(hour * 60)}
                        >
                            <Text style={styles.hourText}>{formatHourLabel(hour)}</Text>
                            <View style={[styles.hourRule, index === 0 && styles.firstHourRule]} />
                        </TouchableOpacity>
                    ))}

                    {scheduledItems.map(item => {
                        const top = ((item.start - timelineStartHour * 60) / 60) * ROW_HEIGHT + 14;
                        const height = Math.max(56, ((item.end - item.start) / 60) * ROW_HEIGHT - 8);

                        return (
                            <TouchableOpacity
                                key={item.task.id}
                                style={[styles.eventRow, { top }]}
                                activeOpacity={0.78}
                                onPress={() => openCreateForTime(item.start)}
                            >
                                <View style={[styles.eventDot, { backgroundColor: item.dot }]} />
                                <View style={[styles.eventCard, { backgroundColor: item.bg, minHeight: height }]}>
                                    <Text style={[styles.eventTitle, { color: item.dot }]} numberOfLines={1}>
                                        {item.task.title}
                                    </Text>
                                    <Text style={styles.eventTime}>{item.label}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}

                    {scheduledItems.length === 0 && (
                        <TouchableOpacity
                            style={styles.emptyState}
                            activeOpacity={0.78}
                            onPress={() => openCreateForTime(9 * 60)}
                        >
                            <Ionicons name="calendar-clear-outline" size={34} color={theme.textMuted} />
                            <Text style={styles.emptyTitle}>{t('noTasksScheduled')}</Text>
                            <Text style={styles.emptyText}>{formatTaskDate(selectedDate)}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>

            <Modal visible={showDatePicker} transparent animationType="fade" onRequestClose={() => setShowDatePicker(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
                    <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
                        <View style={styles.pickerHeader}>
                            <TouchableOpacity style={styles.pickerArrow} onPress={() => setPickerYear(year => year - 1)}>
                                <Ionicons name="chevron-back" size={22} color={theme.icon} />
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
                            <TouchableOpacity style={styles.pickerArrow} onPress={() => setPickerYear(year => year + 1)}>
                                <Ionicons name="chevron-forward" size={22} color={theme.icon} />
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
                            {(language === 'te' ? ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map(day => (
                                <Text key={day} style={styles.weekdayText}>{day}</Text>
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

const createStyles = (theme: AppTheme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.backgroundAlt,
        paddingTop: 58,
    },
    header: {
        paddingHorizontal: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    monthControls: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    monthButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    weekButton: {
        width: 30,
        height: 34,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthText: {
        color: theme.text,
        fontSize: 22,
        fontWeight: '800',
        marginRight: 8,
    },
    iconButton: {
        width: 42,
        height: 42,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 22,
        marginTop: 24,
        marginBottom: 18,
    },
    dayPill: {
        width: 48,
        minHeight: 68,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeDayPill: {
        backgroundColor: theme.purpleAccent,
        shadowColor: theme.purpleAccent,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 6,
    },
    dayLabel: {
        color: theme.textSecondary,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 7,
    },
    dayNumber: {
        color: theme.text,
        fontSize: 18,
        fontWeight: '700',
    },
    activeDayText: {
        color: theme.textInverted,
    },
    timelineScroll: {
        paddingBottom: 116,
    },
    timeline: {
        paddingHorizontal: 22,
        position: 'relative',
    },
    hourRow: {
        height: ROW_HEIGHT,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    hourText: {
        width: 56,
        color: theme.textSecondary,
        fontSize: 15,
        fontWeight: '500',
    },
    hourRule: {
        flex: 1,
        height: 1,
        backgroundColor: theme.divider,
        marginTop: 6,
    },
    firstHourRule: {
        backgroundColor: theme.purpleAccent,
    },
    currentTimeLine: {
        position: 'absolute',
        left: 78,
        right: 22,
        height: 1.5,
        backgroundColor: theme.purpleAccent,
        zIndex: 3,
    },
    currentDot: {
        position: 'absolute',
        left: -5,
        top: -4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.purpleAccent,
    },
    eventRow: {
        position: 'absolute',
        left: 76,
        right: 22,
        flexDirection: 'row',
        alignItems: 'flex-start',
        zIndex: 4,
    },
    eventDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
        marginTop: 24,
    },
    eventCard: {
        flex: 1,
        borderRadius: 12,
        justifyContent: 'center',
        paddingHorizontal: 22,
        paddingVertical: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 6,
    },
    eventTime: {
        color: theme.textSecondary,
        fontSize: 14,
        fontWeight: '500',
    },
    emptyState: {
        position: 'absolute',
        left: 78,
        right: 22,
        top: 120,
        minHeight: 140,
        borderRadius: 16,
        backgroundColor: theme.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
    },
    emptyTitle: {
        color: theme.text,
        fontSize: 16,
        fontWeight: '800',
        marginTop: 12,
    },
    emptyText: {
        color: theme.textMuted,
        fontSize: 14,
        fontWeight: '500',
        marginTop: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.32)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 22,
    },
    pickerCard: {
        width: '100%',
        maxWidth: 420,
        backgroundColor: theme.surface,
        borderRadius: 18,
        padding: 20,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
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
        borderRadius: 20,
        backgroundColor: theme.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
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
        color: theme.purpleAccent,
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
        backgroundColor: theme.surfaceAlt,
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
        backgroundColor: theme.surfaceAlt,
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
        backgroundColor: theme.purpleAccent,
    },
    activePickerText: {
        color: theme.textInverted,
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
        backgroundColor: theme.purpleAccent,
    },
    dayCellText: {
        color: theme.text,
        fontSize: 13,
        fontWeight: '700',
    },
    activeDayCellText: {
        color: theme.textInverted,
    },
});
