import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type Props = {
  days: number;
};

export function StreakBadge({ days }: Props) {
  const colors = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: colors.chip.default }]}>
      <Feather name="zap" size={13} color={colors.accent} />
      <Text
        style={[
          styles.text,
          { color: colors.text, fontFamily: "Inter_600SemiBold" },
        ]}
      >
        {days}
      </Text>
      <Text
        style={[
          styles.label,
          { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
        ]}
      >
        {days === 1 ? "dia" : "dias"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  text: {
    fontSize: 13,
  },
  label: {
    fontSize: 13,
  },
});
