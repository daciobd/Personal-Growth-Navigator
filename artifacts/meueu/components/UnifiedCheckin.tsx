// artifacts/meueu/components/UnifiedCheckin.tsx
//
// Check-in unificado: cobre a jornada ativa + o plano personalizado em uma
// única tela de menos de 2 minutos.
//
// Fluxo:
//   1. Desafio do dia (jornada OU plano, dependendo do que estiver ativo)
//   2. "Fiz" / "Não fiz"
//   3. Nota 1-5 (se fez)
//   4. Comentário opcional
//   5. Resumo: XP ganho + sinal adaptativo para amanhã
//
// Uso: <UnifiedCheckin onComplete={() => {}} />

import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, TextInput,
  ActivityIndicator, ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getApiUrl } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGamification } from "../context/GamificationContext";

type Challenge = {
  titulo: string; acao: string; dica: string;
  tempo: string; perguntaReflexao: string; adaptacao?: string;
};

type CheckinSource = "journey" | "plan" | "both";

type Props = {
  onComplete?: (xpGained: number) => void;
  journeyOnly?: boolean;
};

const NOTE_LABELS = ["", "Muito difícil", "Difícil", "Mais ou menos", "Boa", "Excelente"];
const SIGNAL_LABELS: Record<string, string> = {
  micro_step:          "Versão simplificada para amanhã",
  easier_variant:      "Prática adaptada para amanhã",
  alternative_approach:"Nova estratégia para amanhã",
  deepen:              "Desafio extra disponível amanhã",
  ready_to_advance:    "Pronto para avançar de fase",
  on_track:            "No caminho certo",
  adjust_today:        "Ajuste sutil para amanhã",
};

type Step = "loading" | "challenge" | "checkin" | "done";

