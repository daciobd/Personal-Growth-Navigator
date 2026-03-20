import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";
import { getApiUrl } from "@/utils/api";

// ─── Storage keys ────────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const DAY_STATUS_KEY = `@jornada_day_${today}`;
const PLAN_LOADED_KEY = `@jornada_loaded_${today}`;

// ─── Types ────────────────────────────────────────────────────────────────────
type AdaptLevel = "minimal" | "simplified" | "normal";
type SegmentSource = "personal" | "none";

type DailyAction = {
  id: string;
  type: string;
  title: string;
  instruction: string;
  effort: "low" | "medium" | "high";
  trigger: string;
  markerKey: string;
  recommendedActionType: string;
  steps: string[];
  why: string;
  priority: number;
};

type DailyPlan = {
  planId: string;
  generatedAt: string;
  careMode: string;
  behavioralSegment: "low" | "medium" | "high";
  segmentSource: SegmentSource;
  adaptation: {
    level: AdaptLevel;
    experimentKey: string;
    experimentVariant: string;
  };
  action: DailyAction;
  uiHints: {
    maxVisibleActions: number;
    tone: string;
    showWhy: boolean;
    showProgress: boolean;
  };
};

type DayStatus = {
  status: "done" | "missed";
  planId: string;
  actionId: string;
};

// ─── Display maps ─────────────────────────────────────────────────────────────
const EFFORT_LABEL: Record<string, string> = {
  low: "Fácil",
  medium: "Moderado",
  high: "Desafiador",
};

const EFFORT_COLOR: Record<string, string> = {
  low: "#16A34A",
  medium: "#D97706",
  high: "#DC2626",
};

const SEGMENT_LABEL: Record<string, string> = {
  low: "iniciando",
  medium: "progredindo",
  high: "consistente",
};

// ─── Point 6: Unified ID resolver (ready for userId migration) ────────────────
function resolveIdentifier(userId: number | null, deviceId: string): string {
  return userId != null ? String(userId) : deviceId;
}

