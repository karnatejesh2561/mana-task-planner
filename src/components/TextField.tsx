import { ReactNode } from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

import { useAppTheme } from "../theme/ThemeProvider";

type TextFieldProps = TextInputProps & {
  icon?: ReactNode;
};

export function TextField({ icon, style, placeholderTextColor, ...props }: TextFieldProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.line, shadowColor: colors.shadow }]}>
      {icon}
      <TextInput
        placeholderTextColor={placeholderTextColor ?? colors.muted}
        style={[styles.input, { color: colors.text }, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 54,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0
  }
});
