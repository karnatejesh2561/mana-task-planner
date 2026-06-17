import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../theme/ThemeProvider";

type SegmentedControlProps<T extends string> = {
  options: T[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.line }]}>
      {options.map((option) => {
        const active = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.item, { backgroundColor: active ? colors.surface : "transparent", shadowColor: active ? colors.accent : "transparent" }]}
          >
            <Text style={[styles.text, { color: active ? colors.text : colors.muted }]} numberOfLines={1}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderRadius: 22,
    borderWidth: 1,
    padding: 4,
    gap: 4
  },
  item: {
    flex: 1,
    minHeight: 38,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2
  },
  text: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0
  }
});
