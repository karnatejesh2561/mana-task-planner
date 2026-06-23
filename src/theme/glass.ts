import { StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { AppTheme } from '../AppContext';

export const GLASS_BLUR = 20;
export const GLASS_TRANSITION_MS = 250;
export const GLASS_BORDER_WIDTH = 1;
export const GLASS_SHADOW_RADIUS = 32;
export const GLASS_SHADOW_OFFSET_Y = 8;

export const glassShadow = (theme: AppTheme, opacity = theme.glassShadowOpacity): ViewStyle => ({
  shadowColor: theme.glassShadow,
  shadowOffset: { width: 0, height: GLASS_SHADOW_OFFSET_Y },
  shadowOpacity: opacity,
  shadowRadius: GLASS_SHADOW_RADIUS,
});

export const glassSurface = (
  theme: AppTheme,
  strength: 'muted' | 'regular' | 'strong' = 'regular',
  overrides?: ViewStyle,
): ViewStyle => ({
  backgroundColor:
    strength === 'strong'
      ? theme.glassBgStrong
      : strength === 'muted'
        ? theme.glassBgMuted
        : theme.glassBg,
  borderWidth: GLASS_BORDER_WIDTH,
  borderColor: strength === 'strong' ? theme.glassBorderStrong : theme.glassBorder,
  borderRadius: theme.glassRadius,
  ...glassShadow(theme),
  ...overrides,
});

export const glassPanel = (theme: AppTheme, overrides?: ViewStyle): ViewStyle => (
  glassSurface(theme, 'regular', {
    borderRadius: theme.glassRadiusLg,
    ...overrides,
  })
);

export const glassInput = (theme: AppTheme, focused = false, overrides?: ViewStyle): ViewStyle => ({
  backgroundColor: focused ? theme.glassBgStrong : theme.glassInput,
  borderWidth: focused ? 1.5 : 1,
  borderColor: focused ? theme.electricBlue : theme.glassBorder,
  borderRadius: theme.glassRadius,
  ...glassShadow(theme, focused ? 0.18 : 0.08),
  ...overrides,
});

export const glassButton = (theme: AppTheme, active = false, overrides?: ViewStyle): ViewStyle => ({
  backgroundColor: active ? theme.glassPressed : theme.glassBg,
  borderWidth: 1,
  borderColor: active ? theme.electricBlue : theme.glassBorder,
  borderRadius: 999,
  ...glassShadow(theme, active ? 0.18 : 0.10),
  ...overrides,
});

export const glassHeader = (theme: AppTheme, overrides?: ViewStyle): ViewStyle => ({
  backgroundColor: theme.glassBgMuted,
  borderBottomWidth: GLASS_BORDER_WIDTH,
  borderBottomColor: theme.glassBorder,
  ...glassShadow(theme, theme.scheme === 'dark' ? 0.16 : 0.08),
  ...overrides,
});

export const glassDivider = (theme: AppTheme): ViewStyle => ({
  borderBottomWidth: StyleSheet.hairlineWidth,
  borderBottomColor: theme.glassBorder,
});

export const glowShadow = (
  theme: AppTheme,
  color: string = theme.electricBlue,
  opacity = 0.35,
): ViewStyle => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: opacity,
  shadowRadius: 20,
  elevation: theme.glassElevation,
});

export const sectionLabel = (theme: AppTheme): TextStyle => ({
  color: theme.textSecondary,
  fontSize: 12,
  fontWeight: '800',
  letterSpacing: 0.2,
});
