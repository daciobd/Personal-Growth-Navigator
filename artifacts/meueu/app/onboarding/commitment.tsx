import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
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
  { key: "yes", label: "Sim", sublabel: "Estou pronto agora", icon: "check-circle" },
  { key: "maybe", label: "Talvez", sublabel: "Depende do quanto é difícil", icon: "help-circle" },
  { key: "no", label: "Não sei ainda", sublabel: "Quero ver antes de decidir", icon: "minus-circle" },
] as const;

export default function CommitmentScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();

  const handleSelect = async (key: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    track("onboarding_commitment_answered", { answer: key });
    await AsyncStorage.setItem("@meueu_onboarding_commitment", key);

    router.push("/onboarding/plan");
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
            Passo 4 de 5
          </Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.pretitle, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Se você tivesse um próximo passo claro...
          </Text>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Você começaria hoje?
          </Text>
        </View>
      </Animated.View>

      <View style={[styles.options, { paddingHorizontal: spacing[5] }]}>
        {OPTIONS.map((option, i) => (
          <Animated.View key={option.key} entering={FadeInDown.delay(120 + i * 80).duration(450)}>
            <Pressable
              onPress={() => handleSelect(option.key)}
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
              <View style={styles.optionText}>
                <Text
                  style={[
                    styles.optionLabel,
                    { color: colors.text, fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  {option.label}
                </Text>
                <Text
                  style={[
                    styles.optionSub,
                    { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {option.sublabel}
                </Text>
              </View>
              <Feather name={option.icon as any} size={22} color={colors.primary} />
            </Pressable>
          </Animated.View>
        ))}
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
  titleBlock: { gap: spacing[2] },
  pretitle: { fontSize: 15, lineHeight: 22 },
  title: { fontSize: 30, lineHeight: 38 },
  options: { gap: spacing[4], flex: 1, justifyContent: "center" },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
    paddingVertical: spacing[5],
    paddingHorizontal: spacing[5],
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  optionText: { flex: 1, gap: 4 },
  optionLabel: { fontSize: 18 },
  optionSub: { fontSize: 13 },
  stepLabel: { fontSize: 13 },
});
