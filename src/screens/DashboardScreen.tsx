import { Bell, CalendarPlus, ChartPie, CheckCircle2, Flame, ListTodo, Plus, TimerReset } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";

import { Button } from "../components/Button";
import { MetricCard } from "../components/MetricCard";
import { Screen } from "../components/Screen";
import { TaskCard } from "../components/TaskCard";
import { Label, Subtitle, Title } from "../components/Typography";
import { badges, tasks } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";

function ProductivityRing() {
  const { colors } = useAppTheme();
  const size = 118;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.74;

  return (
    <View style={styles.ringWrap}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="#DBEAFE" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.accent}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - progress)}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.ringLabel}>
        <Text style={[styles.ringValue, { color: colors.text }]}>74%</Text>
        <Text style={[styles.ringText, { color: colors.muted }]}>focus</Text>
      </View>
    </View>
  );
}

export function DashboardScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Subtitle>Today, Jun 17</Subtitle>
          <Title>Productive flow</Title>
        </View>
        <View style={[styles.notification, { backgroundColor: colors.surface, shadowColor: colors.accent }]}>
          <Bell color={colors.accent} size={20} />
        </View>
      </View>

      <LinearGradient colors={["#EFF6FF", "#FFFFFF", "#ECFEFF"]} style={[styles.hero, { borderColor: colors.line, shadowColor: colors.accent }]}>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroKicker, { color: colors.accent }]}>Today priority</Text>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Finalize 3 high-impact tasks before 4 PM</Text>
          <Text style={[styles.heroMeta, { color: colors.muted }]}>2 deep-work blocks scheduled</Text>
        </View>
        <ProductivityRing />
      </LinearGradient>

      <View style={styles.grid}>
        <MetricCard label="Today's tasks" value="8" tone={colors.accent} icon={<ListTodo color={colors.accent} size={18} />} />
        <MetricCard label="Completed" value="5" tone={colors.mint} icon={<CheckCircle2 color={colors.mint} size={18} />} />
        <MetricCard label="Overdue" value="1" tone={colors.rose} icon={<TimerReset color={colors.rose} size={18} />} />
        <MetricCard label="Streak" value="7d" tone={colors.amber} icon={<Flame color={colors.amber} size={18} />} />
      </View>

      <View style={styles.actions}>
        <Button label="Add task" icon={<Plus color="#FFFFFF" size={18} />} onPress={() => navigation.navigate("AddTask")} style={styles.actionButton} />
        <Button label="Calendar" variant="secondary" icon={<CalendarPlus color={colors.text} size={18} />} onPress={() => navigation.navigate("Calendar")} style={styles.actionButton} />
        <Button label="Stats" variant="secondary" icon={<ChartPie color={colors.text} size={18} />} onPress={() => navigation.navigate("Stats")} style={styles.actionButton} />
      </View>

      <View style={[styles.quote, { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.shadow }]}>
        <Label>Daily motivation</Label>
        <Text style={[styles.quoteText, { color: colors.text }]}>Consistency beats perfection.</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Label>Achievement badges</Label>
      </View>
      <View style={styles.badges}>
        {badges.map((badge) => (
          <View key={badge.label} style={[styles.badge, { backgroundColor: `${badge.tone}1F`, borderColor: `${badge.tone}55` }]}>
            <Text style={[styles.badgeText, { color: badge.tone }]}>{badge.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Label>Upcoming tasks</Label>
      </View>
      {tasks.slice(0, 3).map((task) => (
        <TaskCard key={task.id} task={task} onPress={() => navigation.navigate("TaskDetails", { taskId: task.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  notification: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  hero: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 5
  },
  heroCopy: {
    flex: 1,
    gap: 7
  },
  heroKicker: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  },
  heroTitle: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0
  },
  heroMeta: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  ringWrap: {
    width: 118,
    height: 118,
    alignItems: "center",
    justifyContent: "center"
  },
  ringLabel: {
    position: "absolute",
    alignItems: "center"
  },
  ringValue: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  ringText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  actions: {
    flexDirection: "row",
    gap: 8
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 8
  },
  quote: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 6,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  quoteText: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: "900",
    letterSpacing: 0
  },
  sectionHeader: {
    marginTop: 4
  },
  badges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  badge: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  }
});
