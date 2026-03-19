// artifacts/meueu/app/journeys/[id].tsx
// Tela da jornada ativa — mostra o desafio do dia e check-in.
// Rota: /journeys/[id]

import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  ActivityIndicator, TextInput, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { getApiUrl } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useGamification } from "../../context/GamificationContext";

type Challenge = {
  titulo: string; acao: string; dica: string;
  tempo: string; perguntaReflexao: string;
};

type DayData = {
  day: number; phase: number; title: string;
  description: string; technique: string;
  duration: string; approach: string;
};

type ActiveData = {
  active: { journeyId: string; currentDay: number; phase: number; status: string } | null;
  journey: { id: string; title: string; color: string; phases: Array<{ number: number; title: string; description: string }> } | null;
  todayPractice: DayData | null;
  checkinDoneToday: boolean;
  completionPct: number;
};

const NOTE_LABELS = ["", "Muito difícil", "Difícil", "Mais ou menos", "Boa", "Excelente"];

export default function JourneyActiveScreen() {
  const insets = useSafeAreaInsets();
  const { id }  = useLocalSearchParams<{ id: string }>();
  const { recordCheckin } = useGamification();

  const [data, setData]         = useState<ActiveData | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading]   = useState(true);
  const [step, setStep]         = useState<"challenge" | "checkin" | "done">("challenge");
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [note, setNote]         = useState(0);
  const [comment, setComment]   = useState("");
  const [saving, setSaving]     = useState(false);

  const domain = getApiUrl();

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    if (!domain || !id) { setLoading(false); return; }
    const deviceId = await AsyncStorage.getItem("@meueu_device_id") ?? "unknown";
    try {
      const activeRes = await fetch(`${domain}/api/journeys/active/${deviceId}`);
      const activeData = await activeRes.json() as ActiveData;
      setData(activeData);
      if (activeData.checkinDoneToday) setStep("done");

      // Gera desafio do dia com IA
      if (activeData.active && !activeData.checkinDoneToday) {
        const futureAdj = JSON.parse(
          await AsyncStorage.getItem("@meueu_future_adjectives") ?? "[]"
        ) as string[];

        const chalRes = await fetch(`${domain}/api/journeys/day-challenge`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            journeyId: id,
            day: activeData.active.currentDay,
            futureAdjectives: futureAdj,
          }),
        });
        const chalData = await chalRes.json();
        if (chalData.success) setChallenge(chalData.challenge);
      }
    } catch {}
    finally { setLoading(false); }
  }

  async function handleCheckin() {
    if (completed === null || (completed && note === 0)) {
      Alert.alert("Avalie sua prática", "Escolha uma nota antes de continuar.");
      return;
    }
    if (!data?.active) return;
    setSaving(true);
    try {
      const deviceId = await AsyncStorage.getItem("@meueu_device_id") ?? "unknown";
      await fetch(`${domain}/api/journeys/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId, journeyId: id,
          day: data.active.currentDay,
          completed, note: completed ? note : undefined,
          comment: comment || undefined,
        }),
      });
      if (completed) {
        const today = new Date().toISOString().split("T")[0];
        const xp = 10 + (note >= 5 ? 5 : note >= 4 ? 3 : 0);
        recordCheckin({
          date: today,
          completed: true,
          rating: note,
          hasNote: false,
          xpEarned: xp,
          streak: 0,
        });
      }
      setStep("done");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ActivityIndicator color="#1B6B5A" style={{ flex: 1 }} />
    </View>
  );

  const journey  = data?.journey;
  const active   = data?.active;
  const dayData  = data?.todayPractice;
  const color    = journey?.color ?? "#1B6B5A";
  const phase    = journey?.phases.find(p => p.number === active?.phase);

  if (!active || !dayData) return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Pressable onPress={() => router.back()} style={{ padding: 20 }}>
        <Feather name="arrow-left" size={20} color="#0F1F1B" />
      </Pressable>
      <Text style={{ textAlign: "center", color: "#6B8F7E", padding: 40 }}>
        Jornada não encontrada. Inicie uma jornada primeiro.
      </Text>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: color + "30" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0F1F1B" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{journey?.title}</Text>
          <Text style={styles.headerSub}>
            Fase {active.phase}: {phase?.title} · Dia {active.currentDay}/30
          </Text>
        </View>
        <Text style={[styles.dayBadge, { color, backgroundColor: color + "18" }]}>
          {data?.completionPct}%
        </Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${data?.completionPct ?? 0}%` as `${number}%`, backgroundColor: color }]} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* DONE */}
        {step === "done" && (
          <View style={styles.doneCard}>
            <View style={[styles.doneIcon, { backgroundColor: color + "18" }]}>
              <Feather name="check-circle" size={24} color={color} />
            </View>
            <Text style={styles.doneTitle}>Dia {active.currentDay} concluído</Text>
            <Text style={styles.doneSub}>
              {active.currentDay < 30
                ? `Próxima prática: Dia ${active.currentDay + 1}`
                : "Parabéns — você completou a jornada!"}
            </Text>
            <Pressable
              style={[styles.coachBtn, { borderColor: color }]}
              onPress={() => router.push({
                pathname: "/coach",
                params: {
                  practiceName: dayData.title,
                  practiceAbordagem: dayData.approach,
                  prefillMessage: `Acabei de completar o dia ${active.currentDay} da jornada "${journey?.title}". Quero refletir sobre a prática.`,
                },
              })}>
              <Feather name="message-circle" size={14} color={color} />
              <Text style={[styles.coachBtnText, { color }]}>Conversar com o coach</Text>
            </Pressable>
          </View>
        )}

        {/* CHALLENGE */}
        {step === "challenge" && (
          <View style={styles.card}>
            <View style={styles.tagRow}>
              <View style={[styles.tag, { backgroundColor: color + "18" }]}>
                <Text style={[styles.tagText, { color }]}>Dia {active.currentDay}</Text>
              </View>
              <Text style={[styles.tag2, { color: color + "AA" }]}>{dayData.approach}</Text>
            </View>
            <Text style={styles.challengeTitle}>
              {challenge?.titulo ?? dayData.title}
            </Text>
            <Text style={styles.challengeAction}>
              {challenge?.acao ?? dayData.description}
            </Text>
            {challenge?.dica && (
              <View style={styles.tipRow}>
                <Feather name="info" size={13} color="#6B8F7E" />
                <Text style={styles.tipText}>{challenge.dica}</Text>
              </View>
            )}
            <View style={styles.metaRow}>
              <Feather name="clock" size={12} color="#6B8F7E" />
              <Text style={styles.metaText}>{challenge?.tempo ?? dayData.duration}</Text>
              <Text style={styles.metaSep}>·</Text>
              <Text style={styles.metaText}>{dayData.technique}</Text>
            </View>
            <Pressable
              style={[styles.primaryBtn, { backgroundColor: color }]}
              onPress={() => setStep("checkin")}>
              <Text style={styles.primaryBtnText}>Fiz a prática</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.push({
                pathname: "/coach",
                params: {
                  practiceName: dayData.title,
                  practiceAbordagem: dayData.approach,
                  prefillMessage: `Tenho uma dúvida sobre a prática do dia ${active.currentDay}: "${dayData.title}"`,
                },
              })}>
              <Feather name="help-circle" size={14} color="#1B6B5A" />
              <Text style={styles.secondaryBtnText}>Tenho dúvida</Text>
            </Pressable>
          </View>
        )}

        {/* CHECKIN */}
        {step === "checkin" && (
          <View style={styles.card}>
            <Text style={styles.checkinTitle}>Como foi a prática?</Text>
            <Text style={styles.checkinSub}>{dayData.title} · Dia {active.currentDay}</Text>

            <Text style={styles.questionText}>Você conseguiu fazer?</Text>
            <View style={styles.yesNoRow}>
              {([true, false] as const).map(v => (
                <Pressable
                  key={String(v)}
                  style={[styles.yesNoBtn, completed === v && { backgroundColor: color, borderColor: color }]}
                  onPress={() => setCompleted(v)}>
                  <Feather name={v ? "check" : "x"} size={16} color={completed === v ? "#fff" : "#6B8F7E"} />
                  <Text style={[styles.yesNoBtnText, completed === v && { color: "#fff" }]}>
                    {v ? "Sim" : "Não consegui"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {completed && (
              <>
                <Text style={styles.questionText}>Como foi?</Text>
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
                <Text style={styles.reflectionLabel}>Pergunta de reflexão</Text>
                <Text style={styles.reflectionText}>"{challenge.perguntaReflexao}"</Text>
              </View>
            )}

            <TextInput
              style={styles.commentInput}
              placeholder="Observação opcional…"
              placeholderTextColor="#A8C0B8"
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <Pressable
              style={[styles.primaryBtn, { backgroundColor: color }, saving && { opacity: 0.6 }]}
              onPress={handleCheckin}
              disabled={saving}>
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.primaryBtnText}>Registrar</Text>}
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8F6" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderBottomWidth: 1, paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#0F1F1B" },
  headerSub: { fontSize: 11, color: "#6B8F7E", marginTop: 1 },
  dayBadge: { fontSize: 12, fontWeight: "700", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  progressBg: { height: 3, backgroundColor: "#E8F0ED" },
  progressFill: { height: "100%", borderRadius: 3 },
  content: { padding: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, borderWidth: 1, borderColor: "#E8F0ED" },
  tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  tag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "700" },
  tag2: { fontSize: 11, fontWeight: "600" },
  challengeTitle: { fontSize: 19, fontWeight: "700", color: "#0F1F1B", marginBottom: 8, lineHeight: 25 },
  challengeAction: { fontSize: 14, color: "#3D5A52", lineHeight: 22, marginBottom: 10 },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, backgroundColor: "#F5F8F6", borderRadius: 8, padding: 10, marginBottom: 10 },
  tipText: { fontSize: 12, color: "#6B8F7E", flex: 1, lineHeight: 18 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  metaText: { fontSize: 12, color: "#6B8F7E" },
  metaSep: { color: "#C8D8CC" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 13, marginBottom: 10 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  secondaryBtnText: { fontSize: 13, color: "#1B6B5A", fontWeight: "500" },
  checkinTitle: { fontSize: 18, fontWeight: "700", color: "#0F1F1B", marginBottom: 2 },
  checkinSub: { fontSize: 13, color: "#6B8F7E", marginBottom: 18 },
  questionText: { fontSize: 14, fontWeight: "600", color: "#0F1F1B", marginBottom: 10 },
  yesNoRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  yesNoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderColor: "#E8F0ED" },
  yesNoBtnText: { fontSize: 13, fontWeight: "600", color: "#6B8F7E" },
  noteRow: { flexDirection: "row", gap: 8, marginBottom: 6 },
  noteBtn: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: "#E8F0ED" },
  noteBtnNum: { fontSize: 16, fontWeight: "700", color: "#3D5A52" },
  noteLabel: { fontSize: 12, color: "#6B8F7E", textAlign: "center", marginBottom: 12 },
  reflectionBox: { backgroundColor: "#F5F8F6", borderRadius: 10, padding: 12, marginBottom: 12 },
  reflectionLabel: { fontSize: 10, fontWeight: "700", color: "#A8C0B8", textTransform: "uppercase", letterSpacing: .08, marginBottom: 4 },
  reflectionText: { fontSize: 13, color: "#3D5A52", lineHeight: 20, fontStyle: "italic" },
  commentInput: { borderWidth: 1, borderColor: "#E8F0ED", borderRadius: 10, padding: 12, fontSize: 14, color: "#0F1F1B", minHeight: 56, marginBottom: 14 },
  doneCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#E8F0ED" },
  doneIcon: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  doneTitle: { fontSize: 18, fontWeight: "700", color: "#0F1F1B", marginBottom: 4 },
  doneSub: { fontSize: 13, color: "#6B8F7E", textAlign: "center", marginBottom: 20 },
  coachBtn: { flexDirection: "row", alignItems: "center", gap: 7, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 18 },
  coachBtnText: { fontSize: 13, fontWeight: "600" },
});
