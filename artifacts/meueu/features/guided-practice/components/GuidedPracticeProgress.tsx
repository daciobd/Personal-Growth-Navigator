import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { spacing } from "@/constants/tokens";

type Props = {
  current: number;
  total: number;
};

export function GuidedPracticeProgress({ current, total }: Props) {
  const colors = Colors.light;

  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i <= current ? colors.primary : colors.cardBorder,
                width: i === current ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.label, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
        Passo {current + 1} de {total}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[6],
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  label: { fontSize: 13 },
});
