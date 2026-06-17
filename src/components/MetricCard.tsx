import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { useAppTheme } from "../theme/ThemeProvider";

type MetricCardProps = {
  label: string;
  value: string;
  icon: ReactNode;
  tone: string;
};

export function MetricCard({ label, value, icon, tone }: MetricCardProps) {
  const { colors } = useAppTheme();
  return (
    <LinearGradient colors={["#FFFFFF", colors.surface]} style={[styles.card, { borderColor: `${tone}24`, shadowColor: tone }]}>
      <View style={[styles.icon, { backgroundColor: `${tone}18` }]}>{icon}</View>
      <View style={styles.copy}>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
        <Text style={[styles.label, { color: colors.muted }]} numberOfLines={1}>
          {label}
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: "46%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  icon: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    gap: 2
  },
  value: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "900",
    letterSpacing: 0
  },
  label: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  }
});
