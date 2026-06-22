import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppTheme, useApp } from '../AppContext';
import { Task } from '../types';
import { glassButton, glassHeader, glassInput, glassPanel, glowShadow } from '../theme/glass';

interface AddTaskProps {
  onClose: () => void;
  onSuccess: () => void;
  task?: Task | null;
  initialValues?: Partial<TaskFormValues> | null;
}

interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_TE = [
  'జనవరి', 'ఫిబ్రవరి', 'మార్చి', 'ఏప్రిల్', 'మే', 'జూన్',
  'జూలై', 'ఆగస్టు', 'సెప్టెంబర్', 'అక్టోబర్', 'నవంబర్', 'డిసెంబర్',
];

const TIME_OPTIONS = [
  '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM',
  '04:00 PM', '05:30 PM', '07:00 PM', '09:30 PM',
];

const formatToDisplayTime = (input: string) => {
  const value = input.trim().toUpperCase();
  const twelveHourMatch = value.match(/^(\d{1,2}):(\d{1,2})\s*(AM|PM)$/i);
  if (twelveHourMatch) {
    const hour = Number(twelveHourMatch[1]);
    const minute = Number(twelveHourMatch[2]);
    const period = twelveHourMatch[3].toUpperCase();
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')} ${period}`;
  }

  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{1,2})$/);
  if (twentyFourHourMatch) {
    const hour24 = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);
    if (hour24 < 0 || hour24 > 23 || minute < 0 || minute > 59) return null;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 || 12;
    return `${`${hour12}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')} ${period}`;
  }

  return null;
};

const isValidDisplayTime = (value: string) => Boolean(formatToDisplayTime(value));

