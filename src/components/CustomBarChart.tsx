import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
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
    backgroundColor: '#F3F0FA',
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
    color: '#999999',
  },
});
