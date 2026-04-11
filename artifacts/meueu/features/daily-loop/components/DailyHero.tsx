// ─── DailyHero — Home card with all 4 states ──────────────────────────────
// A: before checkin → "Sua missão de hoje" + Começar
// B: after checkin → personalized mission card + Fazer
// C: completed → muted, encouraging message
// D: returning → soft welcome back, no guilt

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { radius, shadow, spacing } from "@/constants/tokens";
import { useDailyLoop } from "../hooks/useDailyLoop";

export function DailyHero() {
  const colors = Colors.light;
  const { state, loading } = useDailyLoop();

  if (loading) return null;

  // ─── State C2: Skipped (muted, no guilt) ──────────────────────────
  if (state.hasSkippedToday) {
    return (
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderWidth: 1,
            ...shadow.soft,
          },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.chip.default }]}>
          <Feather name="moon" size={20} color={colors.textMuted} />
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Você pulou hoje
          </Text>
          <Text style={[styles.sub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Tudo bem. Amanhã tem outra.
          </Text>
        </View>
      </View>
    );
  }

  // ─── State C: Completed ────────────────────────────────────────────
  if (state.hasCompletedMissionToday) {
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
            Missão de hoje concluída
          </Text>
          <Text style={[styles.sub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Volte amanhã para o próximo passo.
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

  // ─── State D: Returning user (no guilt) ────────────────────────────
  const returningCopy = state.isReturning
    ? {
        title: "Tudo bem.",
        sub: "Hoje é um bom dia para retomar.",
      }
    : null;

  // ─── State B: Already checked in → personalized mission ────────────
  if (state.hasCheckedInToday && state.currentMission) {
    const mission = state.currentMission;
    return (
      <Pressable
        onPress={() => router.push("/today/mission")}
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
          <Feather name="play" size={20} color="#fff" />
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
            {mission.title}
          </Text>
          <Text style={[styles.sub, { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular" }]}>
            {mission.durationMin} min · {mission.subtitle}
          </Text>
        </View>
        <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.6)" />
      </Pressable>
    );
  }

  // ─── State A: Before checkin (default) ─────────────────────────────
  const title = returningCopy?.title ?? "Sua missão de hoje";
  const sub = returningCopy?.sub ?? "Um passo pequeno, mas real.";

  return (
    <Pressable
      onPress={() => router.push("/today/checkin")}
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
        <Feather name="sun" size={20} color="#fff" />
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.title, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
          {title}
        </Text>
        <Text style={[styles.sub, { color: "rgba(255,255,255,0.85)", fontFamily: "Inter_400Regular" }]}>
          {sub}
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
