import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import type { Session, User as AuthUser } from '@supabase/supabase-js';

import { Task, Project, TaskAssignee, TaskStatus, TaskPriority } from './types';
import { mockProjects, mockAssignees } from './mockData';
import { Language, translate } from './i18n';
import { buildTimeSlot, formatDbTimeToDisplay, formatDisplayDate, normalizeTimeForDb, parseDisplayDateToIso } from './lib/date';
import { assertSupabaseConfigured, supabase } from './lib/supabase';
import { syncPushTokenToBackendAsync } from './notifications';

export const COLORS = {
    // Premium Brand Colors
    primaryBlue: '#0A66FF',
    deepNavy: '#052A6E',
    accentOrange: '#FF6B00',

    // Legacy colors (kept for compatibility)
    electricBlue: '#0A66FF',
    blue: '#0A66FF',
    brightBlue: '#1E6FFF',
    blueDeep: '#1565C0',
    deepNavyCompat: '#052A6E',
    navy: '#0B1F4D',
    purpleAccent: '#6D4AFF',
    pinkAccent: '#FF3D7F',
    orangeAccent: '#FF6B00',
    goldenOrange: '#FF9A00',
    coralRed: '#FF3D3D',

    // Gradients
    gradientStart: '#0A66FF',
    gradientMid: '#3B82F6',
    gradientEnd: '#FF6B00',

    bgTop: '#0A1628',
    bgMid: '#0E1F3D',
    bgBottom: '#1C0D06',
    bgBlue: 'rgba(10,102,255,0.12)',
    bgPurple: 'rgba(10,102,255,0.08)',
    bgOrange: 'rgba(255,107,0,0.12)',
    bgBlack: '#06080F',
    textPrimary: '#F4F8FF',
    textSecondary: 'rgba(244,248,255,0.65)',
    textLight: 'rgba(244,248,255,0.38)',
    cardWhite: 'rgba(255,255,255,0.08)',
    cardDark1: 'rgba(255,255,255,0.05)',
    cardDark2: 'rgba(255,255,255,0.03)',
    borderLight: 'rgba(255,255,255,0.10)',
    borderMedium: 'rgba(255,255,255,0.16)',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    // Glassmorphism tokens
    glassBg: 'rgba(255,255,255,0.08)',
    glassBgStrong: 'rgba(255,255,255,0.14)',
    glassBgMuted: 'rgba(255,255,255,0.05)',
    glassInput: 'rgba(255,255,255,0.07)',
    glassPressed: 'rgba(255,255,255,0.16)',
    glassBorder: 'rgba(255,255,255,0.15)',
    glassBorderStrong: 'rgba(255,255,255,0.22)',
    glassHighlight: 'rgba(255,255,255,0.18)',
    glassOverlay: 'rgba(0,0,0,0.72)',
    glassShadow: '#000000',
    glassShadowOpacity: 0.12,
    glassElevation: 8,
    glassRadius: 18,
    glassRadiusLg: 24,
    glowBlue: 'rgba(10,102,255,0.35)',
    glowOrange: 'rgba(255,107,0,0.35)',
    glowGold: 'rgba(255,154,0,0.25)',
    orbBlue: 'rgba(10,102,255,0.14)',
    orbOrange: 'rgba(255,107,0,0.12)',
    tabBarGlass: 'rgba(6,8,15,0.88)',
};

