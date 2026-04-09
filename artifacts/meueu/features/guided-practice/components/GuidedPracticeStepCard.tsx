import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import Colors from "@/constants/colors";
import { spacing } from "@/constants/tokens";
import { TOTAL_STEPS, type GuidedStep } from "../data/guidedSteps";

type Props = {
  step: GuidedStep;
};

export function GuidedPracticeStepCard({ step }: Props) {
  const colors = Colors.light;
  const isIntro = step.id === 0;
  const isClosing = step.id === TOTAL_STEPS - 1;
  const showIcon = isIntro || isClosing;

  return (
    <View style={styles.container}>
      {showIcon && (
        <Animated.View
          entering={FadeInDown.delay(80).duration(450)}
          style={styles.iconWrap}
        >
          <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
            <Feather
              name={isClosing ? "check" : "play"}
              size={28}
              color="#fff"
            />
          </View>
        </Animated.View>
      )}

      <Animated.Text
        entering={FadeInDown.delay(showIcon ? 180 : 80).duration(400)}
        style={[styles.mainText, { color: colors.text, fontFamily: "Inter_700Bold" }]}
      >
        {step.text}
      </Animated.Text>

      {step.subtitle && (
        <Animated.Text
          entering={FadeInDown.delay(280).duration(400)}
          style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
        >
          {step.subtitle}
        </Animated.Text>
      )}

      {step.helper && (
        <Animated.Text
          entering={FadeInDown.delay(step.subtitle ? 380 : 220).duration(400)}
          style={[styles.helper, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}
        >
          {step.helper}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: spacing[4],
  },
  iconWrap: {
    marginBottom: spacing[1],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  mainText: {
    fontSize: 26,
    lineHeight: 34,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  helper: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    fontStyle: "italic",
  },
});
