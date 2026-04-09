import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";
import type { GuidedStep } from "@/features/guided-practice/data/guidedSteps";
import DailyPracticeScreen from "@/features/daily-practice/DailyPracticeScreen";
import {
  getDailyStatus,
  getDayNumber,
} from "@/features/daily-practice/hooks/useDailyPractice";
import { getDailySteps } from "@/features/daily-practice/data/dailyPractices";
import { getExperimentVariant } from "@/utils/experiments";

export default function DailyPracticeRoute() {
  const colors = Colors.light;
  const [ready, setReady] = useState(false);
  const [steps, setSteps] = useState<GuidedStep[]>([]);
  const [resumeStep, setResumeStep] = useState<number | null>(null);

  useEffect(() => {
    async function init() {
      const [day, status] = await Promise.all([
        getDayNumber(),
        getDailyStatus(),
      ]);
      const resolvedSteps = await getDailySteps(day);

      // Apply completion_copy experiment to the completion step (last)
      const completionVariant = await getExperimentVariant("completion_copy");
      const COMPLETION_TITLES: Record<string, string> = {
        A: "Você apareceu hoje.",
        B: "Você fez hoje.",
        C: "Isso já conta.",
      };
      const finalSteps = resolvedSteps.map((s, i) =>
        i === resolvedSteps.length - 1
          ? { ...s, text: COMPLETION_TITLES[completionVariant] ?? s.text }
          : s
      );

      setSteps(finalSteps);
      setResumeStep(status.resumeStepIndex);
      setReady(true);
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return <DailyPracticeScreen steps={steps} resumeStep={resumeStep} />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