export default function UnifiedCheckin({ onComplete, journeyOnly = false }: Props) {
  const { recordCheckin, addXP, streak } = useGamification();

  const [step, setStep]               = useState<Step>("loading");
  const [source, setSource]           = useState<CheckinSource>("plan");
  const [challenge, setChallenge]     = useState<Challenge | null>(null);
  const [journeyId, setJourneyId]     = useState<string | null>(null);
  const [currentDay, setCurrentDay]   = useState(0);
  const [journeyColor, setJourneyColor] = useState("#1B6B5A");
  const [journeyTitle, setJourneyTitle] = useState("");
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceName, setPracticeName] = useState("");
  const [adaptiveSignal, setAdaptiveSignal] = useState("");
  const [adaptiveHint, setAdaptiveHint] = useState("");

  // Check-in state
  const [completed, setCompleted]     = useState<boolean | null>(null);
  const [note, setNote]               = useState(0);
  const [comment, setComment]         = useState("");
  const [saving, setSaving]           = useState(false);
  const [xpResult, setXpResult]       = useState(0);
  const [journeyDone, setJourneyDone] = useState(false);
  const [hidden, setHidden]           = useState(false);

  const domain = getApiUrl();

  useEffect(() => {
    loadTodayChallenge();
  }, []);

  async function loadTodayChallenge() {
    if (!domain) { setStep("challenge"); return; }
    const deviceId = await AsyncStorage.getItem("@meueu_device_id") ?? "unknown";
    const futureAdj = JSON.parse(await AsyncStorage.getItem("@meueu_future_adjectives") ?? "[]") as string[];

    try {
      // Verifica se tem jornada ativa
      const activeRes = await fetch(`${domain}/api/journeys/active/${deviceId}`);
      const activeData = await activeRes.json();

      if (activeData.active && !activeData.checkinDoneToday) {
        // Jornada ativa com check-in pendente
        setSource(activeData.checkinDoneToday ? "plan" : "journey");
        setJourneyId(activeData.active.journeyId);
        setCurrentDay(activeData.active.currentDay);
        setJourneyColor(activeData.journey?.color ?? "#1B6B5A");
        setJourneyTitle(activeData.journey?.title ?? "Jornada");
        setPracticeName(activeData.todayPractice?.title ?? "Prática do dia");

        // Gera desafio adaptativo
        const chalRes = await fetch(`${domain}/api/journeys/day-challenge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            journeyId: activeData.active.journeyId,
            day: activeData.active.currentDay,
            futureAdjectives: futureAdj,
          }),
        });
        const chalData = await chalRes.json();
        if (chalData.success) {
          setChallenge(chalData.challenge);
          setAdaptiveSignal(chalData.adaptiveSignal ?? "");
          setAdaptiveHint(chalData.adaptiveUiHint ?? "");
        }
      } else {
        // Sem jornada ativa
        if (journeyOnly) {
          // Em modo journeyOnly, não exibe nada se não houver jornada ativa
          setHidden(true);
          return;
        }
        setSource("plan");
        const plan = JSON.parse(await AsyncStorage.getItem("@meueu_plan") ?? "null");
        if (plan?.praticas?.length) {
          const dayIdx = new Date().getDay() % plan.praticas.length;
          setPracticeIdx(dayIdx);
          setPracticeName(plan.praticas[dayIdx].nome);

          // Gera desafio do plano
          const chalRes = await fetch(`${domain}/api/daily/challenge`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              deviceId,
              practiceIdx: dayIdx,
              practiceName: plan.praticas[dayIdx].nome,
              practiceSteps: plan.praticas[dayIdx].passos,
              futureAdjectives: futureAdj,
            }),
          });
          const chalData = await chalRes.json();
          if (chalData.success) setChallenge(chalData.challenge);
        }
      }
    } catch { /* continua com fallback */ }
    setStep("challenge");
  }

  async function handleCheckin() {
    if (completed === null || (completed && note === 0)) return;
    setSaving(true);
    const deviceId = await AsyncStorage.getItem("@meueu_device_id") ?? "unknown";

    try {
      // Registra check-in na jornada (se ativa)
      if (journeyId && source === "journey") {
        const res = await fetch(`${domain}/api/journeys/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId, journeyId,
            day: currentDay, completed,
            note: completed ? note : undefined,
            comment: comment || undefined,
          }),
        });
        const data = await res.json();
        setJourneyDone(data.journeyCompleted ?? false);
        if (data.nextAdaptiveSignal) setAdaptiveSignal(data.nextAdaptiveSignal);
        if (data.nextAdaptiveHint)   setAdaptiveHint(data.nextAdaptiveHint);
      } else {
        // Check-in do plano diário
        await fetch(`${domain}/api/daily/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId, practiceIdx, practiceName,
            completed, note: completed ? note : undefined,
            comment: comment || undefined,
          }),
        });
      }

      // Atualiza gamificação local
      const today = new Date().toISOString().split("T")[0];
      const xp = completed ? 10 + (note >= 5 ? 5 : note >= 4 ? 3 : 0) : 0;
      recordCheckin({
        date: today,
        completed,
        rating: completed ? note : undefined,
        hasNote: !!comment,
        xpEarned: xp,
        streak: streak + (completed ? 1 : 0),
      });
      setXpResult(xp);
      setStep("done");
      onComplete?.(xp);
    } finally {
      setSaving(false);
    }
  }

  const color = journeyId ? journeyColor : "#1B6B5A";

  if (hidden) return null;

  // LOADING
  if (step === "loading") return (
    <View style={styles.card}>
      <ActivityIndicator color={color} />
    </View>
  );

  // DONE
  if (step === "done") return (
    <View style={styles.card}>
      <View style={styles.doneRow}>
        <View style={[styles.doneIcon, { backgroundColor: color + "18" }]}>
          <Feather name="check-circle" size={22} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doneTitle}>
            {journeyDone ? "Jornada concluída!" : "Check-in registrado"}
          </Text>
          <Text style={styles.doneSub}>
            {xpResult > 0 ? `+${xpResult} XP` : "Continue amanhã!"}
            {adaptiveHint ? ` · ${adaptiveHint}` : ""}
          </Text>
        </View>
        <Pressable
          style={[styles.coachBtn, { borderColor: color }]}
          onPress={() => router.push({
            pathname: "/coach",
            params: {
              practiceName,
              prefillMessage: completed
                ? `Fiz a prática "${practiceName}" hoje com nota ${note}. Quero refletir.`
                : `Não consegui fazer "${practiceName}" hoje. O que posso tentar amanhã?`,
            },
          })}>
          <Feather name="message-circle" size={14} color={color} />
          <Text style={[styles.coachBtnText, { color }]}>Coach</Text>
        </Pressable>
      </View>

      {adaptiveSignal && adaptiveSignal !== "on_track" && (
        <View style={[styles.signalRow, { backgroundColor: color + "10", borderColor: color + "30" }]}>
          <Feather name="zap" size={13} color={color} />
          <Text style={[styles.signalText, { color }]}>
            Amanhã: {SIGNAL_LABELS[adaptiveSignal] ?? adaptiveSignal}
          </Text>
        </View>
      )}

      <View style={styles.streakRow}>
        <Feather name="zap" size={13} color="#E8A838" />
        <Text style={styles.streakText}>{streak} dias seguidos</Text>
      </View>
    </View>
  );

  // CHALLENGE
  if (step === "challenge") return (
    <View style={styles.card}>
      <View style={styles.tagRow}>
        <View style={[styles.tag, { backgroundColor: color + "18" }]}>
          <Text style={[styles.tagText, { color }]}>
            {source === "journey" ? `Dia ${currentDay} · ${journeyTitle}` : "Plano personalizado"}
          </Text>
        </View>
        {adaptiveHint && (
          <View style={[styles.adaptiveTag, { backgroundColor: color + "10", borderColor: color + "30" }]}>
            <Feather name="zap" size={10} color={color} />
            <Text style={[styles.adaptiveTagText, { color }]}>{adaptiveHint}</Text>
          </View>
        )}
      </View>

      <Text style={styles.challengeTitle}>{challenge?.titulo ?? practiceName}</Text>
      <Text style={styles.challengeAction}>{challenge?.acao ?? ""}</Text>

      {challenge?.dica && (
        <View style={styles.tipRow}>
          <Feather name="info" size={13} color="#6B8F7E" />
          <Text style={styles.tipText}>{challenge.dica}</Text>
        </View>
      )}

      {challenge?.adaptacao && (
        <View style={[styles.adaptacaoRow, { borderLeftColor: color }]}>
          <Text style={styles.adaptacaoText}>{challenge.adaptacao}</Text>
        </View>
      )}

      <View style={styles.metaRow}>
        <Feather name="clock" size={12} color="#6B8F7E" />
        <Text style={styles.metaText}>{challenge?.tempo ?? "10 min"}</Text>
      </View>

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: color }]}
        onPress={() => setStep("checkin")}>
        <Text style={styles.primaryBtnText}>Vou fazer agora</Text>
        <Feather name="arrow-right" size={16} color="#fff" />
      </Pressable>
      <Pressable
        style={styles.secondaryBtn}
        onPress={() => router.push({
          pathname: "/coach",
          params: {
            practiceName,
            prefillMessage: `Tenho dúvida sobre a prática de hoje: "${practiceName}"`,
          },
        })}>
        <Feather name="help-circle" size={14} color={color} />
        <Text style={[styles.secondaryBtnText, { color }]}>Tenho dúvida</Text>
      </Pressable>
    </View>
  );

  // CHECKIN
  return (
    <View style={styles.card}>
      <Text style={styles.checkinTitle}>Como foi?</Text>
      <Text style={styles.checkinSub}>{practiceName}</Text>

      <View style={styles.yesNoRow}>
        {([true, false] as const).map(v => (
          <Pressable
            key={String(v)}
            style={[styles.yesNoBtn, completed === v && { backgroundColor: color, borderColor: color }]}
            onPress={() => setCompleted(v)}>
            <Feather name={v ? "check" : "x"} size={16} color={completed === v ? "#fff" : "#6B8F7E"} />
            <Text style={[styles.yesNoBtnText, completed === v && { color: "#fff" }]}>
              {v ? "Fiz" : "Não consegui"}
            </Text>
          </Pressable>
        ))}
      </View>

      {completed && (
        <>
          <View style={styles.noteRow}>
            {[1,2,3,4,5].map(n => (
              <Pressable
                key={n}
                style={[styles.noteBtn, note === n && { backgroundColor: color, borderColor: color }]}
                onPress={() => setNote(n)}>
                <Text style={[styles.noteBtnNum, note === n && { color: "#fff" }]}>{n}</Text>
              </Pressable>
            ))}
          </View>
          {note > 0 && <Text style={styles.noteLabel}>{NOTE_LABELS[note]}</Text>}
        </>
      )}

      {challenge?.perguntaReflexao && (
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionLabel}>Reflexão</Text>
          <Text style={styles.reflectionText}>"{challenge.perguntaReflexao}"</Text>
        </View>
      )}

      <TextInput
        style={styles.commentInput}
        placeholder="Comentário opcional…"
        placeholderTextColor="#A8C0B8"
        value={comment}
        onChangeText={setComment}
        multiline
      />

      <Pressable
        style={[styles.primaryBtn, { backgroundColor: color }, (completed === null || (completed && note === 0) || saving) && { opacity: 0.4 }]}
        onPress={handleCheckin}
        disabled={completed === null || (completed && note === 0) || saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.primaryBtnText}>Registrar</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E8F0ED", marginBottom: 16 },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "700" },
  adaptiveTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  adaptiveTagText: { fontSize: 10, fontWeight: "600" },
  challengeTitle: { fontSize: 18, fontWeight: "700", color: "#0F1F1B", marginBottom: 8, lineHeight: 24 },
  challengeAction: { fontSize: 14, color: "#3D5A52", lineHeight: 22, marginBottom: 10 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#F5F8F6", borderRadius: 8, padding: 10, marginBottom: 10 },
  tipText: { fontSize: 12, color: "#6B8F7E", flex: 1, lineHeight: 18 },
  adaptacaoRow: { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 10 },
  adaptacaoText: { fontSize: 12, color: "#6B8F7E", fontStyle: "italic", lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 },
  metaText: { fontSize: 12, color: "#6B8F7E" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 13, marginBottom: 8 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8 },
  secondaryBtnText: { fontSize: 13, fontWeight: "500" },
  checkinTitle: { fontSize: 17, fontWeight: "700", color: "#0F1F1B", marginBottom: 2 },
  checkinSub: { fontSize: 12, color: "#6B8F7E", marginBottom: 16 },
  yesNoRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  yesNoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: "#E8F0ED" },
  yesNoBtnText: { fontSize: 13, fontWeight: "600", color: "#6B8F7E" },
  noteRow: { flexDirection: "row", gap: 8, marginBottom: 5 },
  noteBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: "#E8F0ED" },
  noteBtnNum: { fontSize: 16, fontWeight: "700", color: "#3D5A52" },
  noteLabel: { fontSize: 11, color: "#6B8F7E", textAlign: "center", marginBottom: 12 },
  reflectionBox: { backgroundColor: "#F5F8F6", borderRadius: 8, padding: 10, marginBottom: 10 },
  reflectionLabel: { fontSize: 9, fontWeight: "700", color: "#A8C0B8", textTransform: "uppercase", letterSpacing: .08, marginBottom: 4 },
  reflectionText: { fontSize: 12, color: "#3D5A52", lineHeight: 18, fontStyle: "italic" },
  commentInput: { borderWidth: 1, borderColor: "#E8F0ED", borderRadius: 10, padding: 11, fontSize: 14, color: "#0F1F1B", minHeight: 52, marginBottom: 12 },
  doneRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  doneIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  doneTitle: { fontSize: 15, fontWeight: "700", color: "#0F1F1B" },
  doneSub: { fontSize: 12, color: "#6B8F7E", marginTop: 2 },
  coachBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  coachBtnText: { fontSize: 12, fontWeight: "700" },
  signalRow: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 10 },
  signalText: { fontSize: 12, fontWeight: "600" },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#E8F0ED" },
  streakText: { fontSize: 12, color: "#E8A838", fontWeight: "600" },
});
