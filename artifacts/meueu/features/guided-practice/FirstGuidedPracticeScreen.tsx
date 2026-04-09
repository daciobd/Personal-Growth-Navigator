import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { spacing } from "@/constants/tokens";
import { useGuidedPractice } from "./hooks/useGuidedPractice";
import { GuidedPracticeFooter } from "./components/GuidedPracticeFooter";
import { GuidedPracticeProgress } from "./components/GuidedPracticeProgress";
import { GuidedPracticeStepCard } from "./components/GuidedPracticeStepCard";

export default function FirstGuidedPracticeScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const {
    step,
    stepIndex,
    isIntro,
    isLast,
    practiceIndex,
    practiceSteps,
    advance,
    replay,
  } = useGuidedPractice();

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
      {!isIntro && (
        <GuidedPracticeProgress current={practiceIndex} total={practiceSteps} />
      )}

      <Animated.View
        key={stepIndex}
        entering={FadeIn.duration(300)}
        exiting={FadeOut.duration(150)}
        style={styles.body}
      >
        <GuidedPracticeStepCard step={step} />
      </Animated.View>

      <GuidedPracticeFooter
        ctaLabel={step.cta}
        secondaryCtaLabel={isLast ? step.secondaryCta : undefined}
        onPressPrimary={advance}
        onPressSecondary={isLast ? replay : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing[8],
  },
});
