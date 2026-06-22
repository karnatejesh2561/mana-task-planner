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
import { ReminderInbox } from './src/screens/ReminderInbox';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Task } from './src/types';
import { configureNotificationsAsync } from './src/notifications';
import { glassButton, glassPanel } from './src/theme/glass';

type AuthScreen = 'Login' | 'Register' | 'ForgotPassword';
type AppTab = 'Home' | 'Calendar' | 'Settings' | 'Notifications';
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
                        onBellPress={() => isShowcase ? null : setActiveTab('Notifications')}
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
            case 'Notifications':
                return <ReminderInbox onBack={() => setActiveTab('Home')} />;
            default:
                return (
                    <HomeDashboard
                        onNavigate={navigateToTab}
                        onAddTaskPress={openCreateTask}
                        onTaskPress={openEditTask}
                        onBellPress={() => setActiveTab('Notifications')}
                    />
                );
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
                                <Ionicons name="list-outline" size={25} color={activeTab === 'Home' ? theme.electricBlue : theme.tabInactive} />
                                <Text style={[styles.tabLabel, activeTab === 'Home' && styles.activeTabLabel]}>{t('tasks')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Calendar')} activeOpacity={0.8}>
                            <View style={styles.inactiveTabContent}>
                                <Ionicons name="calendar-outline" size={25} color={activeTab === 'Calendar' ? theme.electricBlue : theme.tabInactive} />
                                <Text style={[styles.tabLabel, activeTab === 'Calendar' && styles.activeTabLabel]}>{t('calendar')}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab('Settings')} activeOpacity={0.8}>
                            <View style={styles.inactiveTabContent}>
                                <Ionicons name="settings-outline" size={25} color={activeTab === 'Settings' ? theme.electricBlue : theme.tabInactive} />
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
    desktopContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
    desktopHeader: { alignItems: 'center', marginBottom: 40, padding: 20, ...glassPanel(theme) },
    desktopLogo: { width: 200, height: 70 },
    showcaseTagline: { fontSize: 12, color: theme.textPrimary, letterSpacing: 2, opacity: 0.7 },
    showcaseTipRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, padding: 10, ...glassButton(theme) },
    showcaseTip: { fontSize: 12, color: theme.textPrimary, marginLeft: 8 },
    showcaseScrollContent: { padding: 20 },
    desktopFooter: { marginTop: 30 },
    footerText: { color: theme.textMuted },
    mobileContainer: { flex: 1 },
    mobileSafeArea: { flex: 1 },
    loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    loadingLogo: { width: 150, height: 150 },
    loadingText: { color: theme.textPrimary, fontSize: 18, fontWeight: 'bold' },
    screenContainer: { flex: 1 },
    mobileModalContainer: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: theme.glassOverlay,
        zIndex: 999,
    },
    tabBarWrapper: {
        paddingHorizontal: 16,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabBar: {
        flexDirection: 'row',
        height: 64,
        backgroundColor: theme.tabBarGlass,
        borderRadius: 32,
        borderWidth: 1,
        borderColor: theme.glassBorderStrong,
        paddingHorizontal: 8,
        alignItems: 'center',
        justifyContent: 'space-around',
        shadowColor: theme.glassShadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: theme.scheme === 'dark' ? 0.28 : 0.16,
        shadowRadius: 32,
        elevation: theme.glassElevation,
    },
    tabButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactiveTabContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: theme.tabInactive,
        marginTop: 4,
    },
    activeTabLabel: {
        color: theme.electricBlue,
        fontWeight: '700',
    },
    floatingAddWrapper: {
        width: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -28,
    },
    floatingAdd: {
        width: 58,
        height: 58,
        borderRadius: 29,
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

