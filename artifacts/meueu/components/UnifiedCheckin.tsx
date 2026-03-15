/**
 * UnifiedCheckin — substitui <DailyChallenge />.
 *
 * Detecta automaticamente:
 *   • Jornada/plano ativo → exibe o desafio do dia com sinais adaptativos
 *   • Sem plano → CTA para gerar o plano personalizado
 *
 * O servidor retorna `adaptiveSignal` e `adaptiveDisplayMessage`
 * vindos do adaptiveEngine.ts — o componente os exibe quando relevante.
 */
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import type { Practice } from "@/context/AppContext";

type AdaptiveSignal =
  | "neutral"
  | "subtle_adjust"
  | "simplify"
  | "approach_change"
  | "add_challenge"
  | "integration_ready"
  | "checkin_missing";

type ChallengeState =
  | { type: "idle" }
  | { type: "loading" }
  | {
      type: "challenge";
      aiAction: string;
      practice: Practice;
      practiceIndex: number;
      adaptiveSignal: AdaptiveSignal;
      adaptiveDisplayMessage: string | null;
    }
  | {
      type: "checking-in";
      aiAction: string;
      practice: Practice;
      practiceIndex: number;
      adaptiveSignal: AdaptiveSignal;
      adaptiveDisplayMessage: string | null;
    }
  | { type: "submitting" }
  | { type: "done"; xpEarned: number; aiTip: string; streak: number }
  | { type: "no-plan" };

const APPROACH_COLORS: Record<string, { bg: string; text: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8" },
  ACT: { bg: "#F0FDF4", text: "#166534" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412" },
  DBT: { bg: "#FFF7ED", text: "#9A3412" },
  CFT: { bg: "#FFF1F2", text: "#9F1239" },
  Narrativa: { bg: "#FFFBEB", text: "#92400E" },
  Gestalt: { bg: "#F0FDFA", text: "#065F46" },
  Esquema: { bg: "#F5F3FF", text: "#5B21B6" },
  "Eu Futuro": { bg: "#EFF6FF", text: "#1E40AF" },
};

const ADAPTIVE_CONFIG: Record<
  AdaptiveSignal,
  { icon: string; color: string; bg: string } | null
> = {
  neutral: null,
  subtle_adjust: null,
  simplify: { icon: "minimize-2", color: "#9A3412", bg: "#FFF7ED" },
  approach_change: { icon: "refresh-cw", color: "#1D4ED8", bg: "#EFF6FF" },
  add_challenge: { icon: "trending-up", color: "#166534", bg: "#F0FDF4" },
  integration_ready: { icon: "award", color: "#6B21A8", bg: "#FAF5FF" },
  checkin_missing: { icon: "heart", color: "#9F1239", bg: "#FFF1F2" },
};

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const colors = Colors.light;
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onChange(star)} hitSlop={8}>
          <Feather
            name="star"
            size={30}
            color={star <= value ? colors.accent : colors.cardBorder}
          />
        </Pressable>
      ))}
    </View>
  );
}

function XPPop({ xp }: { xp: number }) {
  const colors = Colors.light;
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      style={[styles.xpPop, { backgroundColor: colors.accent }]}
    >
      <Feather name="zap" size={14} color="#fff" />
      <Text style={[styles.xpPopText, { fontFamily: "Inter_700Bold" }]}>
        +{xp} XP
      </Text>
    </Animated.View>
  );
}

