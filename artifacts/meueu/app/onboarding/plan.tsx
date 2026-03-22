import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import { track } from "@/utils/analytics";
import {
  ActivityIndicator,
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
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { usePlanGeneration, type GeneratedPlan, type GeneratedApproach } from "@/hooks/usePlanGeneration";
import ApproachSelector, { type ApproachOption } from "@/components/ApproachSelector";

type Practice = {
  abordagem: string;
  nome: string;
  justificativa: string;
  passos: string[];
  frequencia: string;
};

type Plan = GeneratedPlan;
type PlanApproach = GeneratedApproach;

const APPROACH_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  "TCC — Pensamentos e Comportamento": { bg: "#EFF6FF", text: "#1D4ED8", icon: "edit-3" },
  TCC: { bg: "#EFF6FF", text: "#1D4ED8", icon: "edit-3" },
  "ACT — Valores e Ação": { bg: "#F0FDF4", text: "#166534", icon: "compass" },
  ACT: { bg: "#F0FDF4", text: "#166534", icon: "compass" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8", icon: "star" },
  "Atenção Plena": { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  "CFT — Autocompaixão": { bg: "#FDF2F8", text: "#9D174D", icon: "heart" },
  CFT: { bg: "#FDF2F8", text: "#9D174D", icon: "heart" },
  "DBT — Equilíbrio Emocional": { bg: "#FFFBEB", text: "#92400E", icon: "sliders" },
  DBT: { bg: "#FFFBEB", text: "#92400E", icon: "sliders" },
};

const LOADING_MESSAGES = [
  "Analisando seu padrão...",
  "Identificando seus bloqueios...",
  "Definindo seus próximos passos...",
  "Selecionando práticas personalizadas...",
  "Formulando seu plano de ação...",
  "Finalizando...",
];

export default function PlanScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { profile, completeOnboarding, setPlan } = useApp();
  const { isLoggedIn } = useAuth();
  const { generate, loading: hookLoading, error: hookError } = usePlanGeneration();

  const [plan, setPlanLocal] = useState<Plan | null>(null);
  const [approach, setApproach] = useState<PlanApproach | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [skipSave, setSkipSave] = useState(false);
  const [approachSelected, setApproachSelected] = useState<string | null>(null);
  const msgIndex = useRef(0);

  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generate(
        profile.futureAdjectives
      );
      if (!result) throw new Error(hookError ?? "Erro ao gerar plano");
      setPlanLocal(result.plan as Plan);
      setPlan(result.plan as any);
      setApproach(result.approach);
      track("plan_generated", { approach: result.approach?.name ?? "unknown" });
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e: any) {
      setError(e.message ?? "Erro ao conectar com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePlan();
    // Cycle loading messages
    const interval = setInterval(() => {
      msgIndex.current = (msgIndex.current + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[msgIndex.current]);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const handleDone = async () => {
    if (plan) {
      await AsyncStorage.setItem("@meueu_plan", JSON.stringify(plan));
    }
    completeOnboarding(plan ?? undefined);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // dismissAll clears the entire onboarding stack (welcome → current → future → plan)
    // so replace("/(tabs)") results in a clean history with no back-to-onboarding
    try { router.dismissAll(); } catch {}
    router.replace("/(tabs)");
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
      {loading && (
        <View style={styles.loadingView}>
          <View style={[styles.loadingIcon, { backgroundColor: colors.primary }]}>
            <Feather name="cpu" size={32} color="#fff" />
          </View>
          <Text style={[styles.loadingTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Gerando seu plano
          </Text>
          <Text style={[styles.loadingMsg, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {loadingMsg}
          </Text>
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 8 }} />
          <Text style={[styles.loadingNote, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            A IA está cruzando seus adjetivos com intervenções terapêuticas personalizadas
          </Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorView}>
          <Feather name="wifi-off" size={48} color={colors.danger} />
          <Text style={[styles.errorTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Algo deu errado
          </Text>
          <Text style={[styles.errorMsg, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {error}
          </Text>
          <Pressable
            onPress={generatePlan}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="refresh-cw" size={16} color="#fff" />
            <Text style={[styles.retryText, { fontFamily: "Inter_600SemiBold" }]}>
              Tentar novamente
            </Text>
          </Pressable>
        </View>
      )}

      {plan && !loading && (
        <>
          <View style={styles.topBar}>
            <View style={[styles.topBadge, { backgroundColor: colors.primary }]}>
              <Feather name="check" size={14} color="#fff" />
              <Text style={[styles.topBadgeText, { fontFamily: "Inter_600SemiBold" }]}>
                Plano gerado com IA
              </Text>
            </View>
            <Text style={[styles.topNote, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              Etapa 3 de 3
            </Text>
          </View>

          {!isLoggedIn && !skipSave && (
            <View style={{ backgroundColor: "#1B6B5A", borderRadius: 16, padding: 20, margin: 16, marginBottom: 0 }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 8, fontFamily: "Inter_700Bold" }}>
                Salvar seu plano
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginBottom: 16, lineHeight: 20, fontFamily: "Inter_400Regular" }}>
                Crie uma conta gratuita para não perder seu plano personalizado e acompanhar seu progresso.
              </Text>
              <Pressable
                onPress={() => router.push("/auth/register")}
                style={({ pressed }) => ({ backgroundColor: "#fff", borderRadius: 10, padding: 14, alignItems: "center" as const, marginBottom: 10, opacity: pressed ? 0.9 : 1 })}
              >
                <Text style={{ color: "#1B6B5A", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" }}>Criar conta gratuita</Text>
              </Pressable>
              <Pressable onPress={() => setSkipSave(true)} style={{ alignItems: "center", padding: 8 }}>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_400Regular" }}>Continuar sem salvar</Text>
              </Pressable>
            </View>
          )}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Synthesis */}
            <Animated.View entering={FadeInDown.delay(50).duration(500)}>
              <View style={[styles.synthesisCard, { backgroundColor: colors.primary }]}>
                <Text style={[styles.synthesisLabel, { fontFamily: "Inter_500Medium" }]}>
                  Sua jornada
                </Text>
                <Text style={[styles.synthesisText, { fontFamily: "Inter_400Regular" }]}>
                  {plan.sintese}
                </Text>
              </View>
            </Animated.View>

            {/* Therapeutic approach */}
            {approach && (
              <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                <View style={[styles.approachCard, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
                  <View style={styles.approachHeader}>
                    <View style={[styles.approachIconWrap, { backgroundColor: "#16A34A" }]}>
                      <Feather name="book-open" size={13} color="#fff" />
                    </View>
                    <Text style={[styles.approachLabel, { color: "#166534", fontFamily: "Inter_500Medium" }]}>
                      Perspectiva desta jornada
                    </Text>
                  </View>
                  <Text style={[styles.approachName, { color: "#14532D", fontFamily: "Inter_700Bold" }]}>
                    {approach.name}
                  </Text>
                  <View style={styles.approachQuestionRow}>
                    <Feather name="message-circle" size={13} color="#16A34A" />
                    <Text style={[styles.approachQuestion, { color: "#166534", fontFamily: "Inter_400Regular" }]}>
                      {approach.anchorQuestion}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* Intention phrase */}
            <Animated.View entering={FadeInDown.delay(150).duration(500)}>
              <View style={[styles.intentionCard, { backgroundColor: colors.card, borderColor: colors.accent }]}>
                <View style={styles.intentionRow}>
                  <Feather name="zap" size={16} color={colors.accent} />
                  <Text style={[styles.intentionLabel, { color: colors.accent, fontFamily: "Inter_600SemiBold" }]}>
                    Frase de Intenção
                  </Text>
                </View>
                <Text style={[styles.intentionText, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {plan.fraseIntencao}
                </Text>
              </View>
            </Animated.View>

            {/* Practices */}
            <Text style={[styles.practicesTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              Suas 3 práticas personalizadas
            </Text>

            {plan.praticas?.map((practice, i) => {
              const aColor = APPROACH_COLORS[practice.abordagem] ?? {
                bg: "#F5F5F5",
                text: "#333",
                icon: "activity",
              };
              return (
                <Animated.View
                  key={i}
                  entering={FadeInDown.delay(250 + i * 100).duration(500)}
                >
                  <View
                    style={[
                      styles.practiceCard,
                      { backgroundColor: colors.card, borderColor: colors.cardBorder },
                    ]}
                  >
                    <View style={styles.practiceHeader}>
                      <View style={[styles.practiceIcon, { backgroundColor: aColor.bg }]}>
                        <Feather name={aColor.icon as any} size={18} color={aColor.text} />
                      </View>
                      <View style={styles.practiceHeaderText}>
                        <View style={[styles.approachBadge, { backgroundColor: aColor.bg }]}>
                          <Text style={[styles.approachText, { color: aColor.text, fontFamily: "Inter_600SemiBold" }]}>
                            {practice.abordagem}
                          </Text>
                        </View>
                        <Text style={[styles.practiceName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                          {practice.nome}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.justificativa, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                      {practice.justificativa}
                    </Text>

                    <View style={[styles.stepsContainer, { backgroundColor: colors.background }]}>
                      {practice.passos?.map((step, j) => (
                        <View key={j} style={styles.stepRow}>
                          <View style={[styles.stepNum, { backgroundColor: aColor.bg }]}>
                            <Text style={[styles.stepNumText, { color: aColor.text, fontFamily: "Inter_700Bold" }]}>
                              {j + 1}
                            </Text>
                          </View>
                          <Text style={[styles.stepText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                            {step}
                          </Text>
                        </View>
                      ))}
                    </View>

                    <View style={styles.frequencyRow}>
                      <Feather name="clock" size={13} color={colors.textMuted} />
                      <Text style={[styles.frequencyText, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
                        {practice.frequencia}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            {/* Approach selector — shown after practices, disappears after selection */}
            {!approachSelected && plan.praticas?.length > 0 && (
              <Animated.View entering={FadeInDown.delay(550).duration(500)}>
                <ApproachSelector
                  options={plan.praticas.map((p: Practice, i: number): ApproachOption => ({
                    key: p.abordagem.toLowerCase().replace(/\s+/g, "-"),
                    label: p.abordagem,
                    title: p.nome,
                    description: p.justificativa.slice(0, 100) + (p.justificativa.length > 100 ? "..." : ""),
                    color: (["#3A5A8C", "#1B6B5A", "#E8A838"] as string[])[i] ?? "#6B8F7E",
                    bgColor: (["#EDF2FB", "#E8F5F1", "#FFF8EC"] as string[])[i] ?? "#F5F8F6",
                  }))}
                  onSelect={(key) => setApproachSelected(key)}
                />
              </Animated.View>
            )}

            <View style={{ height: 24 }} />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: "rgba(0,0,0,0.06)", backgroundColor: colors.background }]}>
            <Pressable
              onPress={handleDone}
              style={({ pressed }) => [
                styles.doneButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Feather name="check" size={18} color="#fff" />
              <Text style={[styles.doneText, { fontFamily: "Inter_600SemiBold" }]}>
                Começar minha transformação
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  loadingIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingTitle: { fontSize: 24, textAlign: "center" },
  loadingMsg: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  loadingNote: { fontSize: 13, textAlign: "center", lineHeight: 20, marginTop: 8 },
  errorView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: { fontSize: 22 },
  errorMsg: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    marginTop: 8,
  },
  retryText: { color: "#fff", fontSize: 15 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  topBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  topBadgeText: { color: "#fff", fontSize: 13 },
  topNote: { fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  synthesisCard: {
    borderRadius: 18,
    padding: 20,
    gap: 10,
  },
  synthesisLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  synthesisText: {
    color: "#fff",
    fontSize: 15,
    lineHeight: 24,
  },
  intentionCard: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 2,
    gap: 10,
  },
  intentionRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  intentionLabel: { fontSize: 12, letterSpacing: 0.5 },
  intentionText: { fontSize: 17, lineHeight: 26 },
  practicesTitle: { fontSize: 17, marginTop: 4 },
  practiceCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  practiceHeader: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  practiceIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  practiceHeaderText: { flex: 1, gap: 6 },
  approachCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  approachHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  approachIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  approachLabel: { fontSize: 12 },
  approachName: { fontSize: 15, lineHeight: 21 },
  approachQuestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    paddingTop: 2,
  },
  approachQuestion: { flex: 1, fontSize: 13, lineHeight: 19, fontStyle: "italic" },
  approachBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  approachText: { fontSize: 11 },
  practiceName: { fontSize: 16, lineHeight: 22 },
  justificativa: { fontSize: 13, lineHeight: 20 },
  stepsContainer: { borderRadius: 12, padding: 14, gap: 12 },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { fontSize: 11 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 21 },
  frequencyRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  frequencyText: { fontSize: 13 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
  },
  doneButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  doneText: { color: "#fff", fontSize: 16 },
});
