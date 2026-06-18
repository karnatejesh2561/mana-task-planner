import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface DonutItem {
  name: string;
  percentage: number;
  color: string;
}

interface CustomDonutChartProps {
  data: DonutItem[];
  size?: number;
  strokeWidth?: number;
}

export const CustomDonutChart: React.FC<CustomDonutChartProps> = ({
  data,
  size = 180,
  strokeWidth = 24,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate stroke offsets for cumulative segments
  let accumulatedPercentage = 0;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
            {/* Background track circle */}
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#F0EDF6"
              strokeWidth={strokeWidth - 2}
              fill="transparent"
            />
            {/* Segments */}
            {data.map((item, idx) => {
              const strokeLength = (item.percentage / 100) * circumference;
              const strokeOffset = circumference - strokeLength + (accumulatedPercentage / 100) * circumference;
              accumulatedPercentage += item.percentage;
              
              return (
                <Circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${strokeLength} ${circumference}`}
                  strokeDashoffset={-strokeOffset}
                  strokeLinecap={item.percentage > 5 ? 'round' : 'butt'}
                  fill="transparent"
                />
              );
            })}
          </G>
        </Svg>
        {/* Center Text displaying overall metrics */}
        <View style={styles.centerTextContainer}>
          <Text style={styles.centerPercentage}>87%</Text>
          <Text style={styles.centerLabel}>Done</Text>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
        {data.map((item, idx) => (
          <View key={idx} style={styles.legendItem}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>{item.name}</Text>
            <Text style={styles.legendValue}>{item.percentage}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  chartWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPercentage: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111111',
  },
  centerLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
    marginTop: 2,
  },
  legendContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 6,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 13,
    color: '#666666',
    marginRight: 4,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    color: '#111111',
    fontWeight: '600',
  },
});
