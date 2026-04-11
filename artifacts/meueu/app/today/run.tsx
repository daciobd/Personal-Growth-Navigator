// ─── /today/run — Execute the mission steps ───────────────────────────────

import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import { MissionSteps } from "@/features/daily-loop/components/MissionSteps";
import { useDailyLoop } from "@/features/daily-loop/hooks/useDailyLoop";

export default function RunRoute() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { state, completeMission, loading } = useDailyLoop();

  if (loading || !state.currentMission) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  const mission = state.currentMission;

  const handleComplete = async () => {
    await completeMission();
    router.replace("/today/complete");
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

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingHorizontal: spacing[5] }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).duration(450)} style={styles.titleBlock}>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {mission.title}
          </Text>
          <Text
            style={[styles.intro, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
          >
            Sem pressa. Só siga um passo de cada vez.
          </Text>
        </Animated.View>

        <MissionSteps steps={mission.steps} />
      </ScrollView>

      <View style={[styles.footer, { paddingHorizontal: spacing[5] }]}>
        <Pressable
          onPress={handleComplete}
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
            Concluir missão
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
  scroll: { flex: 1 },
  content: { gap: spacing[5], paddingBottom: spacing[6] },
  titleBlock: { gap: spacing[2], paddingHorizontal: spacing[1] },
  title: { fontSize: 24, lineHeight: 32 },
  intro: { fontSize: 14, lineHeight: 20, fontStyle: "italic" },
  footer: { paddingTop: spacing[4] },
  primaryBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
  },
  primaryText: { fontSize: 17, color: "#fff" },
});
