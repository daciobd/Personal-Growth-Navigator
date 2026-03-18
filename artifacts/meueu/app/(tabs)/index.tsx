import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UnifiedCheckin from "@/components/UnifiedCheckin";
import { StreakBadge } from "@/components/StreakBadge";
import { XPBar } from "@/components/XPBar";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";
import { getRelevantInterventions } from "@/data/interventions";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const APPROACH_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8", icon: "edit-3" },
  ACT: { bg: "#F0FDF4", text: "#166534", icon: "compass" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8", icon: "star" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  DBT: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
};

export default function TodayScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const { isLoggedIn } = useAuth();
  const { streak } = useGamification();
  const plan = profile.generatedPlan;
  const [hasAssessment, setHasAssessment] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("@meueu_assessments").then((val) => {
      setHasAssessment(val !== null);
    });
  }, []);

  const interventions = useMemo(
    () =>
      getRelevantInterventions(
        profile.currentAdjectives,
        profile.futureAdjectives
      ),
    [profile.currentAdjectives, profile.futureAdjectives]
  );

  const todayDone = interventions.filter((i) =>
    profile.interventionsViewed.includes(i.id)
  ).length;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header */}
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text style={[styles.greetingText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.heading, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Sua jornada
          </Text>
        </View>
        <StreakBadge days={streak || profile.streakDays} />
      </View>

      {/* Save progress banner — shown only when not logged in */}
      {!isLoggedIn && (
        <Pressable
          onPress={() => router.push("/auth/register")}
          style={{
            backgroundColor: "#E8A838",
            margin: 16,
            marginBottom: 0,
            padding: 14,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View>
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
              Salvar meu progresso
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12, marginTop: 2 }}>
              Crie uma conta gratuita para não perder seus dados
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}

      {/* Big Five CTA */}
      {!hasAssessment && (
        <Pressable
          onPress={() => router.push("/assessment")}
          style={({ pressed }) => [styles.bigFiveCard, { opacity: pressed ? 0.9 : 1 }]}
        >
          <Feather name="bar-chart-2" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bigFiveTitle, { fontFamily: "Inter_700Bold" }]}>
              Descubra seu perfil Big Five
            </Text>
            <Text style={[styles.bigFiveSub, { fontFamily: "Inter_400Regular" }]}>
              120 itens · 30 facetas · 15 min · Científico
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}

      {/* Daily Check-in unificado */}
      <UnifiedCheckin />

      {/* XP Bar */}
      <XPBar />

      {/* Intention phrase */}
      {plan?.fraseIntencao && (
        <View style={[styles.intentionBanner, { backgroundColor: colors.primary }]}>
          <Feather name="zap" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.intentionText, { fontFamily: "Inter_500Medium" }]}>
            {plan.fraseIntencao}
          </Text>
        </View>
      )}

      {/* Generated Plan */}
      {plan?.praticas && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            Seu plano personalizado
          </Text>
          <Text style={[styles.sectionSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Gerado por IA com base no seu perfil
          </Text>

          {plan.praticas.map((practice, i) => {
            const aColor = APPROACH_COLORS[practice.abordagem] ?? {
              bg: "#F5F5F5",
              text: "#333",
              icon: "activity",
            };
            return (
              <View
                key={i}
                style={[styles.practiceCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              >
                <View style={styles.practiceTop}>
                  <View style={[styles.practiceIconBox, { backgroundColor: aColor.bg }]}>
                    <Feather name={aColor.icon as any} size={16} color={aColor.text} />
                  </View>
                  <View style={styles.practiceTopText}>
                    <View style={[styles.badgeSmall, { backgroundColor: aColor.bg }]}>
                      <Text style={[styles.badgeSmallText, { color: aColor.text, fontFamily: "Inter_600SemiBold" }]}>
                        {practice.abordagem}
                      </Text>
                    </View>
                    <Text style={[styles.practiceName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                      {practice.nome}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.justificativa, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {practice.justificativa}
                </Text>
                <View style={styles.frequencyRow}>
                  <Feather name="clock" size={12} color={colors.textMuted} />
                  <Text style={[styles.frequencyText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                    {practice.frequencia}
                  </Text>
                  <Pressable
                    onPress={() => router.push({ pathname: "/intervention/[id]", params: { id: `plan-${i}`, practice: JSON.stringify(practice) } })}
                    style={[styles.detailsBtn, { backgroundColor: aColor.bg }]}
                  >
                    <Text style={[styles.detailsBtnText, { color: aColor.text, fontFamily: "Inter_600SemiBold" }]}>
                      Ver passos
                    </Text>
                    <Feather name="arrow-right" size={12} color={aColor.text} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Progress Card */}
      <View style={[styles.progressCard, { backgroundColor: colors.primary }]}>
        <View style={styles.progressRow}>
          <Feather name="target" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={[styles.progressLabel, { fontFamily: "Inter_500Medium" }]}>
            Práticas extras exploradas
          </Text>
        </View>
        <Text style={[styles.progressNumber, { fontFamily: "Inter_700Bold" }]}>
          {todayDone} / {Math.min(interventions.length, 5)}
        </Text>
        <View style={styles.progressBarOuter}>
          <View
            style={[
              styles.progressBarInner,
              { width: `${(todayDone / Math.min(interventions.length, 5)) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Extra interventions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          Mais práticas para você
        </Text>
        <Text style={[styles.sectionSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
          Explore além do seu plano gerado
        </Text>
      </View>

      {interventions.slice(0, 5).map((intervention) => (
        <Pressable
          key={intervention.id}
          onPress={() => router.push({ pathname: "/intervention/[id]", params: { id: intervention.id } })}
          style={({ pressed }) => [
            styles.miniCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={styles.miniRow}>
            <Text style={[styles.miniTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {intervention.title}
            </Text>
            {profile.interventionsViewed.includes(intervention.id) && (
              <Feather name="check-circle" size={14} color={colors.success} />
            )}
          </View>
          <Text style={[styles.miniTherapy, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {intervention.therapy} · {intervention.duration}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: { gap: 2 },
  greetingText: { fontSize: 14 },
  heading: { fontSize: 26, lineHeight: 32 },
  intentionBanner: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  intentionText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    lineHeight: 21,
  },
  section: { gap: 4 },
  sectionTitle: { fontSize: 17 },
  sectionSub: { fontSize: 13 },
  practiceCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  practiceTop: { flexDirection: "row", gap: 10, alignItems: "center" },
  practiceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  practiceTopText: { flex: 1, gap: 4 },
  badgeSmall: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeSmallText: { fontSize: 10 },
  practiceName: { fontSize: 14, lineHeight: 19 },
  justificativa: { fontSize: 13, lineHeight: 19 },
  frequencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  frequencyText: { fontSize: 12, flex: 1 },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  detailsBtnText: { fontSize: 12 },
  progressCard: {
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  progressLabel: { fontSize: 13, color: "rgba(255,255,255,0.8)" },
  progressNumber: { fontSize: 32, color: "#fff", lineHeight: 40 },
  progressBarOuter: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: { height: 4, backgroundColor: "#fff", borderRadius: 2 },
  miniCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  miniRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  miniTitle: { fontSize: 14 },
  miniTherapy: { fontSize: 12 },
  bigFiveCard: {
    backgroundColor: "#3A5A8C",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bigFiveTitle: { color: "#fff", fontSize: 15 },
  bigFiveSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },
});
