// artifacts/meueu/app/journeys/index.tsx
// Tela de catálogo de jornadas — lista as 6 jornadas disponíveis.
// Rota: /journeys

import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  ActivityIndicator, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { getApiUrl } from "@/utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

type JourneyMeta = {
  id: string; title: string; subtitle: string;
  description: string; color: string; icon: string;
  totalDays: number;
  phases: Array<{ number: number; title: string; description: string }>;
};

type ActiveJourney = {
  journeyId: string; currentDay: number; phase: number;
  completionPct: number; status: string;
};

export default function JourneysCatalog() {
  const insets = useSafeAreaInsets();
  const [journeys, setJourneys]     = useState<JourneyMeta[]>([]);
  const [active, setActive]         = useState<ActiveJourney | null>(null);
  const [loading, setLoading]       = useState(true);
  const [starting, setStarting]     = useState<string | null>(null);

  const domain = getApiUrl();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!domain) { setLoading(false); return; }
    const deviceId = await AsyncStorage.getItem("@meueu_device_id") ?? "unknown";
    try {
      const [catRes, activeRes] = await Promise.all([
        fetch(`${domain}/api/journeys`),
        fetch(`${domain}/api/journeys/active/${deviceId}`),
      ]);
      const catData   = await catRes.json();
      const activeData = await activeRes.json();
      setJourneys(catData.journeys ?? []);
      setActive(activeData.active ?? null);
    } catch {}
    finally { setLoading(false); }
  }

  async function startJourney(journeyId: string) {
    if (!domain) return;
    setStarting(journeyId);
    try {
      const deviceId = await AsyncStorage.getItem("@meueu_device_id") ?? "unknown";
      const res = await fetch(`${domain}/api/journeys/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, journeyId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push({ pathname: "/journeys/[id]", params: { id: journeyId } });
      }
    } catch {
      Alert.alert("Erro", "Não foi possível iniciar a jornada.");
    } finally {
      setStarting(null);
    }
  }

  if (loading) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#1B6B5A" style={{ flex: 1 }} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0F1F1B" />
        </Pressable>
        <Text style={styles.headerTitle}>Jornadas de 30 dias</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Jornada ativa */}
        {active && (
          <Pressable
            style={styles.activeCard}
            onPress={() => router.push({ pathname: "/journeys/[id]", params: { id: active.journeyId } })}>
            <View style={styles.activeRow}>
              <View style={styles.activeDot} />
              <Text style={styles.activeLabel}>Jornada em andamento</Text>
            </View>
            <Text style={styles.activeName}>
              {journeys.find(j => j.id === active.journeyId)?.title ?? active.journeyId}
            </Text>
            <View style={styles.progressRow}>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${active.completionPct}%` as `${number}%` }]} />
              </View>
              <Text style={styles.progressPct}>
                Dia {active.currentDay}/30 · {active.completionPct}%
              </Text>
            </View>
          </Pressable>
        )}

        <Text style={styles.sectionTitle}>Escolha sua próxima jornada</Text>
        <Text style={styles.sectionSub}>
          Trilhas de 30 dias organizadas em 3 fases. Cada dia, uma prática de 10-30 minutos.
        </Text>

        {journeys.map(j => {
          const isActive  = active?.journeyId === j.id;
          const isStarting = starting === j.id;
          return (
            <View key={j.id} style={[styles.card, { borderLeftColor: j.color, borderLeftWidth: 4 }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: j.color + "18" }]}>
                  <Feather name={j.icon as keyof typeof Feather.glyphMap} size={20} color={j.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{j.title}</Text>
                  <Text style={styles.cardSubtitle}>{j.subtitle}</Text>
                </View>
                <View style={[styles.daysBadge, { backgroundColor: j.color + "18" }]}>
                  <Text style={[styles.daysBadgeText, { color: j.color }]}>30 dias</Text>
                </View>
              </View>
              <Text style={styles.cardDesc}>{j.description}</Text>

              {/* Fases */}
              <View style={styles.phasesRow}>
                {j.phases.map(p => (
                  <View key={p.number} style={styles.phaseChip}>
                    <Text style={styles.phaseNum}>{p.number}</Text>
                    <Text style={styles.phaseTitle}>{p.title}</Text>
                  </View>
                ))}
              </View>

              <Pressable
                style={[
                  styles.startBtn,
                  { backgroundColor: isActive ? j.color + "18" : j.color },
                  isStarting && { opacity: 0.6 },
                ]}
                onPress={() => isActive
                  ? router.push({ pathname: "/journeys/[id]", params: { id: j.id } })
                  : startJourney(j.id)}
                disabled={isStarting}>
                {isStarting
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <>
                      <Text style={[styles.startBtnText, isActive && { color: j.color }]}>
                        {isActive ? "Continuar jornada" : "Iniciar jornada"}
                      </Text>
                      <Feather name="arrow-right" size={15} color={isActive ? j.color : "#fff"} />
                    </>
                }
              </Pressable>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8F6" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E8F0ED", paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#0F1F1B" },
  content: { padding: 16 },
  activeCard: { backgroundColor: "#1B6B5A", borderRadius: 16, padding: 18, marginBottom: 20 },
  activeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#5CD1A0" },
  activeLabel: { fontSize: 11, fontWeight: "600", color: "rgba(255,255,255,.7)", textTransform: "uppercase", letterSpacing: .08 },
  activeName: { fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 },
  progressRow: { gap: 6 },
  progressBg: { height: 5, backgroundColor: "rgba(255,255,255,.2)", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#5CD1A0", borderRadius: 3 },
  progressPct: { fontSize: 12, color: "rgba(255,255,255,.7)" },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#0F1F1B", marginBottom: 6 },
  sectionSub: { fontSize: 13, color: "#6B8F7E", lineHeight: 20, marginBottom: 20 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: "#E8F0ED" },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  iconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0F1F1B", marginBottom: 2 },
  cardSubtitle: { fontSize: 12, color: "#6B8F7E" },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  daysBadgeText: { fontSize: 11, fontWeight: "700" },
  cardDesc: { fontSize: 13, color: "#6B8F7E", lineHeight: 20, marginBottom: 14 },
  phasesRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  phaseChip: { flex: 1, backgroundColor: "#F5F8F6", borderRadius: 8, padding: 8, alignItems: "center" },
  phaseNum: { fontSize: 10, fontWeight: "700", color: "#A8C0B8", marginBottom: 2 },
  phaseTitle: { fontSize: 11, fontWeight: "600", color: "#3D5A52", textAlign: "center" },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 12 },
  startBtnText: { fontSize: 14, fontWeight: "700", color: "#fff" },
});
