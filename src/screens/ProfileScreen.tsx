import { Mail, Settings, ShieldCheck, UserRound } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { TextField } from "../components/TextField";
import { Label, Subtitle, Title } from "../components/Typography";
import { useAppTheme } from "../theme/ThemeProvider";

export function ProfileScreen({ navigation }: any) {
  const { colors } = useAppTheme();
  return (
    <Screen>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <UserRound color="#FFFFFF" size={34} />
        </View>
        <Title>Tejesh Kumar</Title>
        <Subtitle>tejesh@example.com</Subtitle>
      </View>
      <View style={[styles.secure, { backgroundColor: colors.surface, borderColor: colors.line }]}>
        <ShieldCheck color={colors.mint} size={22} />
        <Text style={[styles.secureText, { color: colors.text }]}>JWT protected account with device notification tokens ready for FCM.</Text>
      </View>
      <Label>Profile information</Label>
      <TextField icon={<UserRound color={colors.muted} size={18} />} defaultValue="Tejesh Kumar" />
      <TextField icon={<Mail color={colors.muted} size={18} />} defaultValue="tejesh@example.com" />
      <Button label="Update profile" />
      <Button label="Settings" variant="secondary" icon={<Settings color={colors.text} size={18} />} onPress={() => navigation.navigate("Settings")} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: 8,
    paddingTop: 10
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  secure: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  secureText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "700",
    letterSpacing: 0
  }
});
