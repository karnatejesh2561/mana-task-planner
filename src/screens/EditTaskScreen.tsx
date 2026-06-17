import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CalendarDays, Clock, Tag } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { TextField } from "../components/TextField";
import { Label, Subtitle, Title } from "../components/Typography";
import { tasks } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "EditTask">;

export function EditTaskScreen({ navigation, route }: Props) {
  const { colors } = useAppTheme();
  const task = useMemo(() => tasks.find((item) => item.id === route.params?.taskId) ?? tasks[0], [route.params?.taskId]);
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status);

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Edit task</Title>
        <Subtitle>Update title, schedule, priority, status, and reminder details.</Subtitle>
      </View>
      <TextField placeholder="Task title" defaultValue={task.title} />
      <TextField placeholder="Description" defaultValue={task.description} multiline style={styles.multiline} />
      <TextField icon={<Tag color={colors.muted} size={18} />} placeholder="Category" defaultValue={task.category} />
      <TextField icon={<CalendarDays color={colors.muted} size={18} />} placeholder="Due date" defaultValue={task.dueDate} />
      <TextField icon={<Clock color={colors.muted} size={18} />} placeholder="Due time" defaultValue={task.dueTime} />
      <Label>Priority</Label>
      <SegmentedControl options={["High", "Medium", "Low"]} value={priority} onChange={setPriority} />
      <Label>Status</Label>
      <SegmentedControl options={["Pending", "In Progress", "Completed"]} value={status} onChange={setStatus} />
      <Button label="Save changes" onPress={() => navigation.goBack()} />
      <Button label="Delete task" variant="ghost" onPress={() => navigation.goBack()} />
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
