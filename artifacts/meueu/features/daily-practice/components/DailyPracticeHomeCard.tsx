import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { radius, shadow, spacing } from "@/constants/tokens";
import { getExperimentVariant, type Variant } from "@/utils/experiments";
import {
  getDailyPracticeRecord,
  getDailyStatus,
  getStreakCopy,
  type DailyPracticeStatus,
} from "../hooks/useDailyPractice";

type CardState = {
  status: DailyPracticeStatus;
  streak: number;
  missedDay: boolean;
  resumeStepIndex: number | null;
  homeCta: Variant;
};

const HOME_CTA_VARIANTS: Record<Variant, { title: string; sub: string }> = {
  A: { title: "Hoje você continua", sub: "Leva menos de 2 minutos." },
  B: { title: "Só 2 minutos agora", sub: "É rápido e já conta." },
  C: { title: "Vamos fazer juntos", sub: "Eu te guio de novo." },
};

export function DailyPracticeHomeCard() {
  const colors = Colors.light;
  const [state, setState] = useState<CardState | null>(null);

  const loadState = async () => {
    const [status, record, homeCta] = await Promise.all([
      getDailyStatus(),
      getDailyPracticeRecord(),
      getExperimentVariant("home_cta"),
    ]);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    const lastDate = record.lastCompletedDate;
    const missedDay = !!lastDate && lastDate !== yesterday && lastDate !== today;
    setState({ ...status, missedDay, homeCta });
  };

  useEffect(() => { loadState(); }, []);

  // Re-check periodically (covers return from daily-practice screen)
  useEffect(() => {
    const interval = setInterval(loadState, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!state) return null;

  const handlePress = () => {
    if (state.status === "completed") return;
    router.push("/daily-practice");
  };

  // ─── Completed state ──────────────────────────────────────────────
  if (state.status === "completed") {
    const copy = getStreakCopy(state.streak, false);
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            borderWidth: 1.5,
            ...shadow.soft,
          },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
          <Feather name="check-circle" size={20} color={colors.primary} />
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            {copy.title}
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {copy.sub}
          </Text>
        </View>
        {state.streak > 1 && (
          <View style={[styles.streakBadge, { backgroundColor: colors.chip.default }]}>
            <Feather name="zap" size={12} color="#E8A838" />
            <Text style={[styles.streakText, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {state.streak}
            </Text>
          </View>
        )}
      </View>
    );
  }

  // ─── Not started / In progress ────────────────────────────────────
  const isResume = state.status === "in_progress";
  const ctaCopy = HOME_CTA_VARIANTS[state.homeCta];
  const missedCopy = state.missedDay
    ? { title: "Recomeçar também conta.", sub: "Leva menos de 2 minutos." }
    : null;

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.primary,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
          ...shadow.card,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
        <Feather name={isResume ? "play" : "sun"} size={20} color="#fff" />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
          {missedCopy?.title ?? (isResume ? "Continuar prática" : ctaCopy.title)}
        </Text>
        <Text style={[styles.sub, { color: "rgba(255,255,255,0.8)", fontFamily: "Inter_400Regular" }]}>
          {missedCopy?.sub ?? (isResume ? "Leva menos de 2 minutos." : ctaCopy.sub)}
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[4],
    borderRadius: radius.xl,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: { flex: 1, gap: 2 },
  title: { fontSize: 16, lineHeight: 22 },
  sub: { fontSize: 13, lineHeight: 18 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 100,
  },
  streakText: { fontSize: 12 },
});
