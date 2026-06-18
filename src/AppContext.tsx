import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Task, Project, TaskAssignee, TaskStatus, TaskPriority } from './types';
import { defaultTasks, mockProjects, mockAssignees } from './mockData';
import { Language, translate } from './i18n';

// Brand colors from Mana Task Planner logo
export const COLORS = {
  // Brand Colors
  electricBlue: '#008DFF',
  blue: '#008DFF',
  brightBlue: '#1E6FFF',
  blueDeep: '#1565C0',
  deepNavy: '#082B73',
  navy: '#0B1F4D',

  // Accent Colors
  purpleAccent: '#6D4AFF',
  pinkAccent: '#FF3D7F',
  orangeAccent: '#FF6B00',
  goldenOrange: '#FF9A00',
  coralRed: '#FF3D3D',

  // Logo Gradient
  gradientStart: '#00A8FF',
  gradientMid: '#FF2D7A',
  gradientEnd: '#FF9A00',

  // Rich Backgrounds
  bgTop: '#DCEEFF',
  bgMid: '#E7DFFF',
  bgBottom: '#FFE4D1',

  // Alternative Darker Backgrounds
  bgBlue: '#D4E8FF',
  bgPurple: '#E1D8FF',
  bgOrange: '#FFDCC4',
  bgBlack: '#000',

  // Text
  textPrimary: '#082B73',
  textSecondary: '#475569',
  textLight: '#94A3B8',

  // Cards
  cardWhite: '#FFFFFF',
  cardDark1: '#0F172A',
  cardDark2: '#1E293B',

  // Borders
  borderLight: '#D6E4FF',
  borderMedium: '#B8CCFF',

  // Status
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
  bgTop: '#DCEEFF',
  bgMid: '#E7DFFF',
  bgBottom: '#FFE4D1',
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
  bgBlue: '#0A1D33',
  bgPurple: '#181633',
  bgOrange: '#2A190F',
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

interface User {
  name: string;
  email: string;
  photoUri?: string;
  about?: string;
  joinedAt: string;
  password: string;
}

interface AppContextType {
  colorScheme: 'light' | 'dark';
  theme: AppTheme;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string, confirmPassword: string) => { success: boolean; error?: string };
  resetPassword: (email: string) => { success: boolean; error?: string };
  updateProfile: (profile: {
    name: string;
    email: string;
    about: string;
    password: string;
    photoUri?: string;
  }) => { success: boolean; error?: string };
  logout: () => void;
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
  }) => { success: boolean; error?: string };
  updateTask: (taskId: string, taskData: {
    title: string;
    description: string;
    dueDate: string;
    dueTime: string;
    timeSlot: string;
  }) => { success: boolean; error?: string };
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
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

