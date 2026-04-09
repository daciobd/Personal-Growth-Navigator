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
import {
  FREQUENCY_OPTIONS,
  inferTags,
  type FrequencyOption,
} from "@/data/adaptive-onboarding";

export default function AdaptiveFrequencyScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { adaptiveDraft, setAdaptiveProfile } = useApp();

  const handleSelect = (option: FrequencyOption) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { primaryStruggle, deepDiveAnswer } = adaptiveDraft;

    if (!primaryStruggle || !deepDiveAnswer) {
      router.back();
      return;
    }

    const frequency = option.id;
    const inferredTags = inferTags(primaryStruggle, deepDiveAnswer, frequency);

    track("onboarding_adaptive_complete", {
      primary: primaryStruggle,
      deepDive: deepDiveAnswer,
      frequency,
      tags: inferredTags,
    });

    setAdaptiveProfile({
      primaryStruggle,
      deepDiveAnswer,
      patternFrequency: frequency,
      inferredTags,
    });

    router.push("/onboarding/future");
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
          Com que frequência isso acontece?
        </Text>
      </Animated.View>

      <View style={[styles.options, { paddingHorizontal: spacing[5] }]}>
        {FREQUENCY_OPTIONS.map((option, i) => (
          <Animated.View key={option.id} entering={FadeInDown.delay(100 + i * 80).duration(450)}>
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
                <Feather name={option.icon as any} size={20} color={colors.primary} />
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
  header: { gap: spacing[5], marginBottom: spacing[8] },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepLabel: { fontSize: 13 },
  title: { fontSize: 28, lineHeight: 36 },
  options: { gap: spacing[4], flex: 1, justifyContent: "center" },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLabel: { flex: 1, fontSize: 17, lineHeight: 24 },
});
