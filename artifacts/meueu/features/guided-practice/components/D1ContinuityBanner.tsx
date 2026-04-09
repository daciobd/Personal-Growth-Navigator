import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import { getGuidedPracticeRecord } from "../hooks/useGuidedPractice";

type Props = {
  onDismiss?: () => void;
};

/**
 * Shows a continuity message on the day after the user completed
 * the first guided practice. Visible only during the first week.
 */
export function D1ContinuityBanner({ onDismiss }: Props) {
  const colors = Colors.light;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getGuidedPracticeRecord().then((record) => {
      if (!record.completed || !record.completedAt) return;

      const completedDate = new Date(record.completedAt);
      const now = new Date();

      // Days since completion (using date-only comparison)
      const completedDay = completedDate.toISOString().split("T")[0];
      const today = now.toISOString().split("T")[0];
      const msPerDay = 86_400_000;
      const daysDiff = Math.floor(
        (new Date(today).getTime() - new Date(completedDay).getTime()) / msPerDay
      );

      // Show on D1 through D6 (first week after completion, not on completion day)
      if (daysDiff >= 1 && daysDiff <= 6) {
        setVisible(true);
      }
    });
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(200).duration(400)}
      exiting={FadeOut.duration(200)}
    >
      <View style={[styles.container, { backgroundColor: colors.primary }]}>
        <View style={styles.content}>
          <Text style={[styles.text, { fontFamily: "Inter_500Medium" }]}>
            Ontem você fez pela primeira vez.{"\n"}
            Hoje vai parecer ainda mais natural.
          </Text>
        </View>
        <Pressable onPress={handleDismiss} hitSlop={12} style={styles.close}>
          <Feather name="x" size={16} color="rgba(255,255,255,0.6)" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    padding: spacing[4],
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  content: { flex: 1 },
  text: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 21,
  },
  close: {
    padding: spacing[1],
  },
});
