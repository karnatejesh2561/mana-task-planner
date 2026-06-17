export type RootStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;
  AddTask: undefined;
  EditTask: { taskId?: string } | undefined;
  TaskDetails: { taskId?: string } | undefined;
  Search: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  AddTaskTab: undefined;
  Stats: undefined;
  Profile: undefined;
};
