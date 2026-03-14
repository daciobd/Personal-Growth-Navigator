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
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";

const APPROACHES = [
  {
    name: "TCC",
    full: "Terapia Cognitivo-Comportamental",
    desc: "Identifica e transforma padrões de pensamento que limitam seu potencial.",
    icon: "edit-3",
    color: "#1D4ED8",
    bg: "#EFF6FF",
  },
  {
    name: "ACT",
    full: "Aceitação e Compromisso",
    desc: "Conecta você com seus valores mais profundos para uma ação alinhada.",
    icon: "compass",
    color: "#166534",
    bg: "#F0FDF4",
  },
  {
    name: "Mindfulness",
    full: "Atenção Plena",
    desc: "Cultiva presença e consciência para sair do piloto automático.",
    icon: "wind",
    color: "#9A3412",
    bg: "#FFF7ED",
  },
  {
    name: "Psicologia Positiva",
    full: "Psicologia Positiva",
    desc: "Amplifica suas forças e cultivaa gratidão para florescer.",
    icon: "star",
    color: "#6B21A8",
    bg: "#FAF5FF",
  },
];

const STEPS = [
  { num: "1", label: "Eu Hoje", desc: "Quem você é agora" },
  { num: "2", label: "Eu Futuro", desc: "Quem você quer ser" },
  { num: "3", label: "Seu Plano", desc: "IA gera seu caminho" },
];

export default function WelcomeScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/onboarding/current");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
          paddingBottom: Platform.OS === "web" ? 34 : insets.bottom,
        },
      ]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(50).duration(500)} style={styles.hero}>
          <View style={[styles.heroIcon, { backgroundColor: colors.primary }]}>
            <Feather name="refresh-cw" size={32} color="#fff" />
          </View>
          <Text
            style={[styles.heroTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}
          >
            Bem-vindo ao{"\n"}MeuEu
          </Text>
          <Text
            style={[styles.heroSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
          >
            Uma jornada de autoconhecimento e transformação pessoal, guiada por terapias baseadas em evidências.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.stepsSection}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
            COMO FUNCIONA
          </Text>
          <View style={styles.stepsRow}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step.num}>
                <View style={styles.stepItem}>
                  <View style={[styles.stepBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.stepNum, { fontFamily: "Inter_700Bold" }]}>{step.num}</Text>
                  </View>
                  <Text style={[styles.stepLabel, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {step.label}
                  </Text>
                  <Text style={[styles.stepDesc, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                    {step.desc}
                  </Text>
                </View>
                {i < STEPS.length - 1 && (
                  <Feather name="arrow-right" size={16} color={colors.textMuted} style={styles.arrow} />
                )}
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(500)} style={styles.approachesSection}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
            ABORDAGENS TERAPÊUTICAS
          </Text>
          {APPROACHES.map((a) => (
            <View
              key={a.name}
              style={[styles.approachCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            >
              <View style={[styles.approachIcon, { backgroundColor: a.bg }]}>
                <Feather name={a.icon as any} size={18} color={a.color} />
              </View>
              <View style={styles.approachContent}>
                <View style={styles.approachRow}>
                  <View style={[styles.approachBadge, { backgroundColor: a.bg }]}>
                    <Text style={[styles.approachBadgeText, { color: a.color, fontFamily: "Inter_600SemiBold" }]}>
                      {a.name}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.approachName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {a.full}
                </Text>
                <Text style={[styles.approachDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {a.desc}
                </Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <View style={{ height: 24 }} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: "rgba(0,0,0,0.06)",
            backgroundColor: colors.background,
          },
        ]}
      >
        <Pressable
          onPress={handleStart}
          style={({ pressed }) => [
            styles.startButton,
            { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={[styles.startText, { fontFamily: "Inter_600SemiBold" }]}>
            Começar minha jornada
          </Text>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
        <Text style={[styles.footerNote, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          Leva cerca de 5 minutos · Completamente gratuito
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingTop: 16, gap: 32 },
  hero: { gap: 16 },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 32, lineHeight: 40 },
  heroSub: { fontSize: 15, lineHeight: 23 },
  sectionLabel: { fontSize: 11, letterSpacing: 1, marginBottom: 12 },
  stepsSection: { gap: 0 },
  stepsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: { color: "#fff", fontSize: 16 },
  stepLabel: { fontSize: 13, textAlign: "center" },
  stepDesc: { fontSize: 11, textAlign: "center", lineHeight: 15 },
  arrow: { marginTop: 10 },
  approachesSection: { gap: 0 },
  approachCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  approachIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  approachContent: { flex: 1, gap: 4 },
  approachRow: { flexDirection: "row" },
  approachBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  approachBadgeText: { fontSize: 10 },
  approachName: { fontSize: 14 },
  approachDesc: { fontSize: 13, lineHeight: 18 },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  startText: { fontSize: 16, color: "#fff" },
  footerNote: { fontSize: 12, textAlign: "center" },
});
