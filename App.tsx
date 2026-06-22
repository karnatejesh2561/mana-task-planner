import React, { useState } from 'react';
import {
    Alert,
    StyleSheet, View, Text, useWindowDimensions,
    ScrollView, TouchableOpacity,
    StatusBar, Platform, Image,
} from 'react-native';
import { AppProvider, useApp, AppTheme } from './src/AppContext';
import { IPhone16Frame } from './src/components/iPhone16Frame';
import { HomeDashboard } from './src/screens/HomeDashboard';
import { CalendarSchedule } from './src/screens/CalendarSchedule';
import { AddTask } from './src/screens/AddTask';
import { ProfileSettings } from './src/screens/ProfileSettings';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Task } from './src/types';
import { configureNotificationsAsync } from './src/notifications';

type AuthScreen = 'Login' | 'Register' | 'ForgotPassword';
type AppTab = 'Home' | 'Calendar' | 'Settings';
type TaskDraft = { dueDate?: string; dueTime?: string };

const AppContent: React.FC = () => {
    const { width: windowWidth } = useWindowDimensions();
    const { isAuthenticated, isAuthReady, logout, theme, colorScheme, t } = useApp();
    const styles = React.useMemo(() => createStyles(theme), [theme]);
    const isDesktop = windowWidth >= 1024;

    React.useEffect(() => {
        configureNotificationsAsync().catch(() => undefined);
    }, []);

    // ─── Auth Navigation ────────────────────────────────────────────────────────
    const [authScreen, setAuthScreen] = useState<AuthScreen>('Login');

    // ─── Main App Navigation ────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<AppTab>('Home');
    const [showAddTaskMobile, setShowAddTaskMobile] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [taskDraft, setTaskDraft] = useState<TaskDraft | null>(null);

    const navigateToTab = (tab: any) => {
        if (tab === 'AddTask') {
            setEditingTask(null);
            setTaskDraft(null);
            setShowAddTaskMobile(true);
        }
        else setActiveTab(tab as AppTab);
    };

    const openCreateTask = (draft?: TaskDraft) => {
        setEditingTask(null);
        setTaskDraft(draft || null);
        setShowAddTaskMobile(true);
    };

    const openEditTask = (task: Task) => {
        setEditingTask(task);
        setTaskDraft(null);
        setShowAddTaskMobile(true);
    };

    const closeTaskSheet = () => {
        setShowAddTaskMobile(false);
        setEditingTask(null);
        setTaskDraft(null);
    };

    const handleLogout = () => {
        void logout();
        setActiveTab('Home');
        setAuthScreen('Login');
        setShowAddTaskMobile(false);
        setEditingTask(null);
        setTaskDraft(null);
    };

    if (!isAuthReady) {
        return (
            <LinearGradient
                colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
                style={styles.mobileContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
                <View style={styles.loadingContainer}>
                    <Image
                        source={require('./assets/logo.png')}
                        style={styles.loadingLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.loadingText}>{t('loading')}</Text>
                </View>
            </LinearGradient>
        );
    }

    // ─── Render a screen by key ──────────────────────────────────────────────────
    const renderScreen = (key: string, isShowcase: boolean) => {
        switch (key) {
            case 'Home':
                return (
                    <HomeDashboard
                        onNavigate={navigateToTab}
                        onAddTaskPress={() => isShowcase ? null : openCreateTask()}
                        onTaskPress={(task) => isShowcase ? null : openEditTask(task)}
                    />
                );
            case 'Calendar':
                return (
                    <CalendarSchedule
                        onBack={() => isShowcase ? null : setActiveTab('Home')}
                        onAddTaskPress={(draft) => isShowcase ? null : openCreateTask(draft)}
                    />
                );
            case 'AddTask':
                return (
                    <AddTask
                        task={isShowcase ? null : editingTask}
                        initialValues={isShowcase ? null : taskDraft}
                        onClose={() => isShowcase ? null : closeTaskSheet()}
                        onSuccess={() => {
                            if (isShowcase) {
                                Alert.alert('Task created', 'Watch the Home and Calendar screens update live.');
                            } else {
                                closeTaskSheet();
                                setActiveTab('Home');
                            }
                        }}
                    />
                );
            case 'Settings':
                return <ProfileSettings onNavigate={navigateToTab} onLogout={handleLogout} />;
            default:
                return <HomeDashboard onNavigate={navigateToTab} onAddTaskPress={openCreateTask} onTaskPress={openEditTask} />;
        }
    };

    // ─── AUTH FLOW (not authenticated) ──────────────────────────────────────────
    if (!isAuthenticated) {
        if (authScreen === 'Register') {
            return <RegisterScreen onNavigateToLogin={() => setAuthScreen('Login')} />;
        }
        if (authScreen === 'ForgotPassword') {
            return <ForgotPasswordScreen onNavigateToLogin={() => setAuthScreen('Login')} />;
        }
        // Default: Login
        return (
            <LoginScreen
                onNavigateToRegister={() => setAuthScreen('Register')}
                onNavigateToForgot={() => setAuthScreen('ForgotPassword')}
            />
        );
    }

    // ─── DESKTOP WEB SHOWCASE (authenticated, wide screen) ──────────────────────
    if (isDesktop) {
        return (
            <LinearGradient
                colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
                style={styles.desktopContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

                {/* Showcase Header */}
                <View style={styles.desktopHeader}>
                    <Image
                        source={require('./assets/logo.png')}
                        style={styles.desktopLogo}
                        resizeMode="contain"
                    />
                    <Text style={styles.showcaseTagline}>{t('planPrioritizeAchieve')}</Text>
                    <View style={styles.showcaseTipRow}>
                        <Ionicons name="flash" size={14} color={theme.electricBlue} />
                        <Text style={styles.showcaseTip}>
                            {t('showcaseTip')}
                        </Text>
                    </View>
                </View>

                {/* Five iPhone 16 Pro Frames */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator
                    contentContainerStyle={styles.showcaseScrollContent}
                >
                    <IPhone16Frame title="1. Home">{renderScreen('Home', true)}</IPhone16Frame>
                    <IPhone16Frame title="2. Calendar">{renderScreen('Calendar', true)}</IPhone16Frame>
                    <IPhone16Frame title="3. Settings">{renderScreen('Settings', true)}</IPhone16Frame>
                </ScrollView>

                <View style={styles.desktopFooter}>
                    <Text style={styles.footerText}>
                        {t('showcaseFooter')}
                    </Text>
                </View>
            </LinearGradient>
        );
    }

    // ─── MOBILE LAYOUT (authenticated, narrow screen) ───────────────────────────
    return (
        <LinearGradient
            colors={[theme.bgTop, theme.bgMid, theme.bgBottom]}
            style={styles.mobileContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={styles.mobileSafeArea}>

                {/* Active Screen */}
                <View style={styles.screenContainer}>
                    {renderScreen(activeTab, false)}
                </View>

                {/* Add Task Full-Screen Sheet */}
                {showAddTaskMobile && (
                    <View style={styles.mobileModalContainer}>
                        {renderScreen('AddTask', false)}
                    </View>
                )}

                {/* Bottom Tab Bar */}
                <View style={styles.tabBarWrapper}>
                    <View style={styles.tabBar}>

                        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Home')} activeOpacity={0.8}>
                            <View style={styles.inactiveTabContent}>
                                <Ionicons name="list-outline" size={25} color={activeTab === 'Home' ? theme.purpleAccent : theme.tabInactive} />
                                <Text style={[styles.tabLabel, activeTab === 'Home' && styles.activeTabLabel]}>{t('tasks')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Calendar')} activeOpacity={0.8}>
                            <View style={styles.inactiveTabContent}>
                                <Ionicons name="calendar-outline" size={25} color={activeTab === 'Calendar' ? theme.purpleAccent : theme.tabInactive} />
                                <Text style={[styles.tabLabel, activeTab === 'Calendar' && styles.activeTabLabel]}>{t('calendar')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Settings')} activeOpacity={0.8}>
                            <View style={styles.inactiveTabContent}>
                                <Ionicons name="settings-outline" size={25} color={activeTab === 'Settings' ? theme.purpleAccent : theme.tabInactive} />
                                <Text style={[styles.tabLabel, activeTab === 'Settings' && styles.activeTabLabel]}>{t('settings')}</Text>
                            </View>
                        </TouchableOpacity>

                    </View>
                </View>
            </View>
        </LinearGradient>
    );
};

export default function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

const createStyles = (theme: AppTheme) => StyleSheet.create({
    // ── Desktop ─────────────────────────────────────────────────────────────────
    desktopContainer: {
        flex: 1,
        minHeight: '100%',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 30,
    },
    desktopHeader: {
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 48,
        marginBottom: 8,
    },
    desktopLogo: {
        width: 280,
        height: 96,
        marginBottom: 6,
    },
    showcaseTagline: {
        fontSize: 11,
        fontWeight: '800',
        color: theme.textPrimary,
        letterSpacing: 3,
        opacity: 0.55,
        marginBottom: 10,
    },
    showcaseTipRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 132, 255, 0.06)',
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(10, 132, 255, 0.14)',
    },
    showcaseTip: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '600',
        marginLeft: 6,
    },
    showcaseScrollContent: {
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 10,
    },
    desktopFooter: { width: '100%', alignItems: 'center', paddingHorizontal: 48, marginTop: 16 },
    footerText: { fontSize: 13, color: theme.textMuted, fontWeight: '600' },

    // ── Mobile ───────────────────────────────────────────────────────────────────
    mobileContainer: { flex: 1 },
    mobileSafeArea: { flex: 1 },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    loadingLogo: {
        width: 220,
        height: 84,
        marginBottom: 16,
    },
    loadingText: {
        color: theme.textPrimary,
        fontSize: 16,
        fontWeight: '700',
    },
    screenContainer: { flex: 1 },
    mobileModalContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.background,
        zIndex: 999,
    },

    // ── Tab Bar ─────────────────────────────────────────────────────────────────
    tabBarWrapper: {
        paddingHorizontal: 0,
        paddingBottom: 0,
        paddingTop: 0,
        backgroundColor: 'transparent',
    },
    tabBar: {
        height: 96,
        backgroundColor: theme.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 18,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.04)',
    },
    tabButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabPill: {
        width: 44,
        height: 44,
        borderRadius: 22, // Full radius circle
        backgroundColor: theme.electricBlue,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: theme.electricBlue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
    },
    activeTabLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.purpleAccent,
    },
    inactiveTabContent: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
    },
    tabLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: theme.tabInactive,
        marginTop: 5,
    },

    // ── Floating Add ────────────────────────────────────────────────────────────
    floatingAddWrapper: {
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',
        // Lifts the button above the bar
        marginTop: -28,
    },
    floatingAdd: {
        width: 58,
        height: 58,
        borderRadius: 29,
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 10,
        // White ring around button
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    floatingAddGrad: {
        flex: 1,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

