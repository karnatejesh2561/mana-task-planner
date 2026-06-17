import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BellRing, LogOut, Moon, Trash2 } from "lucide-react-native";
import { StyleSheet, Switch, Text, View } from "react-native";

import { Button } from "../components/Button";
import { Screen } from "../components/Screen";
import { Label, Subtitle, Title } from "../components/Typography";
import { useAppTheme } from "../theme/ThemeProvider";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export function SettingsScreen({ navigation }: Props) {
  const { colors } = useAppTheme();

  return (
    <Screen>
      <View style={styles.header}>
        <Title>Settings</Title>
        <Subtitle>Manage notifications, appearance, session, and account controls.</Subtitle>
      </View>
      <SettingRow icon={<BellRing color={colors.accent} size={21} />} label="Enable notifications" value="Reminder actions: open task, mark complete">
        <Switch value trackColor={{ true: colors.accent, false: colors.line }} thumbColor="#FFFFFF" />
      </SettingRow>
      <SettingRow icon={<Moon color={colors.indigo} size={21} />} label="White theme" value="Light appearance locked to match ManaTask branding">
        <Switch value disabled trackColor={{ true: colors.indigo, false: colors.line }} thumbColor="#FFFFFF" />
      </SettingRow>
      <Button label="Logout" variant="secondary" icon={<LogOut color={colors.text} size={18} />} onPress={() => navigation.replace("Login")} />
      <Button label="Delete account" variant="ghost" icon={<Trash2 color={colors.rose} size={18} />} />
    </Screen>
  );

  function SettingRow({ icon, label, value, children }: { icon: React.ReactNode; label: string; value: string; children: React.ReactNode }) {
    return (
      <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.shadow }]}>
        <View style={styles.rowIcon}>{icon}</View>
        <View style={styles.rowText}>
          <Label>{label}</Label>
          <Text style={[styles.value, { color: colors.muted }]}>{value}</Text>
        </View>
        {children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    gap: 8
  },
  row: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  rowIcon: {
    width: 36,
    alignItems: "center"
  },
  rowText: {
    flex: 1,
    gap: 3
  },
  value: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    letterSpacing: 0
  }
});
