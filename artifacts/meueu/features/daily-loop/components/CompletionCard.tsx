// ─── CompletionCard — Post-mission celebratory state ──────────────────────

import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import type { DailyMissionCategory } from "../data/missions";

const MESSAGES_BY_CATEGORY: Record<DailyMissionCategory, string> = {
  action: "Você criou movimento.",
  reflection: "Você trouxe um pouco mais de clareza.",
  alternative: "Você escolheu continuar.",
};

type Props = {
  category: DailyMissionCategory;
  xpGained: number;
  streak: number;
};

export function CompletionCard({ category, xpGained, streak }: Props) {
  const colors = Colors.light;
  const message = MESSAGES_BY_CATEGORY[category];

  return (
    <View style={styles.container}>
      <Animated.View
        entering={FadeInDown.delay(80).duration(450)}
        style={styles.iconWrap}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Feather name="check" size={32} color="#fff" />
        </View>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(180).duration(400)}
        style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}
      >
        Missão concluída
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(260).duration(400)}
        style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
      >
        Hoje você não ficou parado.
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(340).duration(400)}
        style={[styles.message, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
      >
        {message}
      </Animated.Text>

      {/* Secondary reinforcement — small, not the focus */}
      <Animated.View
        entering={FadeInDown.delay(440).duration(400)}
        style={styles.feedbackRow}
      >
        <View style={[styles.pill, { backgroundColor: colors.chip.default }]}>
          <Feather name="zap" size={12} color="#E8A838" />
          <Text style={[styles.pillText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {streak} {streak === 1 ? "dia" : "dias"}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: colors.chip.default }]}>
          <Text style={[styles.pillText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            +{xpGained} XP
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[8],
    gap: spacing[3],
  },
  iconWrap: { marginBottom: spacing[3] },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, lineHeight: 36, textAlign: "center" },
  subtitle: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  message: { fontSize: 14, lineHeight: 20, textAlign: "center", fontStyle: "italic", marginTop: spacing[2] },
  feedbackRow: {
    flexDirection: "row",
    gap: spacing[2],
    marginTop: spacing[5],
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  pillText: { fontSize: 13 },
});
