import { SlidersHorizontal, Search as SearchIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { TaskCard } from "../components/TaskCard";
import { TextField } from "../components/TextField";
import { Label, Subtitle, Title } from "../components/Typography";
import { tasks } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";

export function SearchScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.title.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || task.priority === filter || task.status === filter)),
    [filter, query]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Search</Title>
        <Subtitle>Find tasks by title and filter by priority, status, category, or date.</Subtitle>
      </View>
      <TextField icon={<SearchIcon color={colors.muted} size={18} />} placeholder="Search task title" value={query} onChangeText={setQuery} />
      <View style={styles.filterHeader}>
        <Label>Filters</Label>
        <SlidersHorizontal color={colors.accent} size={20} />
      </View>
      <SegmentedControl options={["All", "High", "Pending", "Completed"]} value={filter} onChange={setFilter} />
      {visibleTasks.map((task) => (
        <TaskCard key={task.id} task={task} onPress={() => navigation.navigate("TaskDetails", { taskId: task.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
