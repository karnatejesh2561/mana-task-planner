import React from 'react';
import { View, StyleSheet, Text, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppTheme, useApp } from '../AppContext';

interface IPhone16FrameProps {
  children: React.ReactNode;
  title?: string;
}

export const IPhone16Frame: React.FC<IPhone16FrameProps> = ({ children, title }) => {
  const { theme } = useApp();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.showcaseWrapper}>
      {title && (
        <View style={styles.titleBadge}>
          <Text style={styles.titleBadgeText}>{title}</Text>
        </View>
      )}
      
      {/* 3D Drop Shadow Container */}
      <View style={styles.phoneOuterBorder}>
        {/* Metallic Bezel */}
        <View style={styles.bezel}>
          {/* Screen Container */}
          <View style={styles.screen}>
            {/* Status Bar */}
            <View style={styles.statusBar}>
              <Text style={styles.timeText}>11:30</Text>
              
              {/* Dynamic Island */}
              <View style={styles.dynamicIsland}>
                <View style={styles.islandCamera} />
              </View>
              
              <View style={styles.statusIcons}>
                <Ionicons name="cellular" size={13} color={theme.icon} style={styles.statusIcon} />
                <Ionicons name="wifi" size={13} color={theme.icon} style={styles.statusIcon} />
                <Ionicons name="battery-full" size={16} color={theme.icon} style={styles.statusIcon} />
              </View>
            </View>

            {/* Application Content */}
            <View style={styles.screenContent}>
              {children}
            </View>

            {/* iOS Home Indicator Bar */}
            <View style={styles.homeIndicatorWrapper}>
              <View style={styles.homeIndicator} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) => StyleSheet.create({
  showcaseWrapper: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  titleBadge: {
    backgroundColor: theme.scheme === 'dark' ? '#182235' : '#0B1F4D',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  titleBadgeText: {
    color: theme.textInverted,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  phoneOuterBorder: {
    borderRadius: 54,
    backgroundColor: '#3E4452', // Outer bumper color
    padding: 3,
    shadowColor: '#0A84FF',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 35,
    elevation: 20,
  },
  bezel: {
    borderRadius: 51,
    backgroundColor: '#1E2022', // Metallic deep bezel
    padding: 10, // Width of screen bezel
  },
  screen: {
    width: 375,
    height: 812,
    backgroundColor: theme.background,
    borderRadius: 41,
    overflow: 'hidden',
    position: 'relative',
  },
  screenContent: {
    flex: 1,
  },
  statusBar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.icon,
    width: 60,
  },
  dynamicIsland: {
    width: 100,
    height: 28,
    backgroundColor: '#000000',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 15,
    position: 'absolute',
    left: '50%',
    marginLeft: -50,
    top: 8,
  },
  islandCamera: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1a1a1a',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 60,
  },
  statusIcon: {
    marginLeft: 5,
  },
  homeIndicatorWrapper: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: theme.icon,
    borderRadius: 2.5,
  },
});
