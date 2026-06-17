import "react-native-gesture-handler";
import { Buffer } from "buffer";
// Polyfill global Buffer for libraries requiring it in the React Native runtime
global.Buffer = global.Buffer || Buffer;

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { CalendarDays, ChartNoAxesCombined, Home, Plus, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { AppThemeProvider, useAppTheme } from "./src/theme/ThemeProvider";
import { AddTaskScreen } from "./src/screens/AddTaskScreen";
import { CalendarScreen } from "./src/screens/CalendarScreen";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { EditTaskScreen } from "./src/screens/EditTaskScreen";
import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RegisterScreen } from "./src/screens/RegisterScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { SplashScreen } from "./src/screens/SplashScreen";
import { StatisticsScreen } from "./src/screens/StatisticsScreen";
import { TaskDetailsScreen } from "./src/screens/TaskDetailsScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
import { RootStackParamList, TabParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const { colors } = useAppTheme();
  const renderFabButton = (props: any) => (
    <Pressable {...props} style={({ pressed }) => [styles.fabButton, { shadowColor: colors.accent, opacity: pressed ? 0.86 : 1 }]}>
      <LinearGradient colors={[colors.accent, colors.secondary, colors.cyan]} style={styles.fabGradient}>
        <Plus color="#FFFFFF" size={26} strokeWidth={2.8} />
      </LinearGradient>
    </Pressable>
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 16,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: colors.surface,
          borderTopColor: "transparent",
          borderRadius: 30,
          borderWidth: 1,
          borderColor: colors.line,
          shadowColor: colors.shadow,
          shadowOpacity: 0.14,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "900" },
        tabBarItemStyle: { borderRadius: 24 }
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Home", tabBarIcon: ({ color }) => <Home color={color ?? colors.muted} size={22} /> }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: ({ color }) => <CalendarDays color={color ?? colors.muted} size={22} /> }} />
      <Tab.Screen
        name="AddTaskTab"
        component={DashboardScreen}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            navigation.getParent()?.navigate("AddTask");
          }
        })}
        options={{
          title: "",
          tabBarButton: renderFabButton
        }}
      />
      <Tab.Screen name="Stats" component={StatisticsScreen} options={{ title: "Stats", tabBarIcon: ({ color }) => <ChartNoAxesCombined color={color ?? colors.muted} size={22} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <UserRound color={color ?? colors.muted} size={22} /> }} />
    </Tab.Navigator>
  );
}

function AppShell() {
  const { isDark, colors } = useAppTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background }
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="AddTask" component={AddTaskScreen} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} />
        <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <AppShell />
    </AppThemeProvider>
  );
}

const styles = StyleSheet.create({
  fabButton: {
    top: -24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12
  },
  fabGradient: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center"
  }
});
