import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppTheme } from "../theme/ThemeProvider";

export function FocusIllustration() {
  const { colors } = useAppTheme();

  return (
    <LinearGradient colors={["#EFF6FF", "#FFFFFF", "#ECFEFF"]} style={[styles.wrap, { borderColor: colors.line, shadowColor: colors.accent }]}>
      <View style={[styles.glow, styles.blueGlow]} />
      <View style={[styles.glow, styles.cyanGlow]} />
      <View style={[styles.orbit, { borderColor: `${colors.accent}55` }]}>
        <View style={[styles.orbitInner, { borderColor: `${colors.cyan}55` }]}>
          <LinearGradient colors={[colors.accent, colors.secondary, colors.cyan]} style={styles.core} />
        </View>
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        <View style={[styles.dot, { backgroundColor: colors.mint }]} />
        <View style={[styles.dot, { backgroundColor: colors.amber }]} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 210,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.14,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5
  },
  glow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    opacity: 0.2
  },
  blueGlow: {
    left: -32,
    top: 24,
    backgroundColor: "#2563EB"
  },
  cyanGlow: {
    right: -26,
    bottom: 16,
    backgroundColor: "#06B6D4"
  },
  orbit: {
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 12,
    transform: [{ rotate: "-16deg" }],
    alignItems: "center",
    justifyContent: "center"
  },
  orbitInner: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  core: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  dots: {
    position: "absolute",
    bottom: 20,
    flexDirection: "row",
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8
  }
});
