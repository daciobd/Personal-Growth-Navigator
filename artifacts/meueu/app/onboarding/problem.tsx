import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
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

const PROBLEMS = [
  {
    key: "cant-start",
    label: "Não consigo começar",
    icon: "pause-circle",
    current: ["travado", "inseguro", "paralisado"],
    future: ["ativo", "determinado", "corajoso"],
  },
  {
    key: "procrastination",
    label: "Procrastino demais",
    icon: "clock",
    current: ["procrastinador", "passivo", "adiador"],
    future: ["disciplinado", "produtivo", "focado"],
  },
  {
    key: "lack-focus",
    label: "Perco foco fácil",
    icon: "wind",
    current: ["disperso", "ansioso", "impulsivo"],
    future: ["focado", "presente", "calmo"],
  },
  {
    key: "feeling-lost",
    label: "Me sinto perdido",
    icon: "compass",
    current: ["perdido", "confuso", "inseguro"],
    future: ["claro", "confiante", "direcionado"],
  },
  {
    key: "no-discipline",
    label: "Falta de disciplina",
    icon: "sliders",
    current: ["inconsistente", "impulsivo", "resistente"],
    future: ["disciplinado", "consistente", "comprometido"],
  },
] as const;

export default function ProblemScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();

  const handleSelect = async (problem: (typeof PROBLEMS)[number]) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    await AsyncStorage.setItem(
      "@meueu_onboarding_problem",
      JSON.stringify({
        key: problem.key,
        label: problem.label,
        current: problem.current,
        future: problem.future,
      })
    );
    router.push("/onboarding/frequency");
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
                    backgroundColor: i === 0 ? colors.primary : colors.cardBorder,
                    width: i === 0 ? 20 : 6,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Onde você mais trava hoje?
        </Text>
      </Animated.View>

      <View style={[styles.options, { paddingHorizontal: spacing[5] }]}>
        {PROBLEMS.map((problem, i) => (
          <Animated.View key={problem.key} entering={FadeInDown.delay(100 + i * 60).duration(450)}>
            <Pressable
              onPress={() => handleSelect(problem)}
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
                <Feather name={problem.icon as any} size={18} color={colors.primary} />
              </View>
              <Text
                style={[styles.optionLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}
              >
                {problem.label}
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
  dots: { flexDirection: "row", alignItems: "center", gap: spacing[1] },
  dot: { height: 6, borderRadius: 3 },
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
