// ─── /today/checkin — 2-question quick check-in ───────────────────────────

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { spacing } from "@/constants/tokens";
import { track } from "@/utils/analytics";
import { CheckinQuestion } from "@/features/daily-loop/components/CheckinQuestion";
import {
  MOOD_OPTIONS,
  NEED_OPTIONS,
  type DailyCheckinMood,
  type DailyCheckinNeed,
} from "@/features/daily-loop/data/checkin";
import { useDailyLoop } from "@/features/daily-loop/hooks/useDailyLoop";

export default function CheckinRoute() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { submitCheckin } = useDailyLoop();

  const [step, setStep] = useState<0 | 1>(0);
  const [mood, setMood] = useState<DailyCheckinMood | null>(null);

  useEffect(() => {
    track("daily_checkin_started");
  }, []);

  const handleMood = (m: DailyCheckinMood) => {
    setMood(m);
    setStep(1);
  };

  const handleNeed = async (n: DailyCheckinNeed) => {
    if (!mood) return;
    await submitCheckin({ mood, need: n });
    router.replace("/today/mission");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing[3],
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + spacing[4],
        },
      ]}
    >
      <View style={[styles.header, { paddingHorizontal: spacing[5] }]}>
        <Pressable
          onPress={() => (step === 0 ? router.back() : setStep(0))}
          hitSlop={12}
        >
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
      </View>

      {step === 0 && (
        <CheckinQuestion
          title="Como você chega hoje?"
          subtitle="Sem certo ou errado. É só um ponto de partida."
          options={MOOD_OPTIONS}
          onSelect={handleMood}
        />
      )}

      {step === 1 && (
        <CheckinQuestion
          title="O que mais te ajudaria hoje?"
          subtitle="Escolha o que parece mais útil agora."
          options={NEED_OPTIONS}
          onSelect={handleNeed}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: spacing[4],
  },
});