export const LIGHT_THEME = {
    ...COLORS,
    scheme: 'light' as const,
    // Premium Light Mode Backgrounds
    bgTop: '#F7FAFF',
    bgMid: '#FFFFFF',
    bgBottom: '#F0F4FF',
    background: '#F7FAFF',
    backgroundAlt: '#FFFFFF',
    surface: 'rgba(255,255,255,0.7)',
    surfaceAlt: 'rgba(255,255,255,0.55)',
    surfaceMuted: 'rgba(255,255,255,0.45)',
    text: '#1F2937',
    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',
    textInverted: '#FFFFFF',
    icon: '#1F2937',
    border: 'rgba(0,0,0,0.08)',
    divider: 'rgba(0,0,0,0.06)',
    overlay: 'rgba(0,0,0,0.32)',
    shadow: '#003080',
    tabInactive: '#9CA3AF',
    input: 'rgba(255,255,255,0.85)',
    inputMuted: 'rgba(255,255,255,0.65)',
    placeholder: '#D1D5DB',
    dangerBg: 'rgba(239,68,68,0.08)',
    errorBg: 'rgba(239,68,68,0.06)',
    errorBorder: 'rgba(239,68,68,0.20)',
    avatarBg: 'rgba(10,102,255,0.12)',
    avatarInner: 'rgba(10,102,255,0.20)',
    cardShadowOpacity: 0.10,
    inputBg: 'rgba(255,255,255,0.80)',
    inputBorder: 'rgba(0,0,0,0.08)',
    inputFocusBorder: '#0A66FF',
    textDark: '#1F2937',
    textGray: '#9CA3AF',
    // Premium Glassmorphism Light
    glassBg: 'rgba(255,255,255,0.6)',
    glassBgStrong: 'rgba(255,255,255,0.8)',
    glassBgMuted: 'rgba(255,255,255,0.45)',
    glassInput: 'rgba(255,255,255,0.65)',
    glassPressed: 'rgba(255,255,255,0.9)',
    glassBorder: 'rgba(10,102,255,0.15)',
    glassBorderStrong: 'rgba(10,102,255,0.25)',
    glassHighlight: 'rgba(255,255,255,0.9)',
    glassOverlay: 'rgba(0,0,0,0.25)',
    glassShadow: '#000000',
    glassShadowOpacity: 0.08,
    glassElevation: 6,
    glassRadius: 24,
    glassRadiusLg: 24,
    tabBarGlass: 'rgba(255,255,255,0.75)',
    // Brand colors
    blue: '#0A66FF',
    blueDeep: '#0A66FF',
    navy: '#1F2937',
};

export const DARK_THEME = {
    ...COLORS,
    scheme: 'dark' as const,
    // Premium Dark Mode Backgrounds
    bgTop: '#081220',
    bgMid: '#0D1825',
    bgBottom: '#132438',
    background: '#081220',
    backgroundAlt: '#0D1825',
    surface: 'rgba(255,255,255,0.06)',
    surfaceAlt: 'rgba(255,255,255,0.09)',
    surfaceMuted: 'rgba(255,255,255,0.04)',
    text: '#F8FAFC',
    textPrimary: '#F8FAFC',
    textSecondary: 'rgba(248,250,252,0.7)',
    textMuted: 'rgba(248,250,252,0.45)',
    textInverted: '#FFFFFF',
    icon: '#F8FAFC',
    border: 'rgba(255,255,255,0.10)',
    divider: 'rgba(255,255,255,0.07)',
    overlay: 'rgba(0,0,0,0.72)',
    shadow: '#000000',
    tabInactive: 'rgba(248,250,252,0.40)',
    input: 'rgba(255,255,255,0.06)',
    inputMuted: 'rgba(255,255,255,0.04)',
    placeholder: 'rgba(248,250,252,0.35)',
    dangerBg: 'rgba(239,68,68,0.12)',
    errorBg: 'rgba(239,68,68,0.10)',
    errorBorder: 'rgba(239,68,68,0.30)',
    avatarBg: 'rgba(10,102,255,0.18)',
    avatarInner: 'rgba(10,102,255,0.28)',
    cardShadowOpacity: 0.30,
    inputBg: 'rgba(255,255,255,0.06)',
    inputBorder: 'rgba(255,255,255,0.10)',
    inputFocusBorder: '#0A66FF',
    textDark: '#F8FAFC',
    textGray: 'rgba(248,250,252,0.55)',
    // Brand Colors Dark
    blue: '#0A66FF',
    blueDeep: '#0A66FF',
    navy: '#F8FAFC',
    // Premium Glassmorphism Dark
    glassBg: 'rgba(255,255,255,0.08)',
    glassBgStrong: 'rgba(255,255,255,0.14)',
    glassBgMuted: 'rgba(255,255,255,0.05)',
    glassInput: 'rgba(255,255,255,0.07)',
    glassPressed: 'rgba(255,255,255,0.16)',
    glassBorder: 'rgba(10,102,255,0.2)',
    glassBorderStrong: 'rgba(10,102,255,0.3)',
    glassHighlight: 'rgba(255,255,255,0.18)',
    glassOverlay: 'rgba(0,0,0,0.72)',
    glassShadow: '#000000',
    glassShadowOpacity: 0.22,
    glassElevation: 10,
    glassRadius: 24,
    glassRadiusLg: 24,
    tabBarGlass: 'rgba(6,8,15,0.90)',
};

