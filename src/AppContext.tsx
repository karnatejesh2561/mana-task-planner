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
    electricBlue: '#008DFF',
    blue: '#008DFF',
    brightBlue: '#1E6FFF',
    blueDeep: '#1565C0',
    deepNavy: '#082B73',
    navy: '#0B1F4D',
    purpleAccent: '#6D4AFF',
    pinkAccent: '#FF3D7F',
    orangeAccent: '#FF6B00',
    goldenOrange: '#FF9A00',
    coralRed: '#FF3D3D',
    gradientStart: '#00A8FF',
    gradientMid: '#FF2D7A',
    gradientEnd: '#FF9A00',
    bgTop: '#DCEEFF',
    bgMid: '#E7DFFF',
    bgBottom: '#FFE4D1',
    bgBlue: '#D4E8FF',
    bgPurple: '#E1D8FF',
    bgOrange: '#FFDCC4',
    bgBlack: '#000',
    textPrimary: '#082B73',
    textSecondary: '#475569',
    textLight: '#94A3B8',
    cardWhite: '#FFFFFF',
    cardDark1: '#0F172A',
    cardDark2: '#1E293B',
    borderLight: '#D6E4FF',
    borderMedium: '#B8CCFF',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
};

export const LIGHT_THEME = {
    ...COLORS,
    scheme: 'light' as const,
    background: '#FAFAFF',
    backgroundAlt: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceAlt: '#F6F6FB',
    surfaceMuted: '#F8F8FB',
    text: '#090910',
    textPrimary: '#082B73',
    textSecondary: '#475569',
    textMuted: '#777783',
    textInverted: '#FFFFFF',
    icon: '#111111',
    border: '#E6E6EB',
    divider: '#ECECF1',
    overlay: 'rgba(0,0,0,0.32)',
    shadow: '#111111',
    tabInactive: '#1D1D21',
    input: '#FFFFFF',
    inputMuted: '#F8F6FF',
    placeholder: '#81818A',
    dangerBg: '#FFECEC',
    errorBg: '#FFF0F0',
    errorBorder: '#FFD0D0',
    avatarBg: '#E4EDFF',
    avatarInner: '#CFE0FF',
    cardShadowOpacity: 0.08,
    inputBg: '#FFFFFF',
    inputBorder: '#E8EDF5',
    inputFocusBorder: '#008DFF',
    textDark: '#0B1F4D',
    textGray: '#6B7280',
};

export const DARK_THEME = {
    ...COLORS,
    scheme: 'dark' as const,
    background: '#070A12',
    backgroundAlt: '#0B1020',
    surface: '#111827',
    surfaceAlt: '#182235',
    surfaceMuted: '#151D2E',
    text: '#F8FAFC',
    textPrimary: '#EAF3FF',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textInverted: '#FFFFFF',
    icon: '#F8FAFC',
    border: '#2A3650',
    divider: '#263247',
    overlay: 'rgba(0,0,0,0.62)',
    shadow: '#000000',
    tabInactive: '#CBD5E1',
    bgTop: '#061525',
    bgMid: '#111633',
    bgBottom: '#241420',
    input: '#101827',
    inputMuted: '#151D2E',
    placeholder: '#8FA0B8',
    dangerBg: 'rgba(239,68,68,0.14)',
    errorBg: 'rgba(239,68,68,0.12)',
    errorBorder: 'rgba(239,68,68,0.35)',
    avatarBg: '#1E2B44',
    avatarInner: '#263A5D',
    cardShadowOpacity: 0.22,
    inputBg: '#101827',
    inputBorder: '#2A3650',
    inputFocusBorder: '#008DFF',
    textDark: '#EAF3FF',
    textGray: '#B6C2D2',
    blue: '#3AA3FF',
    blueDeep: '#1E6FFF',
    navy: '#EAF3FF',
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
    status: 'pending' | 'completed';
}

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const mapDbStatusToTaskStatus = (status: TaskRow['status']): TaskStatus => (status === 'completed' ? 'Completed' : 'To Do');
const mapTaskStatusToDb = (status: TaskStatus): TaskRow['status'] => (status === 'Completed' ? 'completed' : 'pending');

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
            .select('id, user_id, title, description, due_date, due_time, status')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .order('due_time', { ascending: true });
        if (error) throw error;
        setTasks(((data || []) as TaskRow[]).map(mapTaskRowToTask));
    };

    const hydrateSession = async (session: Session | null) => {
        if (!session?.user) {
            setUser(null);
            setTasks([]);
            setIsAuthReady(true);
            return;
        }

        try {
            const profile = await loadProfile(session.user);
            setUser(createUserState(session.user, profile));
            await loadTasks(session.user.id);
            await syncPushTokenToBackendAsync(session.user.id);
        } catch (error) {
            console.warn('Failed to hydrate session', error);
            setUser(createUserState(session.user, null));
        } finally {
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
                status: 'pending',
            });
            if (error) return { success: false, error: error.message };
            await loadTasks(user.id);
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
                })
                .eq('id', taskId)
                .eq('user_id', user.id);
            if (error) return { success: false, error: error.message };
            await loadTasks(user.id);
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
