// ─── MissionSteps — Static numbered list, no progress bar ─────────────────

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";

type Props = {
  steps: string[];
};

export function MissionSteps({ steps }: Props) {
  const colors = Colors.light;

  return (
    <View style={styles.container}>
      {steps.map((step, idx) => (
        <Animated.View
          key={idx}
          entering={FadeInDown.delay(80 + idx * 80).duration(400)}
          style={[
            styles.row,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={[styles.numCircle, { backgroundColor: colors.chip.default }]}>
            <Text style={[styles.numText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {idx + 1}
            </Text>
          </View>
          <Text
            style={[styles.stepText, { color: colors.text, fontFamily: "Inter_400Regular" }]}
          >
            {step}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing[3] },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  numCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  numText: { fontSize: 13 },
  stepText: { flex: 1, fontSize: 15, lineHeight: 22 },
});
