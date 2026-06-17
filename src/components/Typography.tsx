import { PropsWithChildren } from "react";
import { StyleSheet, Text, TextStyle } from "react-native";

import { useAppTheme } from "../theme/ThemeProvider";

type TextProps = PropsWithChildren<{
  style?: TextStyle | TextStyle[];
  numberOfLines?: number;
}>;

export function Display({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.display, style]}>{children}</Text>;
}

export function Title({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.title, style]}>{children}</Text>;
}

export function Subtitle({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.subtitle, style]}>{children}</Text>;
}

export function Body({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.body, style]}>{children}</Text>;
}

export function Caption({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.caption, style]}>{children}</Text>;
}

export function Micro({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.micro, style]}>{String(children).toUpperCase()}</Text>;
}

// Keep Label to avoid breaking existing references if any, mapping it to Subtitle/Body style.
export function Label({ children, style, numberOfLines }: TextProps) {
  return <Text numberOfLines={numberOfLines} style={[styles.label, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  display: {
    fontFamily: "Inter",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: "800",
    color: "#0F0A1E"
  },
  title: {
    fontFamily: "Inter",
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: "#1A1040"
  },
  subtitle: {
    fontFamily: "Inter",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
    color: "#2D1B6B"
  },
  body: {
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "400",
    color: "#4B5563"
  },
  caption: {
    fontFamily: "Inter",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
    color: "#6B7280"
  },
  micro: {
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.8 // 0.08em of 10px is 0.8px
  },
  label: {
    fontFamily: "Inter",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#0F0A1E"
  }
});
