import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CalendarClock, CheckCircle2, Pencil, RotateCcw } from "lucide-react-native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Label, Subtitle, Title } from "../components/Typography";
import { tasks } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "TaskDetails">;

export function TaskDetailsScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const task = useMemo(() => tasks.find((item) => item.id === route.params?.taskId) ?? tasks[0], [route.params?.taskId]);

  return (
    <Screen>
      <View style={styles.header}>
        <Title>{task.title}</Title>
        <Subtitle>{task.description}</Subtitle>
      </View>
      <View style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <View style={styles.row}>
          <CalendarClock color={colors.accent} size={20} />
          <Text style={[styles.value, { color: colors.text }]}>{task.dueDate} at {task.dueTime}</Text>
        </View>
        <View style={styles.row}>
          <RotateCcw color={colors.mint} size={20} />
          <Text style={[styles.value, { color: colors.text }]}>{task.recurrence} recurrence</Text>
        </View>
        <View style={styles.row}>
          <CheckCircle2 color={colors.amber} size={20} />
          <Text style={[styles.value, { color: colors.text }]}>{task.status} status</Text>
        </View>
      </View>
      <View style={styles.detailGrid}>
        <Info label="Category" value={task.category} />
        <Info label="Priority" value={task.priority} />
        <Info label="Reminder" value={task.reminder} />
        <Info label="Progress" value={`${task.progress}%`} />
      </View>
      <Button label="Mark complete" icon={<CheckCircle2 color="#FFFFFF" size={18} />} />
      <Button label="Edit task" variant="secondary" icon={<Pencil color={colors.text} size={18} />} onPress={() => navigation.navigate("EditTask", { taskId: task.id })} />
      <Button label="Back" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );

  function Info({ label, value }: { label: string; value: string }) {
    return (
      <View style={[styles.info, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <Label>{label}</Label>
        <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  panel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 14
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  value: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  info: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  }
});
