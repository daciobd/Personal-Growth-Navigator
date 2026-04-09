import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import { track } from "@/utils/analytics";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, shadow, spacing } from "@/constants/tokens";
import { useApp } from "@/context/AppContext";
import { PRIMARY_OPTIONS, type PrimaryOption } from "@/data/adaptive-onboarding";

export default function CurrentPrimaryIssueScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { setAdaptivePrimary } = useApp();

  const handleSelect = (option: PrimaryOption) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    track("onboarding_primary_struggle_selected", { struggle: option.id });
    setAdaptivePrimary(option.id);
    router.push("/onboarding/current_deep_dive");
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
      <Animated.View
        entering={FadeInDown.delay(50).duration(500)}
        style={[styles.header, { paddingHorizontal: spacing[6] }]}
      >
        <View style={styles.stepRow}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.stepLabel, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
            Passo 2 de 5
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          O que está mais difícil para você hoje?
        </Text>
      </Animated.View>

      <View style={[styles.options, { paddingHorizontal: spacing[5] }]}>
        {PRIMARY_OPTIONS.map((option, i) => (
          <Animated.View key={option.id} entering={FadeInDown.delay(100 + i * 60).duration(450)}>
            <Pressable
              onPress={() => handleSelect(option)}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  ...shadow.soft,
                  opacity: pressed ? 0.88 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
            >
              <View style={[styles.optionIcon, { backgroundColor: colors.chip.default }]}>
                <Feather name={option.icon as any} size={18} color={colors.primary} />
              </View>
              <Text
                style={[styles.optionLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}
              >
                {option.label}
              </Text>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { gap: spacing[5], marginBottom: spacing[6] },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepLabel: { fontSize: 13 },
  title: { fontSize: 28, lineHeight: 36 },
  options: { gap: spacing[3], flex: 1, justifyContent: "center" },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { flex: 1, fontSize: 16, lineHeight: 22 },
});