export type AppTheme = typeof LIGHT_THEME | typeof DARK_THEME;

type ActionResult = { success: boolean; error?: string; requiresEmailConfirmation?: boolean };

interface User {
    id: string;
    name: string;
    email: string;
    photoUri?: string;
    about?: string;
    joinedAt: string;
}

interface ProfileRow {
    id: string;
    full_name: string;
    email: string;
    about: string | null;
    photo_url: string | null;
    created_at: string;
}

interface TaskRow {
    id: string;
    user_id: string;
    title: string;
    description: string | null;
    due_date: string;
    due_time: string;
    time_zone: string | null;
    status: 'pending' | 'completed';
}

interface NotificationSettingsRow {
    user_id: string;
    master_enabled: boolean;
    task_reminders: boolean;
    task_due_today: boolean;
    task_overdue: boolean;
    task_completed: boolean;
    tips_and_suggestions: boolean;
    promotions: boolean;
    default_reminder_minutes: number;
    snooze_minutes: number;
    quiet_hours_start: string;
    quiet_hours_end: string;
}

export interface NotificationSettingsState {
    masterEnabled: boolean;
    taskReminders: boolean;
    taskDueToday: boolean;
    taskOverdue: boolean;
    taskCompleted: boolean;
    tipsAndSuggestions: boolean;
    promotions: boolean;
    defaultReminderMinutes: number;
    snoozeMinutes: number;
    quietHoursStart: string;
    quietHoursEnd: string;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsState = {
    masterEnabled: true,
    taskReminders: true,
    taskDueToday: true,
    taskOverdue: true,
    taskCompleted: false,
    tipsAndSuggestions: false,
    promotions: false,
    defaultReminderMinutes: 15,
    snoozeMinutes: 10,
    quietHoursStart: '22:00:00',
    quietHoursEnd: '07:00:00',
};

interface AppContextType {
    colorScheme: 'light' | 'dark';
    theme: AppTheme;
    isAuthReady: boolean;
    toggleTheme: () => void;
    language: Language;
    setLanguage: (language: Language) => void;
    toggleLanguage: () => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<ActionResult>;
    register: (name: string, email: string, password: string, confirmPassword: string) => Promise<ActionResult>;
    resetPassword: (email: string) => Promise<ActionResult>;
    updateProfile: (profile: { name: string; email: string; about: string; password?: string; photoUri?: string }) => Promise<ActionResult>;
    logout: () => Promise<void>;
    tasks: Task[];
    projects: Project[];
    assignees: TaskAssignee[];
    addTask: (taskData: {
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
        priority: TaskPriority;
        project: string;
        tags: string[];
        timeSlot: string;
        assigneeIds: string[];
    }) => Promise<ActionResult>;
    updateTask: (taskId: string, taskData: {
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
        timeSlot: string;
    }) => Promise<ActionResult>;
    updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    stats: {
        total: number;
        completed: number;
        pending: number;
        percentage: number;
        focusHours: string;
        goalsAchieved: number;
    };
    notificationSettings: NotificationSettingsState;
    notificationSettingsReady: boolean;
    notificationBellCount: number;
    updateNotificationSettings: (patch: Partial<NotificationSettingsState>) => Promise<ActionResult>;
    refreshNotificationBellCount: (targetUserId?: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const mapDbStatusToTaskStatus = (status: TaskRow['status']): TaskStatus => (status === 'completed' ? 'Completed' : 'To Do');
const mapTaskStatusToDb = (status: TaskStatus): TaskRow['status'] => (status === 'Completed' ? 'completed' : 'pending');
const getDeviceTimeZone = () => {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
        return 'UTC';
    }
};

const formatJoinedAt = (value?: string) => {
    if (!value) return 'Today';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Today';
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

const createUserState = (authUser: AuthUser, profile: ProfileRow | null): User => ({
    id: authUser.id,
    name: profile?.full_name || String(authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User'),
    email: profile?.email || authUser.email || '',
    about: profile?.about || 'Building products that make life simple and productive.',
    photoUri: profile?.photo_url || undefined,
    joinedAt: formatJoinedAt(profile?.created_at),
});

const mapTaskRowToTask = (row: TaskRow): Task => {
    const displayTime = formatDbTimeToDisplay(row.due_time);
    return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        dueDate: formatDisplayDate(row.due_date),
        dueTime: displayTime,
        priority: 'Medium',
        project: 'General',
        tags: ['General'],
        status: mapDbStatusToTaskStatus(row.status),
        timeSlot: buildTimeSlot(displayTime),
        assignees: [mockAssignees[0]],
    };
};

const mapSettingsRowToState = (row?: NotificationSettingsRow | null): NotificationSettingsState => {
    if (!row) return DEFAULT_NOTIFICATION_SETTINGS;
    return {
        masterEnabled: row.master_enabled,
        taskReminders: row.task_reminders,
        taskDueToday: row.task_due_today,
        taskOverdue: row.task_overdue,
        taskCompleted: row.task_completed,
        tipsAndSuggestions: row.tips_and_suggestions,
        promotions: row.promotions,
        defaultReminderMinutes: row.default_reminder_minutes,
        snoozeMinutes: row.snooze_minutes,
        quietHoursStart: row.quiet_hours_start,
        quietHoursEnd: row.quiet_hours_end,
    };
};

const mapStateToSettingsUpsert = (userId: string, state: NotificationSettingsState) => ({
    user_id: userId,
    master_enabled: state.masterEnabled,
    task_reminders: state.taskReminders,
    task_due_today: state.taskDueToday,
    task_overdue: state.taskOverdue,
    task_completed: state.taskCompleted,
    tips_and_suggestions: state.tipsAndSuggestions,
    promotions: state.promotions,
    default_reminder_minutes: state.defaultReminderMinutes,
    snooze_minutes: state.snoozeMinutes,
    quiet_hours_start: state.quietHoursStart,
    quiet_hours_end: state.quietHoursEnd,
});

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(null);
    const [language, setLanguage] = useState<Language>('en');
    const colorScheme = themeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');
    const theme = colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
    const t = React.useCallback((key: string, params?: Record<string, string | number>) => translate(language, key, params), [language]);

    const [isAuthReady, setIsAuthReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettingsState>(DEFAULT_NOTIFICATION_SETTINGS);
    const [notificationSettingsReady, setNotificationSettingsReady] = useState(false);
    const [notificationBellCount, setNotificationBellCount] = useState(0);
    const [projects] = useState<Project[]>(mockProjects);
    const [assignees] = useState<TaskAssignee[]>(mockAssignees);

    const isAuthenticated = user !== null;

    const ensureProfile = async (authUser: AuthUser) => {
        const client = assertSupabaseConfigured();
        const { error } = await client.from('profiles').upsert(
            {
                id: authUser.id,
                full_name: String(authUser.user_metadata.full_name || authUser.email?.split('@')[0] || 'User'),
                email: authUser.email || '',
            },
            { onConflict: 'id' },
        );
        if (error) throw error;
    };

    const loadProfile = async (authUser: AuthUser) => {
        const client = assertSupabaseConfigured();
        await ensureProfile(authUser);
        const { data, error } = await client
            .from('profiles')
            .select('id, full_name, email, about, photo_url, created_at')
            .eq('id', authUser.id)
            .single();
        if (error) throw error;
        return data as ProfileRow;
    };

    const loadTasks = async (userId: string) => {
        const client = assertSupabaseConfigured();
        const { data, error } = await client
            .from('tasks')
            .select('id, user_id, title, description, due_date, due_time, time_zone, status')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .order('due_time', { ascending: true });
        if (error) throw error;
        setTasks(((data || []) as TaskRow[]).map(mapTaskRowToTask));
    };

    const syncPendingTasksTimeZone = async (userId: string) => {
        const client = assertSupabaseConfigured();
        const timeZone = getDeviceTimeZone();

        // Keep pending tasks aligned with current device time zone for reminder scheduling.
        await client
            .from('tasks')
            .update({ time_zone: timeZone })
            .eq('user_id', userId)
            .eq('status', 'pending')
            .is('time_zone', null);

        await client
            .from('tasks')
            .update({ time_zone: timeZone })
            .eq('user_id', userId)
            .eq('status', 'pending')
            .neq('time_zone', timeZone);
    };

    const loadNotificationSettings = async (userId: string) => {
        const client = assertSupabaseConfigured();
        const { data, error } = await client
            .from('user_notification_settings')
            .select('user_id, master_enabled, task_reminders, task_due_today, task_overdue, task_completed, tips_and_suggestions, promotions, default_reminder_minutes, snooze_minutes, quiet_hours_start, quiet_hours_end')
            .eq('user_id', userId)
            .maybeSingle();

        if (error) throw error;

        if (!data) {
            const seed = mapStateToSettingsUpsert(userId, DEFAULT_NOTIFICATION_SETTINGS);
            const { error: seedError } = await client
                .from('user_notification_settings')
                .upsert(seed, { onConflict: 'user_id' });
            if (seedError) throw seedError;
            setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
            return;
        }

        setNotificationSettings(mapSettingsRowToState(data as NotificationSettingsRow));
    };

    const refreshNotificationBellCount = async (targetUserId?: string) => {
        const resolvedUserId = targetUserId || user?.id;
        if (!resolvedUserId) {
            setNotificationBellCount(0);
            return;
        }

        try {
            const client = assertSupabaseConfigured();
            const now = new Date().toISOString();
            const { count, error } = await client
                .from('task_notifications')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', resolvedUserId)
                .eq('status', 'pending')
                .lte('scheduled_for', now);
            if (error) throw error;
            setNotificationBellCount(count || 0);
        } catch (error) {
            console.warn('Unable to refresh notification badge', error);
        }
    };

    const updateNotificationSettings = async (patch: Partial<NotificationSettingsState>): Promise<ActionResult> => {
        if (!user) return { success: false, error: t('genericError') };

        const nextState = {
            ...notificationSettings,
            ...patch,
        };

        try {
            const client = assertSupabaseConfigured();
            const payload = mapStateToSettingsUpsert(user.id, nextState);
            const { error } = await client
                .from('user_notification_settings')
                .upsert(payload, { onConflict: 'user_id' });
            if (error) return { success: false, error: error.message };
            setNotificationSettings(nextState);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('genericError') };
        }
    };

    const hydrateSession = async (session: Session | null) => {
        if (!session?.user) {
            setUser(null);
            setTasks([]);
            setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
            setNotificationSettingsReady(false);
            setNotificationBellCount(0);
            setIsAuthReady(true);
            return;
        }

        try {
            const profile = await loadProfile(session.user);
            setUser(createUserState(session.user, profile));
            await syncPendingTasksTimeZone(session.user.id);
            await loadTasks(session.user.id);
            await loadNotificationSettings(session.user.id);
            await refreshNotificationBellCount(session.user.id);
            await syncPushTokenToBackendAsync(session.user.id);
        } catch (error) {
            console.warn('Failed to hydrate session', error);
            setUser(createUserState(session.user, null));
        } finally {
            setNotificationSettingsReady(true);
            setIsAuthReady(true);
        }
    };

    useEffect(() => {
        if (!supabase) {
            setIsAuthReady(true);
            return;
        }

        let active = true;

        const bootstrap = async () => {
            try {
                const client = assertSupabaseConfigured();
                const { data, error } = await client.auth.getSession();
                if (error) throw error;
                if (active) await hydrateSession(data.session);
            } catch (error) {
                console.warn('Session bootstrap failed', error);
                if (active) setIsAuthReady(true);
            }
        };

        void bootstrap();

        const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!active) return;
            void hydrateSession(nextSession);
        });

