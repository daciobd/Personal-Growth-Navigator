import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigating = useRef(false);

  const handleSelect = (option: FrequencyOption) => {
    if (navigating.current) return;

    const { primaryStruggle, deepDiveAnswer } = adaptiveDraft;
    if (!primaryStruggle || !deepDiveAnswer) {
      router.back();
      return;
    }

    navigating.current = true;
    setSelectedId(option.id);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    setTimeout(() => router.push("/onboarding/future"), 280);
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
          Com que frequência isso costuma acontecer?
        </Text>
      </Animated.View>

      <View style={[styles.options, { paddingHorizontal: spacing[5] }]}>
        {FREQUENCY_OPTIONS.map((option, i) => {
          const isSelected = selectedId === option.id;
          return (
            <Animated.View key={option.id} entering={FadeInDown.delay(100 + i * 80).duration(450)}>
              <Pressable
                onPress={() => handleSelect(option)}
                disabled={!!selectedId}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.card,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                    ...shadow.soft,
                    opacity: pressed && !isSelected ? 0.88 : 1,
                    transform: [{ scale: pressed && !isSelected ? 0.98 : 1 }],
                  },
                ]}
              >
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor: isSelected
                        ? "rgba(255,255,255,0.2)"
                        : colors.chip.default,
                    },
                  ]}
                >
                  <Feather
                    name={isSelected ? "check" : (option.icon as any)}
                    size={20}
                    color={isSelected ? "#fff" : colors.primary}
                  />
                </View>
                <Text
                  style={[
                    styles.optionLabel,
                    {
                      color: isSelected ? "#fff" : colors.text,
                      fontFamily: "Inter_500Medium",
                    },
                  ]}
                >
                  {option.label}
                </Text>
                <Feather
                  name={isSelected ? "check-circle" : "chevron-right"}
                  size={16}
                  color={isSelected ? "rgba(255,255,255,0.7)" : colors.textMuted}
                />
              </Pressable>
            </Animated.View>
          );
        })}
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
