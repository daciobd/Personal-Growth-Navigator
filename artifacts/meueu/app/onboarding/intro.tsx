import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";

const STEPS = [
  {
    num: "1",
    icon: "target" as const,
    title: "Seu maior desafio",
    desc: "Identifique onde você mais trava hoje",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    num: "2",
    icon: "user" as const,
    title: "Eu Hoje",
    desc: "Escolha adjetivos que descrevem quem você é agora",
    color: "#0F766E",
    bg: "#F0FDFA",
  },
  {
    num: "3",
    icon: "star" as const,
    title: "Eu Futuro",
    desc: "Defina quem você quer se tornar",
    color: "#9333EA",
    bg: "#FAF5FF",
  },
  {
    num: "4",
    icon: "check-circle" as const,
    title: "Seu compromisso",
    desc: "Uma pergunta simples sobre disposição",
    color: "#D97706",
    bg: "#FFFBEB",
  },
  {
    num: "5",
    icon: "cpu" as const,
    title: "Seu plano personalizado",
    desc: "A IA cruza tudo e gera práticas sob medida",
    color: "#16A34A",
    bg: "#F0FDF4",
  },
] as const;

export default function IntroScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/onboarding/problem");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
      ]}
    >
      <Animated.View
        entering={FadeIn.delay(80).duration(500)}
        style={[styles.header, { paddingHorizontal: spacing[6] }]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: spacing[5] }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(150).duration(500)}
          style={[styles.titleBlock, { paddingHorizontal: spacing[1] }]}
        >
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Veja como funciona
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Leva menos de 2 minutos. Cada passo informa a IA para montar seu plano.
          </Text>
        </Animated.View>

        <View style={styles.steps}>
          {STEPS.map((step, i) => (
            <Animated.View
              key={step.num}
              entering={FadeInDown.delay(220 + i * 80).duration(420)}
              style={styles.stepRow}
            >
              <View style={[styles.iconBox, { backgroundColor: step.bg }]}>
                <Feather name={step.icon} size={18} color={step.color} />
              </View>
              <View style={styles.stepText}>
                <Text style={[styles.stepTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepDesc, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  {step.desc}
                </Text>
              </View>
              <View style={[styles.numBadge, { backgroundColor: colors.chip.default }]}>
                <Text style={[styles.numText, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
                  {step.num}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(400).duration(400)}
        style={[
          styles.footer,
          {
            paddingHorizontal: spacing[6],
            paddingBottom: Platform.OS === "web" ? spacing[4] : insets.bottom + spacing[2],
          },
        ]}
      >
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.buttonText, { fontFamily: "Inter_600SemiBold" }]}>
            Entendido, vamos começar
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: spacing[3],
    paddingBottom: spacing[2],
  },
  titleBlock: {
    gap: spacing[2],
  },
  title: { fontSize: 30, lineHeight: 38 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  scroll: { flex: 1 },
  scrollContent: { gap: spacing[6], paddingBottom: spacing[4] },
  steps: {
    gap: spacing[4],
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 15, lineHeight: 21 },
  stepDesc: { fontSize: 13, lineHeight: 18 },
  numBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numText: { fontSize: 12 },
  footer: {
    paddingBottom: spacing[4],
    paddingTop: spacing[4],
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
  },
  buttonText: {
    fontSize: 17,
    color: "#fff",
  },
});
