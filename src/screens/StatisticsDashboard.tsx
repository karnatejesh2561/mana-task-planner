import React from 'react';
import {
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useApp, COLORS } from '../AppContext';
import { CustomLineChart } from '../components/CustomLineChart';
import { CustomBarChart } from '../components/CustomBarChart';
import { CustomDonutChart } from '../components/CustomDonutChart';

interface StatisticsDashboardProps {
    onNavigate: (screen: string) => void;
}

const STAT_CARDS = [
    { icon: 'checkmark-circle-outline', label: 'done', key: 'completed', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', bgDark: 'rgba(34,197,94,0.18)' },
    { icon: 'hourglass-outline', label: 'pendingLabel', key: 'pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', bgDark: 'rgba(245,158,11,0.18)' },
    { icon: 'flash-outline', label: 'focusHours', key: 'focusHours', color: '#0A66FF', bg: 'rgba(10,102,255,0.12)', bgDark: 'rgba(10,102,255,0.18)' },
    { icon: 'trophy-outline', label: 'goals', key: 'goals', color: '#EC4899', bg: 'rgba(236,72,153,0.12)', bgDark: 'rgba(236,72,153,0.18)' },
] as const;

const DONUT_DATA = [
    { name: 'Work', percentage: 45, color: '#0A66FF' },
    { name: 'Personal', percentage: 25, color: '#8B5CF6' },
    { name: 'Study', percentage: 20, color: '#FF6B00' },
    { name: 'Health', percentage: 10, color: '#22C55E' },
];

const DONUT_LEGEND = [
    { label: 'Work', color: '#0A66FF' },
    { label: 'Personal', color: '#8B5CF6' },
    { label: 'Study', color: '#FF6B00' },
    { label: 'Health', color: '#22C55E' },
];

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ onNavigate }) => {
    const { stats, theme, colorScheme } = useApp();
    const isDark = colorScheme === 'dark';

    const screenBg = isDark ? '#081220' : '#F0F4FF';
    const cardBg = isDark ? '#0F1D2E' : '#FFFFFF';
    const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

    const statValues: Record<string, string> = {
        completed: String(stats.completed),
        pending: String(stats.pending),
        focusHours: String(stats.focusHours),
        goals: String(stats.goalsAchieved),
    };

    const chartData = [60, 68, 62, 75, Math.max(0, stats.percentage - 5), stats.percentage, Math.min(100, stats.percentage + 3)];

    return (
        <View style={{ flex: 1, backgroundColor: screenBg }}>
            {/* BG gradient */}
            <LinearGradient
                colors={isDark ? ['#081220', '#0D1825', '#132438'] : ['#F7FAFF', '#FFFFFF', '#F0F4FF']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
            {!isDark && (
                <Image
                    source={require('../../assets/background-image.png')}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.30 }}
                    resizeMode="cover"
                />
            )}

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.scroll, { paddingTop: Platform.OS === 'ios' ? 56 : 40 }]}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerGreeting, { color: theme.textSecondary }]}>Your Overview</Text>
                        <Text style={[styles.headerTitle, { color: theme.text }]}>
                            Productivity{'\n'}
                            <Text style={{ color: '#0A66FF' }}>Statistics</Text>
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => onNavigate('Profile')}
                        style={[styles.avatarBtn, {
                            borderColor: '#0A66FF',
                            backgroundColor: isDark ? 'rgba(10,102,255,0.16)' : 'rgba(10,102,255,0.10)',
                        }]}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="person-outline" size={20} color="#0A66FF" />
                    </TouchableOpacity>
                </View>

                {/* ── Hero Productivity Card ── */}
                <View style={styles.heroCardWrap}>
                    <LinearGradient
                        colors={['#0A2E6E', '#0A66FF', '#3B82F6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        {/* Decorative circle */}
                        <View style={styles.heroOrb} />

                        <View style={styles.heroTop}>
                            <View>
                                <Text style={styles.heroLabel}>Weekly Productivity</Text>
                                <Text style={styles.heroPercent}>{stats.percentage}%</Text>
                                <Text style={styles.heroSub}>Tasks completed this week</Text>
                            </View>
                            <View style={styles.heroBadge}>
                                <Ionicons name="trending-up" size={14} color="#22C55E" style={{ marginRight: 4 }} />
                                <Text style={styles.heroBadgeText}>+12%</Text>
                            </View>
                        </View>

                        <CustomLineChart data={chartData} />
                    </LinearGradient>
                </View>

                {/* ── Stat Cards Grid ── */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('analytics')}</Text>
                <View style={styles.grid}>
                    {STAT_CARDS.map(card => (
                        <View
                            key={card.key}
                            style={[
                                styles.statCard,
                                {
                                    backgroundColor: cardBg,
                                    borderColor: cardBorder,
                                    shadowColor: isDark ? '#000' : card.color,
                                    shadowOpacity: isDark ? 0.18 : 0.08,
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={isDark
                                    ? [card.bgDark, 'transparent']
                                    : [card.bg, 'transparent']}
                                style={StyleSheet.absoluteFill}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            />
                            <View style={[styles.statIconBox, { backgroundColor: isDark ? card.bgDark : card.bg }]}>
                                <Ionicons name={card.icon as any} size={20} color={card.color} />
                            </View>
                            <Text style={[styles.statValue, { color: theme.text }]}>{statValues[card.key]}</Text>
                            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{t(card.label)}</Text>
                            <View style={[styles.statBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
                                <View style={[styles.statBarFill, { backgroundColor: card.color, width: '60%' }]} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── Weekly Activity ── */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('weeklyActivity')}</Text>
                <View style={[
                    styles.chartCard,
                    {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        shadowColor: isDark ? '#000' : '#0A66FF',
                        shadowOpacity: isDark ? 0.18 : 0.06,
                    },
                ]}>
                    <CustomBarChart />
                </View>

                {/* ── Task Categories ── */}
                <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('taskCategories')}</Text>
                <View style={[
                    styles.chartCard,
                    {
                        backgroundColor: cardBg,
                        borderColor: cardBorder,
                        shadowColor: isDark ? '#000' : '#0A66FF',
                        shadowOpacity: isDark ? 0.18 : 0.06,
                    },
                ]}>
                    <CustomDonutChart data={DONUT_DATA} />
                    {/* Legend */}
                    <View style={styles.legend}>
                        {DONUT_LEGEND.map(item => (
                            <View key={item.label} style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                                <Text style={[styles.legendText, { color: theme.textSecondary }]}>{t(item.label)}</Text>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    scroll: {
        paddingHorizontal: 18,
        paddingBottom: 120,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    headerLeft: { flex: 1 },
    headerGreeting: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 4,
        letterSpacing: 0.2,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 34,
        letterSpacing: -0.5,
    },
    avatarBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },

    // Hero Card
    heroCardWrap: {
        marginBottom: 28,
        borderRadius: 24,
        overflow: 'hidden',
        shadowColor: '#0A66FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    heroCard: {
        borderRadius: 24,
        padding: 22,
        minHeight: 200,
        overflow: 'hidden',
    },
    heroOrb: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255,255,255,0.07)',
        top: -60,
        right: -40,
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    heroLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 6,
        letterSpacing: 0.4,
        textTransform: 'uppercase',
    },
    heroPercent: {
        fontSize: 52,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 56,
        marginBottom: 4,
    },
    heroSub: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.65)',
        fontWeight: '500',
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34,197,94,0.20)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(34,197,94,0.30)',
    },
    heroBadgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#22C55E',
    },

    // Section title
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
        letterSpacing: -0.3,
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 28,
    },
    statCard: {
        width: '47%',
        borderRadius: 18,
        borderWidth: 1,
        padding: 16,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },
    statIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 10,
    },
    statBar: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    statBarFill: {
        height: 4,
        borderRadius: 2,
    },

    // Chart cards
    chartCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 18,
        marginBottom: 28,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 4,
    },

    // Donut legend
    legend: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 14,
        marginTop: 16,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
