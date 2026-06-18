import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BadgeProps {
  label: string;
  type?: 'priority' | 'status' | 'tag' | 'achievement';
  priority?: 'Low' | 'Medium' | 'High';
  status?: 'To Do' | 'In Progress' | 'In Review' | 'Completed';
  gradientColors?: string[];
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  type = 'tag',
  priority,
  status,
  gradientColors,
  icon,
}) => {
  // Priority styles
  if (type === 'priority') {
    let color = '#22C55E'; // Low default
    let bgColor = 'rgba(34, 197, 94, 0.1)';
    if (priority === 'Medium') {
      color = '#FF7A00';
      bgColor = 'rgba(255, 122, 0, 0.1)';
    } else if (priority === 'High') {
      color = '#EF4444';
      bgColor = 'rgba(239, 68, 68, 0.1)';
    }

    return (
      <View style={[styles.priorityBadge, { backgroundColor: bgColor, borderColor: color }]}>
        <Text style={[styles.priorityText, { color }]}>{label}</Text>
      </View>
    );
  }

  // Status styles
  if (type === 'status') {
    let color = '#8B5CF6'; // Default Purple
    let bgColor = 'rgba(139, 92, 246, 0.1)';

    if (status === 'To Do') {
      color = '#0A84FF';
      bgColor = 'rgba(10, 132, 255, 0.1)';
    } else if (status === 'Completed') {
      color = '#22C55E';
      bgColor = 'rgba(34, 197, 94, 0.1)';
    } else if (status === 'In Review') {
      color = '#FF4D8D';
      bgColor = 'rgba(255, 77, 141, 0.1)';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bgColor }]}>
        <Text style={[styles.statusText, { color }]}>{label}</Text>
      </View>
    );
  }

  // Achievement with Gradient Background
  if (type === 'achievement') {
    const defaultColors: [string, string] = ['#0A84FF', '#8B5CF6'];
    const colors: [string, string] = (gradientColors && gradientColors.length >= 2)
      ? [gradientColors[0], gradientColors[1]]
      : defaultColors;

    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.achievementBadge}
      >
        <Text style={styles.achievementText}>
          {icon ? `${icon} ` : ''}
          {label}
        </Text>
      </LinearGradient>
    );
  }

  // Tag styles (blue-purple outline inspired by logo)
  return (
    <View style={styles.tagBadge}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.2,
    alignSelf: 'flex-start',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  achievementBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  achievementText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  tagBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.25)', // logo purple transparent
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
  },
});