const formatDate = (date: Date) => `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;

const addMinutes = (time: string, minutesToAdd: number) => {
  const match = time.match(/^(\d{1,2}):(\d{2})\s(AM|PM)$/i);
  if (!match) return `${time} - ${time}`;

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;

  const total = hour * 60 + minute + minutesToAdd;
  const normalized = ((total % 1440) + 1440) % 1440;
  const endHour24 = Math.floor(normalized / 60);
  const endMinute = normalized % 60;
  const endPeriod = endHour24 >= 12 ? 'PM' : 'AM';
  const endHour12 = endHour24 % 12 || 12;
  const endTime = `${`${endHour12}`.padStart(2, '0')}:${`${endMinute}`.padStart(2, '0')} ${endPeriod}`;

  return `${time} - ${endTime}`;
};

const parseDateParts = (value?: string) => {
  const match = value?.match(/^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/);
  if (!match) return null;
  const monthIndex = MONTHS.findIndex(month => month.toLowerCase() === match[1].toLowerCase());
  if (monthIndex < 0) return null;
  return { month: monthIndex, year: Number(match[3]) };
};

export const AddTask: React.FC<AddTaskProps> = ({ onClose, onSuccess, task, initialValues }) => {
  const { projects, addTask, updateTask, theme, language, t } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const monthLabels = language === 'te' ? MONTHS_TE : MONTHS;
  const { width } = useWindowDimensions();
  const today = useMemo(() => new Date(), []);
  const initialDateParts = parseDateParts(task?.dueDate || initialValues?.dueDate);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [customTimeInput, setCustomTimeInput] = useState('');
  const [customTimeError, setCustomTimeError] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(initialDateParts?.month ?? today.getMonth());
  const [calendarYear, setCalendarYear] = useState(initialDateParts?.year ?? today.getFullYear());

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormValues>({
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate || initialValues?.dueDate || '',
      dueTime: task?.dueTime || initialValues?.dueTime || '',
    },
    mode: 'onSubmit',
  });

  const descriptionValue = watch('description') || '';
  const selectedDate = watch('dueDate');
  const selectedTime = watch('dueTime');
  const isCompact = width < 380;
  const pagePadding = isCompact ? 18 : 22;
  const cardPadding = isCompact ? 18 : 22;

  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const firstDayIndex = new Date(calendarYear, calendarMonth, 1).getDay();
  const dayItems: (number | null)[] = [
    ...Array.from({ length: firstDayIndex }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  const shiftMonth = (direction: -1 | 1) => {
    if (direction === -1 && calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(year => year - 1);
      return;
    }
    if (direction === 1 && calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(year => year + 1);
      return;
    }
    setCalendarMonth(month => month + direction);
  };

  const selectDay = (day: number) => {
    const nextDate = new Date(calendarYear, calendarMonth, day);
    setValue('dueDate', formatDate(nextDate), { shouldValidate: true, shouldDirty: true });
    setShowDateModal(false);
  };

  const selectTime = (time: string) => {
    setValue('dueTime', time, { shouldValidate: true, shouldDirty: true });
    setCustomTimeInput(time);
    setCustomTimeError(null);
    setShowTimeModal(false);
  };

  const openTimeModal = () => {
    setCustomTimeInput(selectedTime || '');
    setCustomTimeError(null);
    setShowTimeModal(true);
  };

  const applyCustomTime = () => {
    const normalized = formatToDisplayTime(customTimeInput);
    if (!normalized) {
      setCustomTimeError('Enter valid time like 12:01 PM or 14:01');
      return;
    }

    setValue('dueTime', normalized, { shouldValidate: true, shouldDirty: true });
    setCustomTimeInput(normalized);
    setCustomTimeError(null);
    setShowTimeModal(false);
  };

  const onSubmit = async (values: TaskFormValues) => {
    setServerError(null);
    const trimmedTitle = values.title.trim();
    const trimmedDescription = values.description.trim();
    const timeSlot = addMinutes(values.dueTime, 60);
    const result = task
      ? updateTask(task.id, {
        title: trimmedTitle,
        description: trimmedDescription,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        timeSlot,
      })
      : addTask({
        title: trimmedTitle,
        description: trimmedDescription,
        dueDate: values.dueDate,
        dueTime: values.dueTime,
        priority: 'Medium',
        project: projects[0]?.name || 'General',
        tags: ['General'],
        timeSlot,
        assigneeIds: ['1'],
      });

    const resolved = await result;

    if (!resolved.success) {
      setServerError(resolved.error || t('unableCreateTask'));
      return;
    }

    onSuccess();
  };

  const selectedDayNumber = selectedDate.match(/\s(\d{1,2}),/)?.[1];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient
        colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <View style={[styles.header, { paddingHorizontal: pagePadding }]}>
        <TouchableOpacity style={styles.headerButton} onPress={onClose} activeOpacity={0.8}>
          <Ionicons name="chevron-back" size={30} color={theme.orangeAccent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{task ? t('editTask') : t('createTask')}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit(onSubmit)} activeOpacity={0.8}>
          <Text style={styles.saveText}>{t('save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: pagePadding }]}
      >
        <View style={[styles.formCard, { paddingHorizontal: cardPadding }]}>
          {serverError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={theme.error} />
              <Text style={styles.errorBannerText}>{serverError}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('taskName')} <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="title"
              rules={{
                required: t('taskNameRequired'),
                minLength: { value: 3, message: t('taskNameMin') },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputBox, errors.title && styles.inputBoxError]}>
                  <Ionicons name="document-text-outline" size={24} color={theme.orangeAccent} />
                  <TextInput
                    style={styles.input}
                    placeholder={t('enterTaskName')}
                    placeholderTextColor={theme.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    returnKeyType="next"
                  />
                </View>
              )}
            />
            {errors.title?.message && <Text style={styles.errorText}>{errors.title.message}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('description')}</Text>
            <Controller
              control={control}
              name="description"
              rules={{
                maxLength: { value: 500, message: t('descriptionMax') },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.inputBox, styles.textAreaBox, errors.description && styles.inputBoxError]}>
                  <Ionicons name="list-outline" size={24} color={theme.orangeAccent} style={styles.textAreaIcon} />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder={t('enterTaskDescription')}
                    placeholderTextColor={theme.placeholder}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    maxLength={500}
                    textAlignVertical="top"
                  />
                  <Text style={styles.counter}>{descriptionValue.length}/500</Text>
                </View>
              )}
            />
            {errors.description?.message && <Text style={styles.errorText}>{errors.description.message}</Text>}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t('dueDate')} <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="dueDate"
              rules={{ required: t('dueDateRequired') }}
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[styles.inputBox, errors.dueDate && styles.inputBoxError]}
                  onPress={() => setShowDateModal(true)}
                  activeOpacity={0.82}
                >
                  <Ionicons name="calendar-outline" size={24} color={theme.orangeAccent} />
                  <Text style={[styles.selectText, !value && styles.placeholderText]}>
                    {value || t('selectDueDate')}
                  </Text>
                  <Ionicons name="chevron-down" size={24} color={theme.orangeAccent} />
                </TouchableOpacity>
              )}
            />
            {errors.dueDate?.message && <Text style={styles.errorText}>{errors.dueDate.message}</Text>}
          </View>

          <View style={styles.fieldGroupLast}>
            <Text style={styles.label}>{t('dueTime')} <Text style={styles.required}>*</Text></Text>
            <Controller
              control={control}
              name="dueTime"
              rules={{
                required: t('dueTimeRequired'),
                validate: value => isValidDisplayTime(value) || 'Enter valid time like 12:01 PM',
              }}
              render={({ field: { value } }) => (
                <TouchableOpacity
                  style={[styles.inputBox, errors.dueTime && styles.inputBoxError]}
                  onPress={openTimeModal}
                  activeOpacity={0.82}
                >
                  <Ionicons name="time-outline" size={24} color={theme.orangeAccent} />
                  <Text style={[styles.selectText, !value && styles.placeholderText]}>
                    {value || t('selectDueTime')}
                  </Text>
                  <Ionicons name="chevron-down" size={24} color={theme.orangeAccent} />
                </TouchableOpacity>
              )}
            />
            {errors.dueTime?.message && <Text style={styles.errorText}>{errors.dueTime.message}</Text>}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showDateModal} transparent animationType="fade" onRequestClose={() => setShowDateModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDateModal(false)}>
          <View style={styles.pickerCard} onStartShouldSetResponder={() => true}>
            <View style={styles.pickerHeader}>
              <TouchableOpacity style={styles.pickerArrow} onPress={() => shiftMonth(-1)}>
                <Ionicons name="chevron-back" size={22} color={theme.orangeAccent} />
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>{monthLabels[calendarMonth]} {calendarYear}</Text>
              <TouchableOpacity style={styles.pickerArrow} onPress={() => shiftMonth(1)}>
                <Ionicons name="chevron-forward" size={22} color={theme.orangeAccent} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekdayRow}>
              {(language === 'te' ? ['ఆ', 'సో', 'మం', 'బు', 'గు', 'శు', 'శ'] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']).map(day => (
                <Text key={day} style={styles.weekdayText}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {dayItems.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const active = selectedDayNumber === `${day}` && selectedDate.includes(`${MONTHS[calendarMonth]} `) && selectedDate.includes(`${calendarYear}`);
                return (
                  <TouchableOpacity
                    key={`${calendarYear}-${calendarMonth}-${day}`}
                    style={[styles.dayCell, active && styles.activeDayCell]}
                    onPress={() => selectDay(day)}
                  >
                    <Text style={[styles.dayCellText, active && styles.activeDayCellText]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showTimeModal} transparent animationType="fade" onRequestClose={() => setShowTimeModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimeModal(false)}>
          <View style={styles.timePickerCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.pickerTitle}>{t('selectDueTimeTitle')}</Text>
            <View style={styles.customTimeSection}>
              <Text style={styles.customTimeLabel}>Enter Custom Time</Text>
              <View style={styles.customTimeRow}>
                <TextInput
                  style={styles.customTimeInput}
                  placeholder="12:01 PM or 14:01"
                  placeholderTextColor={theme.placeholder}
                  value={customTimeInput}
                  onChangeText={text => {
                    setCustomTimeInput(text);
                    if (customTimeError) setCustomTimeError(null);
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.customTimeButton} onPress={applyCustomTime} activeOpacity={0.84}>
                  <Text style={styles.customTimeButtonText}>Set</Text>
                </TouchableOpacity>
              </View>
              {customTimeError ? <Text style={styles.customTimeError}>{customTimeError}</Text> : null}
            </View>
            <View style={styles.timeGrid}>
              {TIME_OPTIONS.map(time => {
                const active = selectedTime === time;
                return (
                  <TouchableOpacity
                    key={time}
                    style={[styles.timePill, active && styles.activeTimePill]}
                    onPress={() => selectTime(time)}
                    activeOpacity={0.82}
                  >
                    <Text style={[styles.timePillText, active && styles.activeTimePillText]}>{time}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    height: 116,
    ...glassHeader(theme),
    paddingTop: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 48,
    height: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  saveButton: {
    minWidth: 58,
    height: 48,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  saveText: {
    color: theme.electricBlue,
    fontSize: 20,
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 28,
    paddingBottom: 80,
  },
  formCard: {
    ...glassPanel(theme),
    paddingTop: 28,
    paddingBottom: 28,
  },
  errorBanner: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: theme.errorBg,
    borderWidth: 1,
    borderColor: theme.errorBorder,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorBannerText: {
    color: theme.error,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 28,
  },
  fieldGroupLast: {
    marginBottom: 0,
  },
  label: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 14,
  },
  required: {
    color: theme.error,
  },
  inputBox: {
    minHeight: 58,
    ...glassInput(theme),
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputBoxError: {
    borderColor: theme.error,
    backgroundColor: theme.errorBg,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: theme.text,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 16,
    paddingVertical: 0,
  },
  textAreaBox: {
    minHeight: 170,
    alignItems: 'flex-start',
    paddingTop: 22,
    paddingBottom: 34,
  },
  textAreaIcon: {
    marginTop: 0,
  },
  textArea: {
    minHeight: 104,
    marginTop: -4,
  },
  counter: {
    position: 'absolute',
    right: 18,
    bottom: 16,
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '400',
  },
  selectText: {
    flex: 1,
    color: theme.text,
    fontSize: 17,
    fontWeight: '400',
    marginLeft: 16,
  },
  placeholderText: {
    color: theme.placeholder,
  },
  errorText: {
    color: theme.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.glassOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 390,
    ...glassPanel(theme),
    padding: 20,
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
    ...glassButton(theme, false, { borderRadius: 20 }),
  },
  pickerTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
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
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
  },
  activeDayCell: {
    backgroundColor: theme.electricBlue,
  },
  dayCellText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  activeDayCellText: {
    color: theme.textInverted,
  },
  timePickerCard: {
    width: '100%',
    maxWidth: 390,
    ...glassPanel(theme),
    padding: 22,
  },
  customTimeSection: {
    marginTop: 14,
  },
  customTimeLabel: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  customTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customTimeInput: {
    flex: 1,
    minHeight: 44,
    ...glassInput(theme, false, { borderRadius: 12 }),
    color: theme.text,
    fontSize: 15,
    paddingHorizontal: 12,
  },
  customTimeButton: {
    marginLeft: 10,
    minWidth: 62,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.electricBlue,
    ...glowShadow(theme, theme.electricBlue, 0.25),
  },
  customTimeButtonText: {
    color: theme.textInverted,
    fontSize: 14,
    fontWeight: '700',
  },
  customTimeError: {
    color: theme.error,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 18,
  },
  timePill: {
    width: '47%',
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '3%',
    marginBottom: 12,
    ...glassButton(theme, false, { borderRadius: 23 }),
  },
  activeTimePill: {
    backgroundColor: theme.electricBlue,
    borderColor: theme.electricBlue,
  },
  timePillText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '700',
  },
  activeTimePillText: {
    color: theme.textInverted,
  },
});
