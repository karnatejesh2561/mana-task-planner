import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { SegmentedControl } from "../components/SegmentedControl";
import { TaskCard } from "../components/TaskCard";
import { Label, Subtitle, Title } from "../components/Typography";
import { tasks } from "../data/tasks";
import { useAppTheme } from "../theme/ThemeProvider";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dates = ["15", "16", "17", "18", "19", "20", "21"];

export function CalendarScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  const [view, setView] = useState("Week");

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Calendar</Title>
        <Subtitle>View tasks by month or week with quick creation from dates.</Subtitle>
      </View>
      <SegmentedControl options={["Week", "Month"]} value={view} onChange={setView} />
      <LinearGradient colors={["#F8FAFC", "#FFFFFF"]} style={[styles.calendar, { borderColor: colors.line, shadowColor: colors.accent }]}>
        {days.map((day, index) => {
          const active = index === 2;
          return (
            <View key={day} style={[styles.day, { backgroundColor: active ? colors.accent : colors.surfaceAlt, shadowColor: active ? colors.accent : "transparent" }]}>
              <Text style={[styles.dayName, { color: active ? "#FFFFFF" : colors.muted }]}>{day}</Text>
              <Text style={[styles.dayNumber, { color: active ? "#FFFFFF" : colors.text }]}>{dates[index]}</Text>
              <View style={[styles.indicator, { backgroundColor: index % 2 === 0 ? colors.mint : colors.amber }]} />
            </View>
          );
        })}
      </LinearGradient>
      <Button label="Quick add from calendar" onPress={() => navigation.navigate("AddTask")} />
      <Label>Tasks on selected date</Label>
      <View style={[styles.timeline, { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.shadow }]}>
        {["10:30", "14:00", "18:45"].map((time, index) => (
          <View key={time} style={styles.timelineRow}>
            <Text style={[styles.timelineTime, { color: colors.muted }]}>{time}</Text>
            <View style={[styles.timelineDot, { backgroundColor: index === 0 ? colors.accent : index === 1 ? colors.mint : colors.amber }]} />
            <Text style={[styles.timelineText, { color: colors.text }]}>{["Sprint planning", "Design review", "Bill reminder"][index]}</Text>
          </View>
        ))}
      </View>
      {tasks.slice(0, 2).map((task) => (
        <TaskCard key={task.id} task={task} onPress={() => navigation.navigate("TaskDetails", { taskId: task.id })} />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  calendar: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 10,
    flexDirection: "row",
    gap: 7,
    shadowOpacity: 0.12,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 4
  },
  day: {
    flex: 1,
    minHeight: 92,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3
  },
  dayName: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 6
  },
  timeline: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 14,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  timelineTime: {
    width: 44,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 10
  },
  timelineText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0
  }
});
