// ─── /today/complete — Post-mission celebration ──────────────────────────

import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import { CompletionCard } from "@/features/daily-loop/components/CompletionCard";
import { useDailyLoop } from "@/features/daily-loop/hooks/useDailyLoop";

export default function CompleteRoute() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { state, loading } = useDailyLoop();

  if (loading) return <View style={[styles.container, { backgroundColor: colors.background }]} />;

  const mission = state.currentMission;
  // Default to "reflection" if mission missing — defensive only
  const category = mission?.category ?? "reflection";
  const xpGained = mission?.rewardXp ?? 0;

  const handleClose = () => {
    try {
      router.dismissAll();
    } catch {}
    router.replace("/(tabs)");
  };

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
      <CompletionCard
        category={category}
        xpGained={xpGained}
        streak={state.streak || 1}
      />

      <View style={[styles.footer, { paddingHorizontal: spacing[6] }]}>
        <Pressable
          onPress={handleClose}
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
            Fechar por hoje
          </Text>
        </Pressable>

        <Text
          style={[styles.returnHint, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
        >
          Volte amanhã para o próximo passo.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: { gap: spacing[3], paddingTop: spacing[4] },
  primaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
  },
  primaryText: { fontSize: 17, color: "#fff" },
  returnHint: { fontSize: 13, textAlign: "center" },
});
