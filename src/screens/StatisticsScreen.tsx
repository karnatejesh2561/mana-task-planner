import { BarChart3, CheckCircle2, Clock3, Flame, ListTodo, TriangleAlert } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { FocusIllustration } from "../components/FocusIllustration";
import { MetricCard } from "../components/MetricCard";
import { Screen } from "../components/Screen";
import { Label, Subtitle, Title } from "../components/Typography";
import { useAppTheme } from "../theme/ThemeProvider";

const bars = [52, 74, 48, 88, 64, 92, 80];

export function StatisticsScreen() {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <Title>Statistics</Title>
        <Subtitle>Daily, weekly, and monthly productivity metrics with streak progress.</Subtitle>
      </View>
      <FocusIllustration />
      <View style={styles.grid}>
        <MetricCard label="Total tasks" value="128" tone={colors.accent} icon={<ListTodo color={colors.accent} size={18} />} />
        <MetricCard label="Completed" value="94" tone={colors.mint} icon={<CheckCircle2 color={colors.mint} size={18} />} />
        <MetricCard label="Pending" value="27" tone={colors.amber} icon={<Clock3 color={colors.amber} size={18} />} />
        <MetricCard label="Overdue" value="7" tone={colors.rose} icon={<TriangleAlert color={colors.rose} size={18} />} />
      </View>
      <LinearGradient colors={["#FFFFFF", "#F8FAFC"]} style={[styles.chart, { borderColor: colors.line, shadowColor: colors.accent }]}>
        <View style={styles.chartHeader}>
          <Label>Weekly productivity</Label>
          <BarChart3 color={colors.accent} size={20} />
        </View>
        <View style={styles.bars}>
          {bars.map((height, index) => (
            <View key={index} style={styles.barWrap}>
              <View style={[styles.bar, { height, backgroundColor: index === 5 ? colors.accent : colors.surfaceAlt }]} />
              <Text style={[styles.barLabel, { color: colors.muted }]}>{["M", "T", "W", "T", "F", "S", "S"][index]}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
      <View style={[styles.streak, { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.amber }]}>
        <Flame color={colors.amber} size={24} />
        <View style={styles.streakText}>
          <Text style={[styles.streakTitle, { color: colors.text }]}>7-day productivity streak</Text>
          <Text style={[styles.streakSub, { color: colors.muted }]}>Next badge unlocks at 10 completed days.</Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  chart: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 16,
    gap: 18,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  bars: {
    height: 130,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10
  },
  barWrap: {
    flex: 1,
    alignItems: "center",
    gap: 8
  },
  bar: {
    width: "100%",
    borderRadius: 12
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  streak: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3
  },
  streakText: {
    flex: 1,
    gap: 3
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0
  },
  streakSub: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0
  }
});
