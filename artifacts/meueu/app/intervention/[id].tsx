import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { INTERVENTIONS, THERAPY_COLORS } from "@/data/interventions";

export default function InterventionScreen() {
  const { id, practice: practiceParam } = useLocalSearchParams<{ id: string; practice?: string }>();
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { markInterventionViewed, profile } = useApp();

  // Support plan practices (passed as JSON param) or static interventions
  const planPractice = practiceParam ? (() => {
    try { return JSON.parse(practiceParam); } catch { return null; }
  })() : null;

  const builtInIntervention = INTERVENTIONS.find((i) => i.id === id);

  const intervention = builtInIntervention ?? (planPractice ? {
    id: id ?? "plan",
    therapy: planPractice.abordagem as any,
    title: planPractice.nome,
    description: planPractice.justificativa,
    steps: planPractice.passos ?? [],
    duration: planPractice.frequencia,
    fromAdjectives: [],
    toAdjectives: [],
    icon: "activity",
  } : null);

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(
    profile.interventionsViewed.includes(id ?? "")
  );

  if (!intervention) {
    return (
      <View style={styles.notFound}>
        <Text style={{ color: colors.text, fontFamily: "Inter_400Regular" }}>
          Prática não encontrada
        </Text>
      </View>
    );
  }

  const therapyColor = (intervention.therapy && THERAPY_COLORS[intervention.therapy as keyof typeof THERAPY_COLORS]) ?? { bg: "#F5F5F5", text: "#333" };
  const isLastStep = currentStep === intervention.steps.length - 1;

  const handleNext = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (isLastStep) {
      markInterventionViewed(intervention.id);
      setCompleted(true);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  if (completed) {
    return (
      <View
        style={[
          styles.completedContainer,
          {
            backgroundColor: colors.background,
            paddingTop: insets.top,
            paddingBottom: Platform.OS === "web" ? 70 : insets.bottom,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { top: insets.top + 16 }]}
        >
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.completedContent}>
          <View
            style={[styles.completedIcon, { backgroundColor: colors.primary }]}
          >
            <Feather name="check" size={36} color="#fff" />
          </View>
          <Text
            style={[
              styles.completedTitle,
              { color: colors.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            Prática concluída!
          </Text>
          <Text
            style={[
              styles.completedSub,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            Cada pequeno passo conta na sua jornada de transformação.
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.doneButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Text
              style={[
                styles.doneButtonText,
                { color: "#fff", fontFamily: "Inter_600SemiBold" },
              ]}
            >
              Voltar ao início
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: Platform.OS === "web" ? 70 : insets.bottom,
        },
      ]}
    >
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.backBtn2}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={[styles.therapyBadge, { backgroundColor: therapyColor.bg }]}>
          <Text
            style={[
              styles.therapyText,
              { color: therapyColor.text, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {intervention.therapy}
          </Text>
        </View>
        <View style={styles.clockRow}>
          <Feather name="clock" size={13} color={colors.textMuted} />
          <Text
            style={[
              styles.clockText,
              { color: colors.textMuted, fontFamily: "Inter_400Regular" },
            ]}
          >
            {intervention.duration}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: "Inter_700Bold" },
          ]}
        >
          {intervention.title}
        </Text>
        <Text
          style={[
            styles.description,
            { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
          ]}
        >
          {intervention.description}
        </Text>

        <View style={styles.stepsProgress}>
          {intervention.steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    i <= currentStep ? colors.primary : colors.chip.default,
                  width: i === currentStep ? 20 : 6,
                },
              ]}
            />
          ))}
        </View>

        <Animated.View
          key={currentStep}
          entering={FadeInDown.duration(300)}
          style={[
            styles.stepCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.stepHeader}>
            <View
              style={[
                styles.stepNumber,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.stepNumberText,
                  { fontFamily: "Inter_700Bold" },
                ]}
              >
                {currentStep + 1}
              </Text>
            </View>
            <Text
              style={[
                styles.stepOf,
                { color: colors.textMuted, fontFamily: "Inter_400Regular" },
              ]}
            >
              de {intervention.steps.length}
            </Text>
          </View>
          <Text
            style={[
              styles.stepText,
              { color: colors.text, fontFamily: "Inter_500Medium" },
            ]}
          >
            {intervention.steps[currentStep]}
          </Text>
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 0 ? (
          <Pressable
            onPress={handlePrev}
            style={({ pressed }) => [
              styles.prevButton,
              {
                backgroundColor: colors.chip.default,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <View style={{ width: 52 }} />
        )}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text
            style={[
              styles.nextText,
              { color: "#fff", fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {isLastStep ? "Concluir" : "Próximo"}
          </Text>
          <Feather
            name={isLastStep ? "check" : "arrow-right"}
            size={18}
            color="#fff"
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  backBtn: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  backBtn2: {
    padding: 4,
  },
  therapyBadge: {
    flex: 1,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  therapyText: {
    fontSize: 12,
  },
  clockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  clockText: {
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
  },
  stepsProgress: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
  },
  stepCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    gap: 16,
    minHeight: 160,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 14,
  },
  stepOf: {
    fontSize: 13,
  },
  stepText: {
    fontSize: 18,
    lineHeight: 28,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  prevButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
  },
  nextText: {
    fontSize: 16,
  },
  completedContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  completedContent: {
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 32,
  },
  completedIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 26,
    textAlign: "center",
  },
  completedSub: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  doneButton: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 16,
  },
});