// Mock registered users (demo accounts)
const DEMO_USERS: Array<{ name: string; email: string; password: string }> = [
  { name: 'Olivia Reed', email: 'olivia.reed@gmail.com', password: 'password123' },
  { name: 'Demo User', email: 'demo@manatask.com', password: 'demo123' },
];

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  const colorScheme = themeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const theme = colorScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const t = React.useCallback(
    (key: string, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );
  const [user, setUser] = useState<User | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState(DEMO_USERS);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [projects] = useState<Project[]>(mockProjects);
  const [assignees] = useState<TaskAssignee[]>(mockAssignees);

  const isAuthenticated = user !== null;

  // --- Auth ---
  const login = (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      return { success: false, error: t('fillAllFields') };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: t('validEmail') };
    }
    const found = registeredUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      return { success: false, error: t('invalidLogin') };
    }
    setUser({
      name: found.name,
      email: found.email,
      password: found.password,
      about: 'Building products that make life simple and productive.',
      joinedAt: 'May 2024',
    });
    return { success: true };
  };

  const register = (name: string, email: string, password: string, confirmPassword: string) => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      return { success: false, error: t('fillAllFields') };
    }
    if (name.trim().length < 2) {
      return { success: false, error: t('validFullName') };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: t('validEmail') };
    }
    if (password.length < 6) {
      return { success: false, error: t('passwordMin') };
    }
    if (password !== confirmPassword) {
      return { success: false, error: t('passwordsMismatch') };
    }
    if (registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: t('accountExists') };
    }
    const newUser = { name: name.trim(), email: email.trim(), password };
    setRegisteredUsers(prev => [...prev, newUser]);
    setUser({
      name: newUser.name,
      email: newUser.email,
      password: newUser.password,
      about: 'Building products that make life simple and productive.',
      joinedAt: 'May 2024',
    });
    return { success: true };
  };

  const resetPassword = (email: string) => {
    if (!email.trim()) {
      return { success: false, error: t('emailRequired') };
    }
    if (!isValidEmail(email)) {
      return { success: false, error: t('validEmail') };
    }
    // In a real app this would call an API; here we simulate success
    return { success: true };
  };

  const logout = () => setUser(null);
  const updateProfile = (profile: {
    name: string;
    email: string;
    about: string;
    password: string;
    photoUri?: string;
  }) => {
    if (!profile.name.trim()) return { success: false, error: t('fullNameRequired') };
    if (!isValidEmail(profile.email.trim())) return { success: false, error: t('validEmail') };
    if (profile.password.length < 6) return { success: false, error: t('passwordMin') };

    setUser(prev => prev ? {
      ...prev,
      name: profile.name.trim(),
      email: profile.email.trim(),
      about: profile.about.trim(),
      password: profile.password,
      photoUri: profile.photoUri,
    } : prev);
    setRegisteredUsers(prev => prev.map(account => (
      account.email.toLowerCase() === user?.email.toLowerCase()
        ? { ...account, name: profile.name.trim(), email: profile.email.trim(), password: profile.password }
        : account
    )));
    return { success: true };
  };
  const toggleTheme = () => setThemeOverride(prev => {
    const current = prev ?? (systemScheme === 'dark' ? 'dark' : 'light');
    return current === 'dark' ? 'light' : 'dark';
  });
  const toggleLanguage = () => setLanguage(prev => (prev === 'en' ? 'te' : 'en'));

  // --- Task Stats ---
  const stats = React.useMemo(() => {
    const todayTasks = tasks.filter(t => !t.id.startsWith('c-'));
    const todayCompleted = todayTasks.filter(t => t.status === 'Completed').length;
    const completedTasksCount = 128 + todayCompleted;
    const pendingTasksCount = Math.max(0, 32 + (todayTasks.length - todayCompleted));
    const totalTasksCount = completedTasksCount + pendingTasksCount;
    const percentage = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 87;
    const focusHoursValue = 46 + todayCompleted * 2;
    const goalsAchieved = 18 + Math.floor(todayCompleted / 2);
    return { total: totalTasksCount, completed: completedTasksCount, pending: pendingTasksCount, percentage, focusHours: `${focusHoursValue}h`, goalsAchieved };
  }, [tasks]);

  // --- Task Actions ---
  const addTask = (taskData: {
    title: string; description: string; dueDate: string; dueTime: string;
    priority: TaskPriority; project: string; tags: string[]; timeSlot: string; assigneeIds: string[];
  }) => {
    if (!taskData.title.trim()) return { success: false, error: t('taskTitleRequired') };
    if (!taskData.description.trim()) return { success: false, error: t('descriptionRequired') };
    const newTaskAssignees = assignees.filter(a => taskData.assigneeIds.includes(a.id));
    if (newTaskAssignees.length === 0) newTaskAssignees.push(assignees[0]);
    const newTask: Task = {
      id: `t-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate || 'April 26, 2026',
      dueTime: taskData.dueTime || '12:00 PM',
      priority: taskData.priority,
      project: taskData.project || mockProjects[0].name,
      tags: taskData.tags.length > 0 ? taskData.tags : ['General'],
      status: 'To Do',
      timeSlot: taskData.timeSlot || `${taskData.dueTime} - 12:00 PM`,
      assignees: newTaskAssignees,
    };
    setTasks(prev => [newTask, ...prev]);
    return { success: true };
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) =>
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status } : t)));

  const updateTask = (taskId: string, taskData: {
    title: string; description: string; dueDate: string; dueTime: string; timeSlot: string;
  }) => {
    if (!taskData.title.trim()) return { success: false, error: t('taskTitleRequired') };
    if (!taskData.description.trim()) return { success: false, error: t('descriptionRequired') };
    setTasks(prev => prev.map(task => (
      task.id === taskId
        ? {
          ...task,
          title: taskData.title.trim(),
          description: taskData.description.trim(),
          dueDate: taskData.dueDate,
          dueTime: taskData.dueTime,
          timeSlot: taskData.timeSlot,
        }
        : task
    )));
    return { success: true };
  };

  const deleteTask = (taskId: string) =>
    setTasks(prev => prev.filter(t => t.id !== taskId));

  return (
    <AppContext.Provider value={{
      colorScheme, theme, toggleTheme, language, setLanguage, toggleLanguage, t,
      user, isAuthenticated, login, register, resetPassword, updateProfile, logout,
      tasks, projects, assignees, addTask, updateTask, updateTaskStatus, deleteTask, stats,
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
