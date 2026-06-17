import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Bell, CalendarDays, Clock, Tag } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { TextField } from "../components/TextField";
import { Label, Subtitle, Title } from "../components/Typography";
import { categories } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "AddTask">;

export function AddTaskScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  const [priority, setPriority] = useState("High");
  const [status, setStatus] = useState("Pending");
  const [recurrence, setRecurrence] = useState("None");

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Add new task</Title>
        <Subtitle>Create a task with schedule, reminders, priority, and recurrence.</Subtitle>
      </View>
      <TextField placeholder="Task title" />
      <TextField placeholder="Description" multiline style={styles.multiline} />
      <TextField icon={<Tag color={colors.muted} size={18} />} placeholder={`Category: ${categories[1]}`} />
      <TextField icon={<CalendarDays color={colors.muted} size={18} />} placeholder="Due date" />
      <TextField icon={<Clock color={colors.muted} size={18} />} placeholder="Due time" />
      <TextField icon={<Bell color={colors.muted} size={18} />} placeholder="Reminder time" />
      <Label>Priority</Label>
      <SegmentedControl options={["High", "Medium", "Low"]} value={priority} onChange={setPriority} />
      <Label>Status</Label>
      <SegmentedControl options={["Pending", "In Progress", "Completed"]} value={status} onChange={setStatus} />
      <Label>Recurrence</Label>
      <SegmentedControl options={["None", "Daily", "Weekly", "Monthly"]} value={recurrence} onChange={setRecurrence} />
      <Button label="Create task" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  multiline: {
    minHeight: 84,
    textAlignVertical: "top",
    paddingTop: 14
  }
});
