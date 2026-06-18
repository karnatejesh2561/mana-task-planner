export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'To Do' | 'In Progress' | 'In Review' | 'Completed';

export interface TaskAssignee {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // e.g., "April 14, 2026"
  dueTime: string; // e.g., "10:00 AM"
  priority: TaskPriority;
  project: string; // e.g., "Website Redesign"
  tags: string[];
  status: TaskStatus;
  timeSlot: string; // e.g., "10:30 AM - 11:30 AM"
  assignees: TaskAssignee[];
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface WeeklyActivity {
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  value: number; // height relative value
}

export interface CategoryDistribution {
  name: string;
  percentage: number;
  color: string;
}
