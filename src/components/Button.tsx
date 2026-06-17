import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppTheme } from "../theme/ThemeProvider";

type ButtonProps = {
  label: string;
  onPress?: () => void;
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  style?: ViewStyle;
};

export function Button({ label, onPress, icon, variant = "primary", style }: ButtonProps) {
  const { colors } = useAppTheme();
  const textColor = variant === "primary" ? "#FFFFFF" : colors.text;
  const content = (
    <>
      {icon}
      <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant !== "primary" && {
          backgroundColor: variant === "secondary" ? colors.surfaceAlt : "transparent",
          borderColor: variant === "ghost" ? colors.line : colors.surfaceAlt,
          paddingHorizontal: 18
        },
        variant === "primary" && { shadowColor: colors.accent },
        { opacity: pressed ? 0.82 : 1 },
        style
      ]}
    >
      {variant === "primary" ? (
        <LinearGradient colors={[colors.accent, colors.secondary, colors.cyan]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    overflow: "hidden",
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  gradient: {
    minHeight: 52,
    width: "100%",
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  }
});
