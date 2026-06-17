import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Task } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";

type TaskCardProps = {
  task: Task;
  onPress?: () => void;
};

export function TaskCard({ task, onPress }: TaskCardProps) {
  const { colors } = useAppTheme();
  const priorityColor = task.priority === "High" ? colors.rose : task.priority === "Medium" ? colors.amber : colors.mint;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.84 : 1 }]}>
      <LinearGradient colors={[`${priorityColor}66`, `${colors.accent}1A`, "#FFFFFF"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.border}>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: priorityColor }]}>
          <View style={styles.header}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor, shadowColor: priorityColor }]} />
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={[styles.time, { color: colors.muted }]}>{task.dueTime}</Text>
          </View>
          <Text style={[styles.description, { color: colors.muted }]} numberOfLines={2}>
            {task.description}
          </Text>
          <View style={styles.footer}>
            <Text style={[styles.pill, { backgroundColor: "#FFFFFF", color: colors.text }]}>{task.category}</Text>
            <Text style={[styles.pill, { backgroundColor: `${priorityColor}1F`, color: priorityColor }]}>{task.priority}</Text>
            <Text style={[styles.status, { color: task.status === "Completed" ? colors.mint : colors.accent }]}>{task.status}</Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  border: {
    borderRadius: 26,
    padding: 1
  },
  card: {
    borderRadius: 25,
    padding: 16,
    gap: 11,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 9 },
    elevation: 3
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  priorityDot: {
    width: 9,
    height: 9,
    borderRadius: 9,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 }
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: 0
  },
  time: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    letterSpacing: 0
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  pill: {
    overflow: "hidden",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  status: {
    marginLeft: "auto",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  }
});
