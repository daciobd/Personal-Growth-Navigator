// ─── /today/mission — Preview the chosen mission ──────────────────────────

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import { track } from "@/utils/analytics";
import { MissionCard } from "@/features/daily-loop/components/MissionCard";
import { useDailyLoop } from "@/features/daily-loop/hooks/useDailyLoop";
import { MISSION_LIBRARY, type DailyMission } from "@/features/daily-loop/data/missions";

const REASON_BY_MOOD: Record<string, string> = {
  stuck: "Sem resolver tudo. Só sair do zero.",
  motivated: "Você chegou com gás. Vamos canalizar.",
  confused: "Antes de agir, entender ajuda.",
  anxious: "Hoje o foco não é cobrança. É presença.",
  tired: "Algo leve, do tamanho do seu dia.",
  calm: "Um espaço pequeno pra organizar.",
};

export default function MissionRoute() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { state, swapMission, startMission, skipMission, loading } = useDailyLoop();

  useEffect(() => {
    if (state.currentMission) {
      track("daily_mission_viewed", {
        mission_id: state.currentMission.id,
        category: state.currentMission.category,
        difficulty: state.currentMission.difficulty,
        mood: state.currentCheckin?.mood,
        need: state.currentCheckin?.need,
      });
    }
  }, [state.currentMission?.id]);

  if (loading || !state.currentMission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} />
    );
  }

  const mission = state.currentMission;
  const reason = state.currentCheckin
    ? REASON_BY_MOOD[state.currentCheckin.mood]
    : undefined;

  const handleSwap = async () => {
    // Pick a different mission of the same category
    const alternatives = MISSION_LIBRARY.filter(
      (m) => m.category === mission.category && m.id !== mission.id
    );
    let next: DailyMission;
    if (alternatives.length > 0) {
      next = alternatives[0];
    } else {
      // Fallback: any other mission
      next = MISSION_LIBRARY.find((m) => m.id !== mission.id) ?? mission;
    }
    await swapMission(next);
  };

  const handleStart = async () => {
    // startMission() persists status="in_progress" + startedAt and fires
    // daily_mission_started internally — single source of truth.
    await startMission();
    router.push("/today/run");
  };

  const handleSkip = async () => {
    await skipMission();
    try { router.dismissAll(); } catch {}
    router.replace("/(tabs)");
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
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={[styles.content, { paddingHorizontal: spacing[5] }]}>
        <Animated.View entering={FadeInDown.delay(50).duration(450)} style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Missão de hoje
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
          >
            Escolhida com base em como você está agora.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(450)}>
          <MissionCard mission={mission} reasonCopy={reason} />
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingHorizontal: spacing[5] }]}>
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.primaryText, { fontFamily: "Inter_600SemiBold" }]}>
            Fazer missão
          </Text>
        </Pressable>

        <Pressable onPress={handleSwap} style={styles.secondaryBtn}>
          <Text
            style={[styles.secondaryText, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}
          >
            Quero outra opção
          </Text>
        </Pressable>

        <Pressable onPress={handleSkip} style={styles.tertiaryBtn}>
          <Text
            style={[styles.tertiaryText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
          >
            Pular hoje
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: spacing[3],
  },
  content: { flex: 1, gap: spacing[5] },
  titleBlock: { gap: spacing[1], paddingHorizontal: spacing[1] },
  title: { fontSize: 26, lineHeight: 32 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  footer: { gap: spacing[2], paddingTop: spacing[4] },
  primaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
  },
  primaryText: { fontSize: 17, color: "#fff" },
  secondaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[3],
  },
  secondaryText: { fontSize: 14 },
  tertiaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[2],
  },
  tertiaryText: { fontSize: 13 },
});
