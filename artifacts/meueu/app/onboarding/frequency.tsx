import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const OPTIONS = [
  { key: "daily", label: "Quase todo dia", icon: "sun" },
  { key: "weekly", label: "Algumas vezes na semana", icon: "calendar" },
  { key: "rarely", label: "Raramente", icon: "moon" },
] as const;

export default function FrequencyScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const navigating = useRef(false);

  const handleSelect = async (key: string) => {
    if (navigating.current) return;
    navigating.current = true;
    setSelectedKey(key);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    track("onboarding_frequency_selected", { frequency: key });
    await AsyncStorage.setItem("@meueu_onboarding_frequency", key);
    setTimeout(() => router.push("/onboarding/commitment"), 280);
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
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  {
                    backgroundColor: i <= 1 ? colors.primary : colors.cardBorder,
                    width: i === 1 ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Com que frequência isso costuma acontecer?
        </Text>
      </Animated.View>

      <View style={[styles.options, { paddingHorizontal: spacing[5] }]}>
        {OPTIONS.map((option, i) => {
          const isSelected = selectedKey === option.key;
          return (
            <Animated.View key={option.key} entering={FadeInDown.delay(100 + i * 80).duration(450)}>
              <Pressable
                onPress={() => handleSelect(option.key)}
                disabled={!!selectedKey}
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
  dots: { flexDirection: "row", alignItems: "center", gap: spacing[1] },
  dot: { height: 6, borderRadius: 3 },
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
