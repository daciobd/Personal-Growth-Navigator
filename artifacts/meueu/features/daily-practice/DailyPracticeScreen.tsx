import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import { GuidedPracticeFooter } from "@/features/guided-practice/components/GuidedPracticeFooter";
import { GuidedPracticeProgress } from "@/features/guided-practice/components/GuidedPracticeProgress";
import type { GuidedStep } from "@/features/guided-practice/data/guidedSteps";
import {
  getDailyPracticeRecord,
  getStreakCopy,
  useDailyPractice,
} from "./hooks/useDailyPractice";

type Props = {
  steps: GuidedStep[];
  resumeStep?: number | null;
};

export default function DailyPracticeScreen({ steps, resumeStep }: Props) {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const {
    step,
    stepIndex,
    isCompletion,
    practiceSteps,
    advance,
  } = useDailyPractice(steps, resumeStep);

  // Load streak info for completion feedback
  const [streakInfo, setStreakInfo] = useState<{ streak: number; missedDay: boolean } | null>(null);

  useEffect(() => {
    getDailyPracticeRecord().then((record) => {
      const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      const lastDate = record.lastCompletedDate;
      const missedDay = !!lastDate && lastDate !== yesterday && lastDate !== today;
      setStreakInfo({ streak: record.currentStreak, missedDay });
    });
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[4],
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + spacing[4],
        },
      ]}
    >
      {!isCompletion && (
        <GuidedPracticeProgress current={stepIndex} total={practiceSteps} />
      )}

      <Animated.View
        key={stepIndex}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(150)}
        style={styles.body}
      >
        {isCompletion ? (
          <CompletionView streakInfo={streakInfo} />
        ) : (
          <>
            <Animated.Text
              entering={FadeInDown.delay(80).duration(400)}
              style={[styles.mainText, { color: colors.text, fontFamily: "Inter_700Bold" }]}
            >
              {step.text}
            </Animated.Text>

            {step.helper && (
              <Animated.Text
                entering={FadeInDown.delay(220).duration(400)}
                style={[styles.helper, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
              >
                {step.helper}
              </Animated.Text>
            )}
          </>
        )}
      </Animated.View>

      <GuidedPracticeFooter
        ctaLabel={step.cta}
        onPressPrimary={advance}
      />
    </View>
  );
}

// ─── Completion View ────────────────────────────────────────────────────────

function CompletionView({ streakInfo }: { streakInfo: { streak: number; missedDay: boolean } | null }) {
  const colors = Colors.light;
  const copy = streakInfo
    ? getStreakCopy(streakInfo.streak, streakInfo.missedDay)
    : { title: "Você apareceu hoje.", sub: "" };

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(80).duration(450)}
        style={styles.iconWrap}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Feather name="check" size={28} color="#fff" />
        </View>
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(180).duration(400)}
        style={[styles.mainText, { color: colors.text, fontFamily: "Inter_700Bold" }]}
      >
        Você apareceu hoje.
      </Animated.Text>

      <Animated.Text
        entering={FadeInDown.delay(280).duration(400)}
        style={[styles.helper, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
      >
        Pequeno, mas consistente.
      </Animated.Text>

      {/* Streak + XP — secondary reinforcement, not the main message */}
      <Animated.View
        entering={FadeInDown.delay(450).duration(400)}
        style={styles.feedbackRow}
      >
        <View style={[styles.feedbackPill, { backgroundColor: colors.chip.default }]}>
          <Feather name="zap" size={12} color="#E8A838" />
          <Text style={[styles.feedbackText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {copy.sub || copy.title}
          </Text>
        </View>
        <View style={[styles.feedbackPill, { backgroundColor: colors.chip.default }]}>
          <Text style={[styles.feedbackText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            +15 XP
          </Text>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[8],
    gap: spacing[4],
  },
  iconWrap: {
    marginBottom: spacing[1],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    fontSize: 26,
    lineHeight: 34,
    textAlign: "center",
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
  feedbackRow: {
    flexDirection: "row",
    gap: spacing[2],
    marginTop: spacing[4],
  },
  feedbackPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.sm,
  },
  feedbackText: {
    fontSize: 13,
  },
});