// ─── Behavioral event helper ──────────────────────────────────────────────────
async function postBehavioralEvent(
  domain: string,
  eventType: "plan_loaded" | "done" | "missed",
  plan: DailyPlan,
  resolvedUserId: string,
  source: string,
  extra?: Record<string, unknown>
) {
  const event = {
    eventType,
    userId: resolvedUserId,
    planId: plan.planId,
    actionId: plan.action.id,
    timestamp: new Date().toISOString(),
    careMode: plan.careMode,
    behavioralSegment: plan.behavioralSegment,
    adaptationLevel: plan.adaptation.level,
    experimentKey: plan.adaptation.experimentKey,
    experimentVariant: plan.adaptation.experimentVariant,
    markerKey: plan.action.markerKey,
    recommendedActionType: plan.action.recommendedActionType,
    metadata: {
      source,
      segmentSource: plan.segmentSource,
      ...extra,
    },
  };
  fetch(`${domain}/api/behavioral/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ events: [event] }),
  }).catch((e) => console.warn("behavioral event error:", e));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function JornadaScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const domain = getApiUrl();
  const { profile } = useApp();
  const { user } = useAuth();
  const { deviceId } = useGamification();

  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [dayStatus, setDayStatus] = useState<DayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedId = resolveIdentifier(user?.id ?? null, deviceId);

  const loadPlan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${domain}/api/jornada/daily-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          careMode: "adult",
          currentAdjectives: profile.currentAdjectives ?? [],
          futureAdjectives: profile.futureAdjectives ?? [],
        }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const data: DailyPlan = await res.json();
      setPlan(data);

      // ── Point 4: fire plan_loaded only once per calendar day ──────────────
      const alreadyFired = await AsyncStorage.getItem(PLAN_LOADED_KEY);
      if (!alreadyFired) {
        await AsyncStorage.setItem(PLAN_LOADED_KEY, "1");
        postBehavioralEvent(domain, "plan_loaded", data, resolvedId, "app");
      }

      // Restore today's status if it matches today's plan
      const stored = await AsyncStorage.getItem(DAY_STATUS_KEY);
      if (stored) {
        const parsed: DayStatus = JSON.parse(stored);
        if (parsed.planId === data.planId) setDayStatus(parsed);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao carregar o plano do dia.");
    } finally {
      setLoading(false);
    }
  }, [deviceId, domain, profile.currentAdjectives, profile.futureAdjectives, resolvedId]);

  useEffect(() => { loadPlan(); }, []);

  // ── Point 5: handleAction guards against duplicate submission ──────────────
  const handleAction = useCallback(
    async (status: "done" | "missed") => {
      if (!plan || dayStatus !== null) return; // already submitted

      const dayStatusData: DayStatus = { status, planId: plan.planId, actionId: plan.action.id };
      setDayStatus(dayStatusData);
      await AsyncStorage.setItem(DAY_STATUS_KEY, JSON.stringify(dayStatusData));
      postBehavioralEvent(domain, status, plan, resolvedId, "app");

      if (Platform.OS !== "web") {
        if (status === "done") {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }
    },
    [plan, dayStatus, domain, resolvedId]
  );

  // Explicit reset — clears both memory and storage
  const handleReset = useCallback(async () => {
    setDayStatus(null);
    await AsyncStorage.removeItem(DAY_STATUS_KEY);
  }, []);

  const adaptLevel = plan?.adaptation.level ?? "minimal";
  // ── Point 2: neutral copy when no history ─────────────────────────────────
  const isUnknown = plan?.segmentSource === "none";

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 20,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header: neutral when no history ── */}
      <View style={styles.header}>
        <Text style={[styles.headerLabel, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
          Ação do dia
        </Text>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          {isUnknown ? "Sua ação de hoje" : "O que fazer agora"}
        </Text>
      </View>

      {loading && (
        <Animated.View entering={FadeIn} style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Preparando sua ação do dia...
          </Text>
        </Animated.View>
      )}

      {error && !loading && (
        <Animated.View entering={FadeIn} style={[styles.errorBox, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Feather name="wifi-off" size={32} color={colors.danger} />
          <Text style={[styles.errorText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>{error}</Text>
          <Pressable
            onPress={loadPlan}
            style={({ pressed }) => [styles.retryBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
          >
            <Feather name="refresh-cw" size={14} color="#fff" />
            <Text style={[styles.retryText, { fontFamily: "Inter_600SemiBold" }]}>Tentar novamente</Text>
          </Pressable>
        </Animated.View>
      )}

      {plan && !loading && (
        <>
          {/* ── Point 2: segment badge — hide personalization language for none ── */}
          {!isUnknown && (
            <Animated.View entering={FadeInDown.delay(50).duration(400)} style={styles.segmentRow}>
              <View style={[styles.segmentBadge, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={[styles.segmentDot, {
                  backgroundColor: plan.behavioralSegment === "high" ? "#16A34A"
                    : plan.behavioralSegment === "medium" ? "#D97706"
                    : "#6B7280",
                }]} />
                <Text style={[styles.segmentText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                  {SEGMENT_LABEL[plan.behavioralSegment]} · {plan.adaptation.level}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Action card ── */}
          <Animated.View entering={FadeInDown.delay(isUnknown ? 50 : 100).duration(400)}>
            <View style={[styles.actionCard, { backgroundColor: colors.primary }]}>
              <View style={styles.actionTop}>
                <View style={styles.effortBadge}>
                  <Text style={[styles.effortText, { color: EFFORT_COLOR[plan.action.effort] ?? "#333", fontFamily: "Inter_600SemiBold" }]}>
                    {EFFORT_LABEL[plan.action.effort] ?? plan.action.effort}
                  </Text>
                </View>
                <Feather name="clock" size={13} color="rgba(255,255,255,0.6)" />
                <Text style={[styles.triggerText, { fontFamily: "Inter_400Regular" }]}>
                  {plan.action.trigger.replace(/_/g, " ")}
                </Text>
              </View>

              <Text style={[styles.actionTitle, { fontFamily: "Inter_700Bold" }]}>
                {plan.action.title}
              </Text>

              <Text style={[styles.actionInstruction, { fontFamily: "Inter_400Regular" }]}>
                {plan.action.instruction}
              </Text>

              {/* simplified + normal: steps */}
              {(adaptLevel === "simplified" || adaptLevel === "normal") &&
                plan.action.steps.length > 0 && (
                  <View style={styles.stepsBox}>
                    {plan.action.steps.map((step, i) => (
                      <View key={i} style={styles.stepRow}>
                        <View style={styles.stepNum}>
                          <Text style={[styles.stepNumText, { fontFamily: "Inter_700Bold" }]}>{i + 1}</Text>
                        </View>
                        <Text style={[styles.stepText, { fontFamily: "Inter_400Regular" }]}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}

              {/* normal only: why */}
              {adaptLevel === "normal" && plan.action.why ? (
                <View style={styles.whyBox}>
                  <Feather name="info" size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={[styles.whyText, { fontFamily: "Inter_400Regular" }]}>
                    {plan.action.why}
                  </Text>
                </View>
              ) : null}
            </View>
          </Animated.View>

          {/* ── CTA: buttons or result ── */}
          {dayStatus === null ? (
            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.ctaRow}>
              <Pressable
                onPress={() => handleAction("done")}
                style={({ pressed }) => [styles.doneBtn, { opacity: pressed ? 0.85 : 1 }]}
              >
                <Feather name="check-circle" size={20} color="#fff" />
                <Text style={[styles.doneBtnText, { fontFamily: "Inter_700Bold" }]}>Feito</Text>
              </Pressable>
              <Pressable
                onPress={() => handleAction("missed")}
                style={({ pressed }) => [styles.missedBtn, { borderColor: colors.cardBorder, opacity: pressed ? 0.85 : 1 }]}
              >
                <Text style={[styles.missedBtnText, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                  Não consegui
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            <>
              <Animated.View
                entering={FadeInDown.delay(200).duration(400)}
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: dayStatus.status === "done" ? "#F0FDF4" : "#FFF7ED",
                    borderColor: dayStatus.status === "done" ? "#BBF7D0" : "#FDE68A",
                  },
                ]}
              >
                <Feather
                  name={dayStatus.status === "done" ? "check-circle" : "heart"}
                  size={24}
                  color={dayStatus.status === "done" ? "#16A34A" : "#D97706"}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.resultTitle, { color: dayStatus.status === "done" ? "#14532D" : "#92400E", fontFamily: "Inter_700Bold" }]}>
                    {dayStatus.status === "done" ? "Ótimo trabalho!" : "Tudo bem, amanhã é uma nova chance."}
                  </Text>
                  <Text style={[styles.resultSub, { color: dayStatus.status === "done" ? "#166534" : "#B45309", fontFamily: "Inter_400Regular" }]}>
                    {dayStatus.status === "done"
                      ? "Você registrou sua ação de hoje."
                      : "Cada pequeno passo conta. Continue tentando."}
                  </Text>
                </View>
              </Animated.View>

              {/* ── Point 5: explicit reset, clearly labeled ── */}
              <Pressable onPress={handleReset} style={styles.resetLink}>
                <Text style={[styles.resetText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Corrigir resposta
                </Text>
              </Pressable>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  header: { gap: 4 },
  headerLabel: { fontSize: 14 },
  headerTitle: { fontSize: 26, lineHeight: 32 },
  loadingBox: { alignItems: "center", justifyContent: "center", paddingVertical: 60, gap: 16 },
  loadingText: { fontSize: 15 },
  errorBox: { borderRadius: 16, borderWidth: 1, padding: 24, alignItems: "center", gap: 12 },
  errorText: { fontSize: 14, textAlign: "center" },
  retryBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  retryText: { color: "#fff", fontSize: 14 },
  segmentRow: { flexDirection: "row" },
  segmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: 1,
  },
  segmentDot: { width: 7, height: 7, borderRadius: 4 },
  segmentText: { fontSize: 12 },
  actionCard: { borderRadius: 20, padding: 22, gap: 14 },
  actionTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  effortBadge: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  effortText: { fontSize: 11 },
  triggerText: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  actionTitle: { color: "#fff", fontSize: 22, lineHeight: 30 },
  actionInstruction: { color: "rgba(255,255,255,0.85)", fontSize: 15, lineHeight: 23 },
  stepsBox: { backgroundColor: "rgba(0,0,0,0.12)", borderRadius: 12, padding: 14, gap: 10 },
  stepRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stepNumText: { color: "#fff", fontSize: 11 },
  stepText: { flex: 1, color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 20 },
  whyBox: { flexDirection: "row", gap: 8, alignItems: "flex-start", paddingTop: 4 },
  whyText: { flex: 1, color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 19, fontStyle: "italic" },
  ctaRow: { gap: 10 },
  doneBtn: {
    backgroundColor: "#16A34A",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  doneBtnText: { color: "#fff", fontSize: 17 },
  missedBtn: { borderRadius: 14, paddingVertical: 14, borderWidth: 1, alignItems: "center" },
  missedBtnText: { fontSize: 15 },
  resultBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  resultTitle: { fontSize: 15, marginBottom: 4 },
  resultSub: { fontSize: 13, lineHeight: 19 },
  resetLink: { alignItems: "center", paddingVertical: 10 },
  resetText: { fontSize: 13 },
});
