import { Task, Project, TaskAssignee } from './types';

export const mockAssignees: TaskAssignee[] = [
  { id: '1', name: 'Olivia Reed', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80' },
  { id: '2', name: 'John Doe', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&q=80' },
  { id: '3', name: 'Alice Smith', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&q=80' },
  { id: '4', name: 'Bob Johnson', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&q=80' },
];

export const mockProjects: Project[] = [
  { id: '1', name: 'Website Redesign', icon: 'folder', color: '#0A84FF' },
  { id: '2', name: 'Dribbble Showcase', icon: 'star', color: '#8B5CF6' },
  { id: '3', name: 'Backend Dev', icon: 'code', color: '#FF7A00' },
  { id: '4', name: 'Marketing', icon: 'briefcase', color: '#FF4D8D' },
  { id: '5', name: 'Personal Development', icon: 'user', color: '#22C55E' },
];

// Generates 23 dummy completed tasks to make the math fit the 72% progress ring
const generateCompletedTasks = (): Task[] => {
  const completedTasks: Task[] = [];
  const titles = [
    'Initial wireframes setup',
    'User journey mapping',
    'Font research & selection',
    'Client logo refinement',
    'Color palette validation',
    'Competitor analysis report',
    'Asset export for development',
    'Typography system layout',
    'Grid system definition',
    'Mockup feedback collection',
    'Landing page copy draft',
    'SEO keywords analysis',
    'Database schema design',
    'API route planning',
    'Auth flow diagramming',
    'Notification icons selection',
    'Profile layout experiments',
    'Dark theme setup',
    'Onboarding slide drawings',
    'Press kit packaging',
    'Social media banner exports',
    'Privacy policy draft',
    'Help center FAQ list',
  ];

  for (let i = 0; i < 23; i++) {
    completedTasks.push({
      id: `c-${i}`,
      title: titles[i] || `Completed task ${i + 1}`,
      description: 'Completed successfully during the sprint work cycle.',
      dueDate: 'April 25, 2026',
      dueTime: '05:00 PM',
      priority: i % 3 === 0 ? 'High' : i % 3 === 1 ? 'Medium' : 'Low',
      project: mockProjects[i % mockProjects.length].name,
      tags: ['Done', 'Sprint'],
      status: 'Completed',
      timeSlot: '04:00 PM - 05:00 PM',
      assignees: [mockAssignees[0], mockAssignees[i % mockAssignees.length]],
    });
  }
  return completedTasks;
};

export const defaultTasks: Task[] = [
  // 4 To Do Tasks
  {
    id: 't-1',
    title: 'Meeting with Client',
    description: 'Client meeting to review project progress, gather feedback on mockups, and align on upcoming release goals.',
    dueDate: 'April 26, 2026',
    dueTime: '09:00 AM',
    priority: 'High',
    project: 'Website Redesign',
    tags: ['Meeting', 'Client'],
    status: 'To Do',
    timeSlot: '09:00 AM - 10:00 AM',
    assignees: [mockAssignees[0], mockAssignees[1], mockAssignees[2]],
  },
  {
    id: 't-2',
    title: 'Update Appearance Styling',
    description: 'Refine custom font selection and glassmorphic elevations across dashboard screens for modern premium aesthetic.',
    dueDate: 'April 26, 2026',
    dueTime: '03:30 PM',
    priority: 'Medium',
    project: 'Website Redesign',
    tags: ['UI/UX', 'Styling'],
    status: 'To Do',
    timeSlot: '03:30 PM - 04:30 PM',
    assignees: [mockAssignees[0]],
  },
  {
    id: 't-3',
    title: 'Study React Native Animations',
    description: 'Read up on Reanimated layout animations and layout triggers to implement smooth transition micro-interactions.',
    dueDate: 'April 26, 2026',
    dueTime: '06:00 PM',
    priority: 'Low',
    project: 'Personal Development',
    tags: ['Study', 'Research'],
    status: 'To Do',
    timeSlot: '06:00 PM - 07:00 PM',
    assignees: [mockAssignees[0]],
  },
  {
    id: 't-4',
    title: 'Gym Session',
    description: 'Strength training workout at local gym.',
    dueDate: 'April 26, 2026',
    dueTime: '08:30 PM',
    priority: 'Low',
    project: 'Personal Development',
    tags: ['Health', 'Workout'],
    status: 'To Do',
    timeSlot: '08:30 PM - 09:30 PM',
    assignees: [mockAssignees[0]],
  },

  // 2 In Progress Tasks
  {
    id: 't-5',
    title: 'Design Landing Page',
    description: 'Design the new high-converting landing page layout for the product launch, integrating logo gradient elements.',
    dueDate: 'April 26, 2026',
    dueTime: '10:30 AM',
    priority: 'High',
    project: 'Website Redesign',
    tags: ['Design', 'UI/UX', 'Work'],
    status: 'In Progress',
    timeSlot: '10:30 AM - 11:30 AM',
    assignees: [mockAssignees[0], mockAssignees[1], mockAssignees[2], mockAssignees[3]],
  },
  {
    id: 't-6',
    title: 'Next Month Dribbble Shot Design',
    description: 'Design a clean, high-fidelity Dribbble shot highlighting the dark mode dashboard layout and custom stats graphs.',
    dueDate: 'April 26, 2026',
    dueTime: '11:00 AM',
    priority: 'Medium',
    project: 'Dribbble Showcase',
    tags: ['Design', 'Dribbble', 'Work'],
    status: 'In Progress',
    timeSlot: '11:00 AM - 01:30 PM',
    assignees: [mockAssignees[0], mockAssignees[3]],
  },

  // 3 In Review Tasks
  {
    id: 't-7',
    title: 'Review Code Submissions',
    description: 'Audit pull requests for the task planner backend repository to ensure codebase quality and architectural alignment.',
    dueDate: 'April 26, 2026',
    dueTime: '02:00 PM',
    priority: 'Low',
    project: 'Backend Dev',
    tags: ['Code', 'Review'],
    status: 'In Review',
    timeSlot: '02:00 PM - 03:00 PM',
    assignees: [mockAssignees[1], mockAssignees[2]],
  },
  {
    id: 't-8',
    title: 'Prepare Product Pitch Deck',
    description: 'Draft the slide outline, compose key metrics charts, and select brand asset mockups for investor presentation.',
    dueDate: 'April 26, 2026',
    dueTime: '04:30 PM',
    priority: 'High',
    project: 'Marketing',
    tags: ['Pitch', 'Slides'],
    status: 'In Review',
    timeSlot: '04:30 PM - 06:00 PM',
    assignees: [mockAssignees[0], mockAssignees[3]],
  },
  {
    id: 't-9',
    title: 'Weekly Sync with Team',
    description: 'Align on upcoming sprint goals, review performance analytics dashboard, and address blocker items.',
    dueDate: 'April 26, 2026',
    dueTime: '07:30 PM',
    priority: 'Medium',
    project: 'Website Redesign',
    tags: ['Meeting', 'Sync'],
    status: 'In Review',
    timeSlot: '07:30 PM - 08:30 PM',
    assignees: [mockAssignees[0], mockAssignees[1], mockAssignees[2], mockAssignees[3]],
  },

  // 23 Completed Tasks
  ...generateCompletedTasks(),
];
