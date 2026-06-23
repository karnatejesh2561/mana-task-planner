import React from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useApp } from '../AppContext';
import { Task } from '../types';

const { width } = Dimensions.get('window');

interface HomeDashboardProps {
    onNavigate: (screen: string) => void;
    onAddTaskPress: () => void;
    onTaskPress?: (task: Task) => void;
    onBellPress?: () => void;
    onMenuPress?: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
    onAddTaskPress,
    onTaskPress,
    onBellPress,
    onMenuPress,
}) => {
    const { tasks, user, deleteTask, theme, colorScheme, t, notificationBellCount, refreshNotificationBellCount } = useApp();

    // Dropdown state
    const [menuTask, setMenuTask] = React.useState<Task | null>(null);
    const [menuVisible, setMenuVisible] = React.useState(false);
    const [dropdownPos, setDropdownPos] = React.useState({ x: 0, y: 0 });
    const moreMenuRefs = React.useRef<Record<string, any>>({});

    const isDark = colorScheme === 'dark';

    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const pendingCount = tasks.filter(t => t.status !== 'Completed').length;
    const totalCount = tasks.length;
    const listTasks = tasks.filter(t => !t.id.startsWith('c-')).slice(0, 5);
    const firstName = user?.name?.split(' ')[0] || 'User';
    const hour = new Date().getHours();

    const cardBg = isDark ? 'rgba(25,34,49,0.55)' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    React.useEffect(() => { void refreshNotificationBellCount(); }, [tasks.length]);
    React.useEffect(() => {
        const timer = setInterval(() => void refreshNotificationBellCount(), 30000);
        return () => clearInterval(timer);
    }, []);

    const openDropdown = (task: Task, ref: any) => {
        if (!ref) return;
        ref.measure((fx: number, fy: number, w: number, h: number, px: number, py: number) => {
            setDropdownPos({ x: px - 140 + w, y: py + h + 4 });
            setMenuTask(task);
            setMenuVisible(true);
        });
    };

    const closeDropdown = () => { setMenuVisible(false); setMenuTask(null); };

    const handleDeleteTask = (task: Task) => {
        closeDropdown();
        Alert.alert(
            t('deleteTask'),
            t('deleteTaskMessage', { title: task.title }),
            [
                { text: t('cancel'), style: 'cancel' },
                { text: t('delete'), style: 'destructive', onPress: () => void deleteTask(task.id) },
            ],
        );
    };

    const handleEditTask = (task: Task) => {
        closeDropdown();
        onTaskPress?.(task);
    };

    const handleAcceptTask = (task: Task) => {
        closeDropdown();
        console.log('Accept task', task.id);
    };

    return (
        <View style={styles.container}>
            {/* BG */}
            <LinearGradient
                colors={isDark ? ['#081220', '#0D1825', '#132438'] : ['#F7FAFF', '#FFFFFF', '#F0F4FF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            {!isDark && (
                <Image
                    source={require('../../assets/background-image.png')}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                />
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* ── Header ── */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerTopRow}>
                        {/* Burger menu */}
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                                },
                            ]}
                            activeOpacity={0.75}
                            onPress={onMenuPress}
                        >
                            <Ionicons name="menu-outline" size={24} color={theme.text} />
                        </TouchableOpacity>

                        {/* Logo / Title */}
                        <Text style={[styles.appTitle, { color: theme.text }]}>
                            Mana <Text style={{ color: '#0A66FF' }}>Tasks</Text>
                        </Text>

                        {/* Bell */}
                        <TouchableOpacity
                            style={[
                                styles.iconButton,
                                {
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                                },
                            ]}
                            activeOpacity={0.75}
                            onPress={onBellPress}
                        >
                            <Ionicons name="notifications-outline" size={22} color={theme.text} />
                            {notificationBellCount > 0 && (
                                <View style={styles.bellBadge}>
                                    <Text style={styles.bellBadgeText}>
                                        {notificationBellCount > 9 ? '9+' : notificationBellCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Greeting */}
                    <View style={styles.greetingContainer}>
                        <Text style={[styles.greetingText, { color: theme.text }]}>
                            Good {hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'} {hour < 12 ? '👋' : hour < 18 ? '🌤️' : '🌙'}
                        </Text>
                        <Text style={[styles.greetingName, { color: '#0A66FF' }]}>{firstName}</Text>
                        <Text style={[styles.subtitleText, { color: theme.textSecondary }]}>
                            Let's make today productive
                        </Text>
                    </View>
                </View>

                {/* ── Stat Cards ── */}
                <View style={styles.statsGrid}>
                    {[
                        { icon: 'calendar-outline', color: '#0A66FF', label: 'Total', value: totalCount },
                        { icon: 'checkmark-circle-outline', color: '#22C55E', label: 'Done', value: completedCount },
                        { icon: 'time-outline', color: '#FF6B00', label: 'Pending', value: pendingCount },
                    ].map(card => (
                        <View
                            key={card.label}
                            style={[
                                styles.statCard,
                                {
                                    backgroundColor: cardBg,
                                    borderColor: cardBorder,
                                    shadowColor: isDark ? '#000' : card.color,
                                    shadowOpacity: isDark ? 0.15 : 0.08,
                                },
                            ]}
                        >
                            <View style={[styles.statIconBox, { backgroundColor: `${card.color}20` }]}>
                                <Ionicons name={card.icon as any} size={20} color={card.color} />
                            </View>
                            <Text style={[styles.statValue, { color: card.color }]}>{card.value}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{card.label}</Text>
                        </View>
                    ))}
                </View>

                {/* ── Today Section ── */}
                <View style={styles.todaySection}>
                    <View style={styles.todayHeader}>
                        <Text style={[styles.todayTitle, { color: theme.text }]}>Today's Tasks</Text>
                        <View style={styles.taskCountBadge}>
                            <Text style={styles.taskCountText}>{listTasks.length} Tasks</Text>
                        </View>
                    </View>

                    {listTasks.length > 0 ? (
                        <View style={styles.taskList}>
                            {listTasks.map((task, index) => {
                                const accentColor = index % 2 === 0 ? '#0A66FF' : '#FF6B00';
                                return (
                                    <TouchableOpacity
                                        key={task.id}
                                        style={[
                                            styles.taskCard,
                                            {
                                                backgroundColor: cardBg,
                                                borderColor: cardBorder,
                                                shadowColor: isDark ? '#000' : '#0A66FF',
                                                shadowOpacity: isDark ? 0.15 : 0.05,
                                            },
                                        ]}
                                        activeOpacity={0.85}
                                    >
                                        {/* Left accent */}
                                        <View style={[styles.taskAccentBar, { backgroundColor: accentColor }]} />

                                        {/* Checkbox */}
                                        <View style={[styles.taskCheckbox, { borderColor: accentColor }]}>
                                            {task.status === 'Completed' && (
                                                <Ionicons name="checkmark" size={14} color={accentColor} />
                                            )}
                                        </View>

                                        {/* Content */}
                                        <View style={styles.taskContent}>
                                            <Text
                                                style={[
                                                    styles.taskTitle,
                                                    { color: theme.text },
                                                    task.status === 'Completed' && styles.taskTitleDone,
                                                ]}
                                                numberOfLines={1}
                                            >
                                                {task.title}
                                            </Text>
                                            <Text style={[styles.taskTime, { color: '#0A66FF' }]} numberOfLines={1}>
                                                {task.dueTime || 'No time set'}
                                            </Text>
                                        </View>

                                        {/* Right actions */}
                                        <View style={styles.rightActions}>
                                            <Ionicons name="calendar-outline" size={16} color={isDark ? 'rgba(255,255,255,0.30)' : '#9CA3AF'} style={{ marginRight: 10 }} />
                                            <TouchableOpacity
                                                ref={ref => { moreMenuRefs.current[task.id] = ref; }}
                                                style={[
                                                    styles.moreBtn,
                                                    {
                                                        backgroundColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)',
                                                        borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                                                    },
                                                ]}
                                                onPress={() => openDropdown(task, moreMenuRefs.current[task.id])}
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons name="ellipsis-vertical" size={16} color={isDark ? 'rgba(255,255,255,0.55)' : '#6B7280'} />
                                            </TouchableOpacity>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIconBox, {
                                backgroundColor: isDark ? 'rgba(10,102,255,0.12)' : 'rgba(10,102,255,0.08)',
                            }]}>
                                <Ionicons name="checkmark-done-circle-outline" size={32} color="#0A66FF" />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.text }]}>All clear!</Text>
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                                No tasks for today.{'\n'}Tap + to add one.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* ── FAB ── */}
            <TouchableOpacity
                style={styles.fab}
                onPress={onAddTaskPress}
                activeOpacity={0.85}
            >
                <LinearGradient
                    colors={['#0A66FF', '#FF6B00']}
                    style={styles.fabGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Ionicons name="add" size={28} color="#FFFFFF" />
                </LinearGradient>
            </TouchableOpacity>

            {/* ── Dropdown Modal (fixes z-index) ── */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={closeDropdown}
            >
                <TouchableWithoutFeedback onPress={closeDropdown}>
                    <View style={styles.dropdownOverlay}>
                        {menuTask && (
                            <TouchableWithoutFeedback>
                                <View
                                    style={[
                                        styles.dropdownCard,
                                        {
                                            top: dropdownPos.y,
                                            left: Math.min(dropdownPos.x, width - 180),
                                            backgroundColor: isDark ? '#0F1D2E' : '#FFFFFF',
                                            borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                                        },
                                    ]}
                                >
                                    {/* Edit */}
                                    <TouchableOpacity
                                        style={[styles.dropdownItem, {
                                            borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                                        }]}
                                        onPress={() => handleEditTask(menuTask)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.dropdownIconBox, { backgroundColor: 'rgba(10,102,255,0.12)' }]}>
                                            <Ionicons name="pencil-outline" size={13} color="#0A66FF" />
                                        </View>
                                        <Text style={[styles.dropdownText, { color: isDark ? '#F8FAFC' : '#1F2937' }]}>Edit</Text>
                                    </TouchableOpacity>

                                    {/* Accept */}
                                    <TouchableOpacity
                                        style={[styles.dropdownItem, {
                                            borderBottomColor: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
                                        }]}
                                        onPress={() => handleAcceptTask(menuTask)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.dropdownIconBox, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
                                            <Ionicons name="checkmark-outline" size={13} color="#22C55E" />
                                        </View>
                                        <Text style={[styles.dropdownText, { color: isDark ? '#F8FAFC' : '#1F2937' }]}>Accept</Text>
                                    </TouchableOpacity>

                                    {/* Delete */}
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => handleDeleteTask(menuTask)}
                                        activeOpacity={0.8}
                                    >
                                        <View style={[styles.dropdownIconBox, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
                                            <Ionicons name="trash-outline" size={13} color="#EF4444" />
                                        </View>
                                        <Text style={[styles.dropdownText, { color: '#EF4444' }]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundImage: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100%', height: '100%',
        opacity: 0.35,
    },
    scrollContent: {
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingBottom: 120,
    },

    // Header
    headerContainer: {
        paddingHorizontal: 18,
        marginBottom: 24,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
    },
    appTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.3,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bellBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#FF6B00',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    bellBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    greetingContainer: { paddingLeft: 2 },
    greetingText: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 2,
    },
    greetingName: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    subtitleText: {
        fontSize: 13,
        fontWeight: '400',
    },

    // Stats
    statsGrid: {
        flexDirection: 'row',
        paddingHorizontal: 18,
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        padding: 14,
        alignItems: 'flex-start',
        minHeight: 120,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 3,
    },
    statIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 26,
        fontWeight: '800',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
    },

    // Today section
    todaySection: { paddingHorizontal: 18 },
    todayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        gap: 10,
    },
    todayTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
    taskCountBadge: {
        backgroundColor: 'rgba(10,102,255,0.12)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    taskCountText: { fontSize: 12, fontWeight: '700', color: '#0A66FF' },

    // Task List
    taskList: { gap: 10 },
    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 3,
    },
    taskAccentBar: {
        width: 4,
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
    },
    taskCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 12,
        marginRight: 12,
    },
    taskContent: { flex: 1 },
    taskTitle: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 3,
    },
    taskTitleDone: {
        textDecorationLine: 'line-through',
        opacity: 0.55,
    },
    taskTime: {
        fontSize: 12,
        fontWeight: '600',
    },
    rightActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    moreBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Empty state
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIconBox: {
        width: 70,
        height: 70,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    emptyTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
    emptyText: { fontSize: 13, textAlign: 'center', lineHeight: 20 },

    // FAB
    fab: {
        position: 'absolute',
        right: 22,
        bottom: 100,
        width: 56,
        height: 56,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#0A66FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.40,
        shadowRadius: 12,
        elevation: 8,
    },
    fabGrad: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Dropdown (via Modal)
    dropdownOverlay: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    dropdownCard: {
        position: 'absolute',
        width: 160,
        borderRadius: 12,
        borderWidth: 1,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 16,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 6,
    },
    dropdownIconBox: {
        width: 25,
        height: 25,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropdownText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
