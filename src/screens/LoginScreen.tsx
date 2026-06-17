import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LockKeyhole, Mail } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Subtitle, Title } from "../components/Typography";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <Title>Welcome back</Title>
        <Subtitle>Log in to review today's tasks, streaks, and reminders.</Subtitle>
      </View>
      <TextField icon={<Mail color={colors.muted} size={18} />} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
      <TextField icon={<LockKeyhole color={colors.muted} size={18} />} placeholder="Password" secureTextEntry />
      <Pressable onPress={() => navigation.navigate("ForgotPassword")} style={styles.right}>
        <Text style={[styles.link, { color: colors.accent }]}>Forgot password?</Text>
      </Pressable>
      <Button label="Login" onPress={() => navigation.replace("MainTabs")} />
      <Button label="Create new account" variant="ghost" onPress={() => navigation.navigate("Register")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    gap: 8
  },
  right: {
    alignSelf: "flex-end"
  },
  link: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0
  }
});
