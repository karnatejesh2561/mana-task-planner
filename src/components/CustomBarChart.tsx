import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { AppTheme, useApp } from '../AppContext';
import { glassPanel } from '../theme/glass';

interface BarDataItem {
  day: string;
  value: number; // Percentage height (0 to 100)
}

interface CustomBarChartProps {
  data?: BarDataItem[];
}

const defaultBarData: BarDataItem[] = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 55 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 95 }, // Friday tallest bar
  { day: 'Sat', value: 35 },
  { day: 'Sun', value: 25 },
];

export const CustomBarChart: React.FC<CustomBarChartProps> = ({ data = defaultBarData }) => {
  const { theme } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.chartContainer}>
        {data.map((item, idx) => (
          <View key={idx} style={styles.barColumn}>
            {/* Grid line indicator background */}
            <View style={styles.barTrack}>
              {/* Animated/Rendered bar */}
              <View style={[styles.barFillContainer, { height: `${item.value}%` }]}>
                <LinearGradient
                  colors={['#0A84FF', '#8B5CF6']}
                  style={styles.gradientBar}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                />
              </View>
            </View>
            <Text style={styles.dayText}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  card: {
    ...glassPanel(theme, { borderRadius: 20 }),
    padding: 24,
  },
  chartContainer: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    width: 14,
    height: 120,
    backgroundColor: theme.glassBgMuted,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFillContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientBar: {
    flex: 1,
    borderRadius: 8,
  },
  dayText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
  },
});
