import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MailCheck } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Subtitle, Title } from "../components/Typography";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <Title>Reset password</Title>
        <Subtitle>Enter your email and ManaTask will send verification steps.</Subtitle>
      </View>
      <TextField icon={<MailCheck color={colors.muted} size={18} />} placeholder="Email address" keyboardType="email-address" autoCapitalize="none" />
      <Button label="Send reset link" onPress={() => navigation.navigate("Login")} />
      <Button label="Back to login" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 40,
    gap: 8
  }
});
