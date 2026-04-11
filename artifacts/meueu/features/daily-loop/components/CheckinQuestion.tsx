// ─── CheckinQuestion — One question with vertical option list ─────────────

import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { radius, shadow, spacing } from "@/constants/tokens";
import type { CheckinOption } from "../data/checkin";

type Props<T extends string> = {
  title: string;
  subtitle?: string;
  options: CheckinOption<T>[];
  onSelect: (id: T) => void;
};

export function CheckinQuestion<T extends string>({
  title,
  subtitle,
  options,
  onSelect,
}: Props<T>) {
  const colors = Colors.light;

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.delay(50).duration(450)} style={styles.header}>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
          >
            {subtitle}
          </Text>
        )}
      </Animated.View>

      <View style={styles.options}>
        {options.map((option, i) => (
          <Animated.View
            key={option.id}
            entering={FadeInDown.delay(120 + i * 50).duration(400)}
          >
            <Pressable
              onPress={() => onSelect(option.id)}
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
              <View style={[styles.iconBox, { backgroundColor: colors.chip.default }]}>
                <Feather name={option.icon as any} size={18} color={colors.primary} />
              </View>
              <Text
                style={[styles.label, { color: colors.text, fontFamily: "Inter_500Medium" }]}
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
  container: {
    flex: 1,
    paddingHorizontal: spacing[5],
    gap: spacing[5],
  },
  header: {
    gap: spacing[2],
    paddingHorizontal: spacing[2],
    marginBottom: spacing[2],
  },
  title: { fontSize: 26, lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  options: { gap: spacing[3] },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[4],
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { flex: 1, fontSize: 16, lineHeight: 22 },
});