export function UnifiedCheckin() {
  const colors = Colors.light;
  const { profile } = useApp();
  const { deviceId, recordCheckin } = useGamification();
  const plan = profile.generatedPlan;

  const [state, setState] = useState<ChallengeState>({ type: "idle" });
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const checkedRef = useRef(false);

  const domain = process.env.EXPO_PUBLIC_DOMAIN ?? "";

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (!plan?.praticas?.length) {
      setState({ type: "no-plan" });
      return;
    }

    setState({ type: "loading" });
    const today = new Date().toISOString().split("T")[0];
    const practiceIndex = new Date().getDay() % 3;
    const practice = plan.praticas[practiceIndex] ?? plan.praticas[0];

    fetch(`${domain}/api/daily/challenge`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId, date: today, practice }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.alreadyCheckedIn && data.checkin) {
          setState({
            type: "done",
            xpEarned: data.checkin.xpEarned ?? 0,
            aiTip: data.checkin.aiTip ?? "Você já fez o check-in de hoje!",
            streak: data.checkin.streakDays ?? 1,
          });
        } else {
          setState({
            type: "challenge",
            aiAction: data.aiAction,
            practice,
            practiceIndex,
            adaptiveSignal: data.adaptiveSignal ?? "neutral",
            adaptiveDisplayMessage: data.adaptiveDisplayMessage ?? null,
          });
        }
      })
      .catch(() => {
        setState({
          type: "challenge",
          aiAction: "Dedique alguns minutos hoje para explorar esta prática com presença.",
          practice,
          practiceIndex,
          adaptiveSignal: "neutral",
          adaptiveDisplayMessage: null,
        });
      });
  }, [plan, deviceId, domain]);

  const handleSubmitCheckin = async () => {
    if (state.type !== "checking-in") return;
    setState({ type: "submitting" });

    const today = new Date().toISOString().split("T")[0];

    try {
      const response = await fetch(`${domain}/api/daily/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          date: today,
          practiceIndex: state.practiceIndex,
          practiceName: state.practice.nome,
          completed: completed ?? false,
          rating: rating > 0 ? rating : undefined,
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();
      const xpEarned = data.xpEarned ?? 0;
      const streak = data.streakDays ?? 1;

      recordCheckin({
        date: today,
        completed: completed ?? false,
        rating: rating > 0 ? rating : undefined,
        hasNote: note.trim().length > 0,
        xpEarned,
        streak,
      });

      setState({
        type: "done",
        xpEarned,
        aiTip: data.aiTip ?? "Ótimo trabalho!",
        streak,
      });
    } catch {
      setState({ type: "challenge", ...(state as any) });
    }
  };

  // ── Loading ──
  if (state.type === "idle" || state.type === "loading") {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textMuted, fontFamily: "Inter_400Regular" },
          ]}
        >
          Preparando seu desafio do dia...
        </Text>
      </View>
    );
  }

  // ── Sem plano: CTA ──
  if (state.type === "no-plan") {
    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.noPlanHeader}>
            <View
              style={[styles.noPlanIcon, { backgroundColor: "#F0FDF4" }]}
            >
              <Feather name="map" size={22} color="#166534" />
            </View>
            <View style={styles.noPlanTexts}>
              <Text
                style={[
                  styles.noPlanTitle,
                  { color: colors.text, fontFamily: "Inter_700Bold" },
                ]}
              >
                Comece sua jornada
              </Text>
              <Text
                style={[
                  styles.noPlanSub,
                  {
                    color: colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                Gere seu plano personalizado com IA
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push("/onboarding/welcome")}
            style={[styles.btn, { backgroundColor: colors.primary }]}
          >
            <Feather name="arrow-right" size={16} color="#fff" />
            <Text style={[styles.btnText, { fontFamily: "Inter_600SemiBold" }]}>
              Criar meu plano
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  // ── Desafio / Check-in ──
  if (state.type === "challenge" || state.type === "checking-in") {
    const aColor =
      APPROACH_COLORS[state.practice.abordagem] ?? {
        bg: "#F5F5F5",
        text: "#333",
      };
    const isCheckingIn = state.type === "checking-in";
    const adaptiveCfg = ADAPTIVE_CONFIG[state.adaptiveSignal];

    return (
      <Animated.View entering={FadeIn.duration(400)}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          {/* Header badges */}
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.challengeBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Feather name="target" size={12} color="#fff" />
              <Text
                style={[
                  styles.challengeBadgeText,
                  { fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Desafio de hoje
              </Text>
            </View>
            <View
              style={[styles.approachBadge, { backgroundColor: aColor.bg }]}
            >
              <Text
                style={[
                  styles.approachText,
                  { color: aColor.text, fontFamily: "Inter_500Medium" },
                ]}
              >
                {state.practice.abordagem}
              </Text>
            </View>
          </View>

          {/* Adaptive signal banner */}
          {adaptiveCfg && state.adaptiveDisplayMessage && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={[
                styles.adaptiveBanner,
                { backgroundColor: adaptiveCfg.bg },
              ]}
            >
              <Feather
                name={adaptiveCfg.icon as any}
                size={13}
                color={adaptiveCfg.color}
              />
              <Text
                style={[
                  styles.adaptiveText,
                  {
                    color: adaptiveCfg.color,
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {state.adaptiveDisplayMessage}
              </Text>
            </Animated.View>
          )}

          {/* Practice name */}
          <Text
            style={[
              styles.practiceName,
              { color: colors.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            {state.practice.nome}
          </Text>

          {/* AI action */}
          <View
            style={[
              styles.actionBox,
              { backgroundColor: colors.background },
            ]}
          >
            <Feather name="sunrise" size={14} color={colors.primary} />
            <Text
              style={[
                styles.actionText,
                { color: colors.text, fontFamily: "Inter_400Regular" },
              ]}
            >
              {state.aiAction}
            </Text>
          </View>

          {/* CTA: já fiz */}
          {!isCheckingIn && (
            <Pressable
              onPress={() => setState({ ...state, type: "checking-in" })}
              style={[styles.btn, { backgroundColor: colors.primary }]}
            >
              <Feather name="check-circle" size={16} color="#fff" />
              <Text
                style={[
                  styles.btnText,
                  { fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Já fiz!
              </Text>
            </Pressable>
          )}

          {/* Formulário de check-in */}
          {isCheckingIn && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={styles.checkinForm}
            >
              <Text
                style={[
                  styles.checkinLabel,
                  { color: colors.text, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Conseguiu fazer?
              </Text>
              <View style={styles.yesNoRow}>
                <Pressable
                  onPress={() => setCompleted(true)}
                  style={[
                    styles.yesNoBtn,
                    {
                      backgroundColor:
                        completed === true
                          ? colors.success
                          : colors.background,
                      borderColor:
                        completed === true
                          ? colors.success
                          : colors.cardBorder,
                    },
                  ]}
                >
                  <Feather
                    name="check"
                    size={16}
                    color={completed === true ? "#fff" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.yesNoText,
                      {
                        color:
                          completed === true ? "#fff" : colors.textMuted,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    Sim
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setCompleted(false)}
                  style={[
                    styles.yesNoBtn,
                    {
                      backgroundColor:
                        completed === false
                          ? colors.danger
                          : colors.background,
                      borderColor:
                        completed === false
                          ? colors.danger
                          : colors.cardBorder,
                    },
                  ]}
                >
                  <Feather
                    name="x"
                    size={16}
                    color={completed === false ? "#fff" : colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.yesNoText,
                      {
                        color:
                          completed === false ? "#fff" : colors.textMuted,
                        fontFamily: "Inter_600SemiBold",
                      },
                    ]}
                  >
                    Não
                  </Text>
                </Pressable>
              </View>

              <Text
                style={[
                  styles.checkinLabel,
                  { color: colors.text, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                Como foi? (1–5)
              </Text>
              <StarRating value={rating} onChange={setRating} />

              <TextInput
                placeholder="Nota livre (opcional)"
                placeholderTextColor={colors.textMuted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                style={[
                  styles.noteInput,
                  {
                    color: colors.text,
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.background,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              />

              <Pressable
                onPress={handleSubmitCheckin}
                disabled={completed === null}
                style={[
                  styles.btn,
                  {
                    backgroundColor:
                      completed !== null
                        ? colors.primary
                        : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.btnText,
                    { fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  Registrar
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    );
  }

  // ── Enviando ──
  if (state.type === "submitting") {
    return (
      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: colors.textMuted, fontFamily: "Inter_400Regular" },
          ]}
        >
          Registrando check-in...
        </Text>
      </View>
    );
  }

  // ── Concluído ──
  if (state.type === "done") {
    return (
      <Animated.View entering={FadeIn.duration(500)}>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <View style={styles.doneHeader}>
            <View style={[styles.doneIcon, { backgroundColor: "#F0FDF4" }]}>
              <Feather name="check-circle" size={22} color="#166534" />
            </View>
            <View style={styles.doneTexts}>
              <Text
                style={[
                  styles.doneTitle,
                  { color: colors.text, fontFamily: "Inter_700Bold" },
                ]}
              >
                Check-in de hoje feito!
              </Text>
              <Text
                style={[
                  styles.doneStreak,
                  {
                    color: colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                {state.streak} dia{state.streak !== 1 ? "s" : ""} seguido
                {state.streak !== 1 ? "s" : ""}
              </Text>
            </View>
            {state.xpEarned > 0 && <XPPop xp={state.xpEarned} />}
          </View>

          <View
            style={[styles.tipBox, { backgroundColor: colors.background }]}
          >
            <Feather
              name="message-circle"
              size={14}
              color={colors.primary}
            />
            <Text
              style={[
                styles.tipText,
                { color: colors.text, fontFamily: "Inter_400Regular" },
              ]}
            >
              {state.aiTip}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  loadingText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  challengeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  challengeBadgeText: { fontSize: 11, color: "#fff" },
  approachBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  approachText: { fontSize: 11 },
  adaptiveBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
  },
  adaptiveText: {
    fontSize: 12,
    flex: 1,
  },
  practiceName: {
    fontSize: 16,
    lineHeight: 22,
  },
  actionBox: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  actionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  btnText: { fontSize: 15, color: "#fff" },
  checkinForm: { gap: 12 },
  checkinLabel: { fontSize: 14 },
  yesNoRow: { flexDirection: "row", gap: 10 },
  yesNoBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  yesNoText: { fontSize: 14 },
  stars: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: "top",
  },
  doneHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  doneIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTexts: { flex: 1 },
  doneTitle: { fontSize: 15 },
  doneStreak: { fontSize: 12, marginTop: 2 },
  xpPop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  xpPopText: { fontSize: 13, color: "#fff" },
  tipBox: {
    flexDirection: "row",
    gap: 10,
    borderRadius: 12,
    padding: 12,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  noPlanHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  noPlanIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  noPlanTexts: { flex: 1 },
  noPlanTitle: { fontSize: 15 },
  noPlanSub: { fontSize: 13, marginTop: 2 },
});
