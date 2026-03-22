import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { track } from "@/utils/analytics";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { radius, spacing } from "@/constants/tokens";
import { useLongeviContext } from "@/hooks/useLongeviContext";

export default function WelcomeScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { isFromLongevi, context, focus, isLoaded } = useLongeviContext();

  useEffect(() => {
    track("onboarding_started");
  }, []);

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (isFromLongevi && context) {
      router.push("/onboarding/future");
    } else {
      router.push("/onboarding/intro");
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: "#0F1F1B",
          paddingTop: insets.top,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
      ]}
    >
      <View style={styles.content}>
        <Animated.View entering={FadeIn.delay(100).duration(700)} style={styles.badge}>
          <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.badgeText, { fontFamily: "Inter_600SemiBold" }]}>
            MeuEu · Transformação Pessoal
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(700)} style={styles.headlineBlock}>
          <Text style={[styles.headline, { fontFamily: "Inter_700Bold" }]}>
            Você não precisa de mais motivação.
          </Text>
          <Text style={[styles.subheadline, { fontFamily: "Inter_400Regular" }]}>
            Precisa de direção.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(450).duration(700)} style={styles.supportBlock}>
          <View style={styles.supportRow}>
            <View style={[styles.supportDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.supportText, { fontFamily: "Inter_400Regular" }]}>
              Plano personalizado com IA
            </Text>
          </View>
          <View style={styles.supportRow}>
            <View style={[styles.supportDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.supportText, { fontFamily: "Inter_400Regular" }]}>
              Baseado em psicologia comportamental
            </Text>
          </View>
          <View style={styles.supportRow}>
            <View style={[styles.supportDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.supportText, { fontFamily: "Inter_400Regular" }]}>
              Pronto em menos de 2 minutos
            </Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(600).duration(700)}
        style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 8 : 0 }]}
      >
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          <Text style={[styles.startText, { fontFamily: "Inter_600SemiBold" }]}>
            Começar agora
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
        <Text style={[styles.footerNote, { fontFamily: "Inter_400Regular" }]}>
          Gratuito · Sem cadastro necessário
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing[6],
    justifyContent: "center",
    gap: spacing[10],
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 0.5,
  },
  headlineBlock: { gap: spacing[3] },
  headline: {
    fontSize: 36,
    lineHeight: 44,
    color: "#FFFFFF",
  },
  subheadline: {
    fontSize: 36,
    lineHeight: 44,
    color: "rgba(255,255,255,0.45)",
  },
  supportBlock: { gap: spacing[3] },
  supportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  supportDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
  supportText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
    paddingBottom: spacing[6],
    gap: spacing[3],
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[4],
    borderRadius: radius.lg,
  },
  startText: {
    fontSize: 17,
    color: "#fff",
  },
  footerNote: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    textAlign: "center",
  },
});
