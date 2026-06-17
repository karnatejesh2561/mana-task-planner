import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LockKeyhole, Mail, UserRound } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Subtitle, Title } from "../components/Typography";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export function RegisterScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <Title>Create your account</Title>
        <Subtitle>Start tracking tasks, reminders, productivity streaks, and badges.</Subtitle>
      </View>
      <TextField icon={<UserRound color={colors.muted} size={18} />} placeholder="Full name" />
      <TextField icon={<Mail color={colors.muted} size={18} />} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
      <TextField icon={<LockKeyhole color={colors.muted} size={18} />} placeholder="Password" secureTextEntry />
      <TextField icon={<LockKeyhole color={colors.muted} size={18} />} placeholder="Confirm password" secureTextEntry />
      <Button label="Register" onPress={() => navigation.replace("MainTabs")} />
      <Button label="I already have an account" variant="ghost" onPress={() => navigation.navigate("Login")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 28,
    gap: 8
  }
});
