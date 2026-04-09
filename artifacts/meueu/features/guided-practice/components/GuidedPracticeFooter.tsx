import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";

type Props = {
  ctaLabel: string;
  secondaryCtaLabel?: string;
  onPressPrimary: () => void;
  onPressSecondary?: () => void;
};

export function GuidedPracticeFooter({
  ctaLabel,
  secondaryCtaLabel,
  onPressPrimary,
  onPressSecondary,
}: Props) {
  const colors = Colors.light;

  const handlePrimary = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPressPrimary();
  };

  const handleSecondary = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPressSecondary?.();
  };

  return (
    <View style={[styles.container, { paddingHorizontal: spacing[6] }]}>
      <Pressable
        onPress={handlePrimary}
        style={({ pressed }) => [
          styles.primaryButton,
          {
            backgroundColor: colors.primary,
            opacity: pressed ? 0.88 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text style={[styles.primaryText, { fontFamily: "Inter_600SemiBold" }]}>
          {ctaLabel}
        </Text>
      </Pressable>

      {secondaryCtaLabel && onPressSecondary && (
        <Pressable onPress={handleSecondary} style={styles.secondaryButton}>
          <Text
            style={[
              styles.secondaryText,
              { color: colors.textMuted, fontFamily: "Inter_500Medium" },
            ]}
          >
            {secondaryCtaLabel}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[3],
    paddingTop: spacing[4],
  },
  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
  },
  primaryText: {
    fontSize: 17,
    color: "#fff",
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[3],
  },
  secondaryText: {
    fontSize: 15,
  },
});