        return () => {
            active = false;
            subscription.subscription.unsubscribe();
        };
    }, []);

    const login = async (email: string, password: string): Promise<ActionResult> => {
        if (!email.trim() || !password.trim()) return { success: false, error: t('fillAllFields') };
        if (!isValidEmail(email)) return { success: false, error: t('validEmail') };

        try {
            const client = assertSupabaseConfigured();
            const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
            if (error) return { success: false, error: t('invalidLogin') };
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('genericError') };
        }
    };

    const register = async (name: string, email: string, password: string, confirmPassword: string): Promise<ActionResult> => {
        if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) return { success: false, error: t('fillAllFields') };
        if (name.trim().length < 2) return { success: false, error: t('validFullName') };
        if (!isValidEmail(email)) return { success: false, error: t('validEmail') };
        if (password.length < 6) return { success: false, error: t('passwordMin') };
        if (password !== confirmPassword) return { success: false, error: t('passwordsMismatch') };

        try {
            const client = assertSupabaseConfigured();
            const { data, error } = await client.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { full_name: name.trim() } },
            });
            if (error) {
                const alreadyExists = error.message.toLowerCase().includes('already');
                return { success: false, error: alreadyExists ? t('accountExists') : error.message };
            }
            if (data.user) {
                try {
                    await ensureProfile(data.user);
                } catch (profileError) {
                    // Auth signup already succeeded. Profile trigger may still create row asynchronously.
                    console.warn('Profile sync after signup failed', profileError);
                }
            }
            return { success: true, requiresEmailConfirmation: !data.session };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('genericError') };
        }
    };

    const resetPassword = async (email: string): Promise<ActionResult> => {
        if (!email.trim()) return { success: false, error: t('emailRequired') };
        if (!isValidEmail(email)) return { success: false, error: t('validEmail') };

        try {
            const client = assertSupabaseConfigured();
            const { error } = await client.auth.resetPasswordForEmail(email.trim());
            if (error) return { success: false, error: error.message };
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('genericError') };
        }
    };

    const logout = async () => {
        if (supabase) await supabase.auth.signOut();
        setUser(null);
        setTasks([]);
        setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS);
        setNotificationSettingsReady(false);
        setNotificationBellCount(0);
    };

    const updateProfile = async (profile: { name: string; email: string; about: string; password?: string; photoUri?: string }): Promise<ActionResult> => {
        if (!profile.name.trim()) return { success: false, error: t('fullNameRequired') };
        if (!isValidEmail(profile.email.trim())) return { success: false, error: t('validEmail') };
        if (profile.password && profile.password.length < 6) return { success: false, error: t('passwordMin') };
        if (!user) return { success: false, error: t('genericError') };

        try {
            const client = assertSupabaseConfigured();
            const userUpdate: { email?: string; password?: string; data?: Record<string, string> } = {
                data: { full_name: profile.name.trim() },
            };

            if (profile.email.trim() !== user.email) userUpdate.email = profile.email.trim();
            if (profile.password?.trim()) userUpdate.password = profile.password.trim();

            const { error: authError } = await client.auth.updateUser(userUpdate);
            if (authError) return { success: false, error: authError.message };

            const { error: profileError } = await client
                .from('profiles')
                .update({
                    full_name: profile.name.trim(),
                    email: profile.email.trim(),
                    about: profile.about.trim() || null,
                    photo_url: profile.photoUri || null,
                })
                .eq('id', user.id);

            if (profileError) return { success: false, error: profileError.message };

            setUser(prev => prev ? { ...prev, name: profile.name.trim(), email: profile.email.trim(), about: profile.about.trim(), photoUri: profile.photoUri } : prev);
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('genericError') };
        }
    };

    const addTask = async (taskData: {
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
        priority: TaskPriority;
        project: string;
        tags: string[];
        timeSlot: string;
        assigneeIds: string[];
    }): Promise<ActionResult> => {
        if (!taskData.title.trim()) return { success: false, error: t('taskTitleRequired') };
        const dueDate = parseDisplayDateToIso(taskData.dueDate);
        const dueTime = normalizeTimeForDb(taskData.dueTime);
        if (!dueDate || !dueTime || !user) return { success: false, error: t('unableCreateTask') };

        try {
            const client = assertSupabaseConfigured();
            const { error } = await client.from('tasks').insert({
                user_id: user.id,
                title: taskData.title.trim(),
                description: taskData.description.trim() || null,
                due_date: dueDate,
                due_time: dueTime,
                time_zone: getDeviceTimeZone(),
                status: 'pending',
            });
            if (error) return { success: false, error: error.message };
            await loadTasks(user.id);
            await refreshNotificationBellCount();
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('unableCreateTask') };
        }
    };

    const updateTask = async (taskId: string, taskData: {
        title: string;
        description: string;
        dueDate: string;
        dueTime: string;
        timeSlot: string;
    }): Promise<ActionResult> => {
        if (!taskData.title.trim()) return { success: false, error: t('taskTitleRequired') };
        const dueDate = parseDisplayDateToIso(taskData.dueDate);
        const dueTime = normalizeTimeForDb(taskData.dueTime);
        if (!dueDate || !dueTime || !user) return { success: false, error: t('unableCreateTask') };

        try {
            const client = assertSupabaseConfigured();
            const { error } = await client
                .from('tasks')
                .update({
                    title: taskData.title.trim(),
                    description: taskData.description.trim() || null,
                    due_date: dueDate,
                    due_time: dueTime,
                    time_zone: getDeviceTimeZone(),
                })
                .eq('id', taskId)
                .eq('user_id', user.id);
            if (error) return { success: false, error: error.message };
            await loadTasks(user.id);
            await refreshNotificationBellCount();
            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : t('unableCreateTask') };
        }
    };

    const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
        if (!user) return;
        try {
            const client = assertSupabaseConfigured();
            await client.from('tasks').update({ status: mapTaskStatusToDb(status) }).eq('id', taskId).eq('user_id', user.id);
            await loadTasks(user.id);
            await refreshNotificationBellCount();
        } catch (error) {
            console.warn('Unable to update task status', error);
        }
    };

    const deleteTask = async (taskId: string) => {
        if (!user) return;
        try {
            const client = assertSupabaseConfigured();
            await client.from('tasks').delete().eq('id', taskId).eq('user_id', user.id);
            await loadTasks(user.id);
            await refreshNotificationBellCount();
        } catch (error) {
            console.warn('Unable to delete task', error);
        }
    };

    const toggleTheme = () => setThemeOverride(prev => {
        const current = prev ?? (systemScheme === 'dark' ? 'dark' : 'light');
        return current === 'dark' ? 'light' : 'dark';
    });

    const toggleLanguage = () => setLanguage(prev => (prev === 'en' ? 'te' : 'en'));

    const stats = useMemo(() => {
        const completed = tasks.filter(task => task.status === 'Completed').length;
        const pending = tasks.length - completed;
        const percentage = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        return {
            total: tasks.length,
            completed,
            pending,
            percentage,
            focusHours: `${tasks.length * 2}h`,
            goalsAchieved: completed,
        };
    }, [tasks]);

    return (
        <AppContext.Provider value={{
            colorScheme,
            theme,
            isAuthReady,
            toggleTheme,
            language,
            setLanguage,
            toggleLanguage,
            t,
            user,
            isAuthenticated,
            login,
            register,
            resetPassword,
            updateProfile,
            logout,
            tasks,
            projects,
            assignees,
            addTask,
            updateTask,
            updateTaskStatus,
            deleteTask,
            stats,
            notificationSettings,
            notificationSettingsReady,
            notificationBellCount,
            updateNotificationSettings,
            refreshNotificationBellCount,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useApp must be used within an AppProvider');
    return context;
};
