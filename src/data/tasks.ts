export type TaskStatus = "Pending" | "In Progress" | "Completed";
export type TaskPriority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  dueTime: string;
  reminder: string;
  recurrence: "None" | "Daily" | "Weekly" | "Monthly";
  progress: number;
};

export const tasks: Task[] = [
  {
    id: "task-1",
    title: "Finalize sprint plan",
    description: "Lock stories, owners, and review reminders before standup.",
    category: "Work",
    priority: "High",
    status: "In Progress",
    dueDate: "Today",
    dueTime: "10:30 AM",
    reminder: "30 min before",
    recurrence: "Weekly",
    progress: 68
  },
  {
    id: "task-2",
    title: "Morning exercise",
    description: "Thirty minutes of low impact cardio and mobility.",
    category: "Health",
    priority: "Medium",
    status: "Completed",
    dueDate: "Today",
    dueTime: "7:00 AM",
    reminder: "15 min before",
    recurrence: "Daily",
    progress: 100
  },
  {
    id: "task-3",
    title: "Pay electricity bill",
    description: "Payment window closes tonight.",
    category: "Finance",
    priority: "High",
    status: "Pending",
    dueDate: "Tomorrow",
    dueTime: "8:00 PM",
    reminder: "1 hour before",
    recurrence: "Monthly",
    progress: 20
  },
  {
    id: "task-4",
    title: "Read product design notes",
    description: "Review calendar and achievement flow feedback.",
    category: "Study",
    priority: "Low",
    status: "Pending",
    dueDate: "Fri",
    dueTime: "9:15 PM",
    reminder: "None",
    recurrence: "None",
    progress: 10
  }
];

export const categories = ["Personal", "Work", "Health", "Study", "Finance", "Shopping"];

export const badges = [
  { label: "First Task", tone: "#12B886" },
  { label: "10 Completed", tone: "#2563EB" },
  { label: "7-Day Streak", tone: "#F59E0B" }
];
