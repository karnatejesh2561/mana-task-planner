import React from 'react';
import { Alert, View, StyleSheet, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useApp, COLORS, AppTheme } from '../AppContext';
import { CustomLineChart } from '../components/CustomLineChart';
import { CustomBarChart } from '../components/CustomBarChart';
import { CustomDonutChart } from '../components/CustomDonutChart';
import { glassButton, glassPanel, glassSurface, glowShadow } from '../theme/glass';

interface StatisticsDashboardProps {
  onNavigate: (screen: string) => void;
}

export const StatisticsDashboard: React.FC<StatisticsDashboardProps> = ({ onNavigate }) => {
  const { stats, theme } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const donutData = [
    { name: 'Work', percentage: 45, color: COLORS.electricBlue },
    { name: 'Personal', percentage: 25, color: COLORS.electricBlue },
    { name: 'Study', percentage: 20, color: COLORS.orangeAccent },
    { name: 'Health', percentage: 10, color: COLORS.success },
  ];

  const analyticsCards = [
    { emoji: '✅', title: 'Completed', value: String(stats.completed), delta: '+12%', color: COLORS.electricBlue },
    { emoji: '⏳', title: 'Pending', value: String(stats.pending), delta: '-8%', color: COLORS.orangeAccent },
    { emoji: '🔥', title: 'Focus Hours', value: stats.focusHours, delta: '+20%', color: COLORS.electricBlue },
    { emoji: '🎯', title: 'Goals', value: String(stats.goalsAchieved), delta: '+9%', color: COLORS.pinkAccent },
  ];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('Profile')}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80' }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
        <Text style={styles.headerDate}>Wed, April 26</Text>
        <TouchableOpacity style={styles.circularButton} onPress={() => Alert.alert('Notifications', 'No new alerts')}>
          <Ionicons name="notifications-outline" size={20} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Hero Title */}
      <View style={styles.heroSection}>
        <Text style={styles.heroText}>Productivity</Text>
        <Text style={styles.heroText}>
          <Text style={{ color: theme.electricBlue }}>Statistics</Text>
        </Text>
      </View>

      {/* Hero Analytics Card */}
      <View style={styles.heroCardContainer}>
        <LinearGradient
          colors={[theme.deepNavy, theme.electricBlue, theme.electricBlue]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroCardTopRow}>
            <Text style={styles.heroCardLabel}>Weekly Productivity</Text>
            <View style={styles.heroCardBadge}>
              <Text style={styles.heroCardBadgeText}>This Week</Text>
            </View>
          </View>
          <Text style={styles.heroCardPercentage}>{stats.percentage}%</Text>
          <Text style={styles.heroCardSubtitle}>Tasks completed this week</Text>
          <CustomLineChart
            data={[60, 68, 62, 75, stats.percentage - 5, stats.percentage, Math.min(100, stats.percentage + 3)]}
          />
        </LinearGradient>
      </View>

      {/* Analytics Grid */}
      <View style={styles.gridContainer}>
        {analyticsCards.map((card, idx) => (
          <View key={idx} style={styles.gridItem}>
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>{card.emoji}</Text>
                <Text style={[
                  styles.cardTag,
                  {
                    color: card.delta.startsWith('+') ? COLORS.success : COLORS.error,
                    backgroundColor: card.delta.startsWith('+')
                      ? 'rgba(34,197,94,0.1)'
                      : 'rgba(239,68,68,0.1)',
                  },
                ]}>
                  {card.delta}
                </Text>
              </View>
              <View style={[styles.cardAccentBar, { backgroundColor: card.color }]} />
              <Text style={styles.cardValue}>{card.value}</Text>
              <Text style={styles.cardLabel}>{card.title}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Weekly Activity */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Weekly Activity</Text>
        <CustomBarChart />
      </View>

      {/* Task Categories Donut */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Task Categories</Text>
        <View style={styles.donutCard}>
          <CustomDonutChart data={donutData} />
        </View>
      </View>
    </ScrollView>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 110 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 56,
  },
  profileImage: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.electricBlue },
  headerDate: { fontSize: 15, fontWeight: '800', color: theme.text },
  circularButton: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    ...glassButton(theme, false, { borderRadius: 22 }),
  },
  heroSection: { paddingHorizontal: 24, marginTop: 24, marginBottom: 20 },
  heroText: { fontSize: 34, fontWeight: '800', color: theme.text, lineHeight: 38 },
  heroCardContainer: { paddingHorizontal: 24, marginBottom: 24 },
  heroCard: {
    borderRadius: 24, padding: 24, height: 230,
    justifyContent: 'space-between',
    ...glowShadow(theme, theme.electricBlue, 0.25),
  },
  heroCardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCardLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  heroCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  heroCardBadgeText: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  heroCardPercentage: { fontSize: 52, fontWeight: '800', color: '#FFFFFF', lineHeight: 54 },
  heroCardSubtitle: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  gridContainer: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 18, marginBottom: 24,
  },
  gridItem: { width: '50%', padding: 6 },
  glassCard: {
    height: 148,
    ...glassSurface(theme, 'regular', { borderRadius: 20 }),
    padding: 18,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIcon: { fontSize: 22 },
  cardTag: {
    fontSize: 11, fontWeight: '800',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  cardAccentBar: { height: 3, borderRadius: 2, width: '40%', marginVertical: 4 },
  cardValue: { fontSize: 28, fontWeight: '800', color: theme.text },
  cardLabel: { fontSize: 13, color: theme.textSecondary, fontWeight: '600' },
  chartSection: { paddingHorizontal: 24, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: theme.text, marginBottom: 14 },
  donutCard: {
    ...glassPanel(theme, { borderRadius: 20 }),
    padding: 24,
  },
});
