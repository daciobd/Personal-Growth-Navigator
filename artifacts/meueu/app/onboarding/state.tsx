// artifacts/meueu/app/onboarding/state.tsx
// Tela 2 do novo onboarding: estado emocional atual.
// Pergunta: "Como você tem se sentido ultimamente?"
// Output: salva em @meueu_state_adjectives, usado como contexto no plano.
// NÃO alimenta o Big Five — alimenta o coaching contextual.

import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STATE_ADJECTIVES, type StateAdj } from "../../data/traitAdjectives";

type Domain = "todos" | "emocional" | "energia" | "relacoes" | "proposito" | "corpo";

const DOMAINS: { id: Domain; label: string; icon: string }[] = [
  { id: "todos",     label: "Todos",       icon: "grid" },
  { id: "emocional", label: "Emoções",     icon: "heart" },
  { id: "energia",   label: "Energia",     icon: "zap" },
  { id: "relacoes",  label: "Relações",    icon: "users" },
  { id: "proposito", label: "Propósito",   icon: "compass" },
  { id: "corpo",     label: "Corpo",       icon: "activity" },
];

export default function StateScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected]   = useState<string[]>([]);
  const [domain, setDomain]       = useState<Domain>("todos");

  const filtered = domain === "todos"
    ? STATE_ADJECTIVES
    : STATE_ADJECTIVES.filter(a => a.domain === domain);

  // Separar em positivos e negativos para exibição
  const negatives = filtered.filter(a => a.valence === "negative");
  const positives = filtered.filter(a => a.valence === "positive");

  function toggle(text: string) {
    setSelected(prev =>
      prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]
    );
  }

  // Resumo do estado para mostrar ao usuário
  const selectedNeg = selected.filter(s =>
    STATE_ADJECTIVES.find(a => a.text === s && a.valence === "negative")
  );
  const selectedPos = selected.filter(s =>
    STATE_ADJECTIVES.find(a => a.text === s && a.valence === "positive")
  );

  async function handleContinue() {
    await AsyncStorage.setItem("@meueu_state_adjectives", JSON.stringify(selected));
    // Também atualiza a chave legada para compatibilidade
    await AsyncStorage.setItem("@meueu_current_adjectives", JSON.stringify(selected));
    router.push("/onboarding/future");
  }

  function renderChip(adj: StateAdj) {
    const isSelected = selected.includes(adj.text);
    const isPositive = adj.valence === "positive";
    return (
      <Pressable
        key={adj.text}
        style={[
          styles.chip,
          isSelected && (isPositive ? styles.chipSelectedPos : styles.chipSelectedNeg),
          !isSelected && isPositive && styles.chipUnselectedPos,
        ]}
        onPress={() => toggle(adj.text)}>
        <Text style={[
          styles.chipText,
          isSelected && styles.chipTextSelected,
          !isSelected && isPositive && styles.chipTextPos,
        ]}>
          {adj.text}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0F1F1B" />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "66%" }]} />
        </View>
        <Text style={styles.stepLabel}>Etapa 2 de 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Título */}
        <View style={styles.iconWrap}>
          <Feather name="thermometer" size={24} color="#C4622D" />
        </View>
        <Text style={styles.title}>Como você está</Text>
        <Text style={styles.subtitle}>
          Selecione como você tem se sentido{" "}
          <Text style={styles.bold}>nas últimas semanas</Text>.
          Isso ajuda a IA a entender seu contexto atual.
        </Text>

        {/* Distinção traço vs estado */}
        <View style={styles.diffBox}>
          <View style={styles.diffItem}>
            <View style={[styles.diffDot, { backgroundColor: "#1B6B5A" }]} />
            <Text style={styles.diffText}>
              <Text style={{ fontWeight: "700" }}>Personalidade</Text> (tela anterior) — como você tende a ser sempre
            </Text>
          </View>
          <View style={styles.diffItem}>
            <View style={[styles.diffDot, { backgroundColor: "#C4622D" }]} />
            <Text style={styles.diffText}>
              <Text style={{ fontWeight: "700" }}>Estado atual</Text> (esta tela) — como você está agora
            </Text>
          </View>
        </View>

        {/* Filtro de domínio */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.domainScroll}>
          {DOMAINS.map(d => (
            <Pressable
              key={d.id}
              style={[styles.domChip, domain === d.id && styles.domChipActive]}
              onPress={() => setDomain(d.id)}>
              <Feather
                name={d.icon as any}
                size={12}
                color={domain === d.id ? "#fff" : "#6B8F7E"}
              />
              <Text style={[styles.domLabel, domain === d.id && styles.domLabelActive]}>
                {d.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Adjetivos negativos */}
        {negatives.length > 0 && (
          <>
            <Text style={styles.groupLabel}>Desafios atuais</Text>
            <View style={styles.grid}>
              {negatives.map(renderChip)}
            </View>
          </>
        )}

        {/* Adjetivos positivos */}
        {positives.length > 0 && (
          <>
            <Text style={[styles.groupLabel, { color: "#1B6B5A", marginTop: 16 }]}>
              O que está fluindo
            </Text>
            <View style={styles.grid}>
              {positives.map(renderChip)}
            </View>
          </>
        )}

        {/* Resumo visual */}
        {selected.length > 0 && (
          <View style={styles.summaryBox}>
            {selectedNeg.length > 0 && (
              <View style={styles.summaryRow}>
                <Feather name="cloud" size={13} color="#C4622D" />
                <Text style={styles.summaryText}>
                  <Text style={{ fontWeight: "700", color: "#C4622D" }}>Desafios: </Text>
                  {selectedNeg.join(", ")}
                </Text>
              </View>
            )}
            {selectedPos.length > 0 && (
              <View style={styles.summaryRow}>
                <Feather name="sun" size={13} color="#1B6B5A" />
                <Text style={styles.summaryText}>
                  <Text style={{ fontWeight: "700", color: "#1B6B5A" }}>Fluindo: </Text>
                  {selectedPos.join(", ")}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <Pressable
          style={[styles.continueBtn, selected.length === 0 && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={selected.length === 0}>
          <Text style={styles.continueBtnText}>
            {selected.length === 0
              ? "Selecione pelo menos 1 adjetivo"
              : `Continuar com ${selected.length} selecionados`}
          </Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </Pressable>
        <Pressable
          style={styles.skipBtn}
          onPress={() => {
            AsyncStorage.setItem("@meueu_state_adjectives", "[]");
            router.push("/onboarding/future");
          }}>
          <Text style={styles.skipText}>Pular esta etapa</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8F6" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E8F0ED" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  progressBar: { flex: 1, height: 4, backgroundColor: "#E8F0ED", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#C4622D", borderRadius: 2 },
  stepLabel: { fontSize: 12, color: "#6B8F7E", fontWeight: "600" },
  content: { padding: 16 },
  iconWrap: { width: 44, height: 44, backgroundColor: "#FEF0E8", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F1F1B", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B8F7E", lineHeight: 22, marginBottom: 12 },
  bold: { fontWeight: "700", color: "#0F1F1B" },
  diffBox: { backgroundColor: "#fff", borderRadius: 12, padding: 12, gap: 8, marginBottom: 16, borderWidth: 1, borderColor: "#E8F0ED" },
  diffItem: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  diffDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  diffText: { flex: 1, fontSize: 12, color: "#6B8F7E", lineHeight: 18 },
  domainScroll: { marginBottom: 14 },
  domChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8F0ED", marginRight: 8 },
  domChipActive: { backgroundColor: "#C4622D", borderColor: "#C4622D" },
  domLabel: { fontSize: 12, fontWeight: "600", color: "#6B8F7E" },
  domLabelActive: { color: "#fff" },
  groupLabel: { fontSize: 11, fontWeight: "700", color: "#C4622D", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#D8E8E4", backgroundColor: "#fff" },
  chipSelectedNeg: { backgroundColor: "#C4622D", borderColor: "#C4622D" },
  chipSelectedPos: { backgroundColor: "#1B6B5A", borderColor: "#1B6B5A" },
  chipUnselectedPos: { borderColor: "#1B6B5A44", backgroundColor: "#E8F5F1" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#3D5A52" },
  chipTextSelected: { color: "#fff" },
  chipTextPos: { color: "#1B6B5A" },
  summaryBox: { backgroundColor: "#fff", borderRadius: 12, padding: 14, marginTop: 16, gap: 8, borderWidth: 1, borderColor: "#E8F0ED" },
  summaryRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  summaryText: { flex: 1, fontSize: 12, color: "#3D5A52", lineHeight: 18 },
  footer: { backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E8F0ED", padding: 16, gap: 8 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#C4622D", borderRadius: 14, paddingVertical: 14 },
  continueBtnDisabled: { backgroundColor: "#D4A898" },
  continueBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontSize: 13, color: "#A8C0B8" },
});
