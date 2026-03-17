// artifacts/meueu/app/onboarding/traits.tsx
// Tela 1 do novo onboarding: traços de personalidade estáveis.
// Pergunta: "Como você tende a ser na maioria das situações?"
// Output: salva em @meueu_trait_adjectives, usado para estimar Big Five.

import React, { useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRAIT_ADJECTIVES, type TraitAdj } from "../../data/traitAdjectives";
import Big5LivePreview from "../../components/Big5LivePreview";

type Category = "todos" | "neuroticismo" | "extroversao" | "abertura" | "amabilidade" | "conscienciosidade";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "todos",               label: "Todos" },
  { id: "neuroticismo",        label: "Estabilidade emocional" },
  { id: "extroversao",         label: "Energia social" },
  { id: "abertura",            label: "Abertura" },
  { id: "amabilidade",         label: "Relacionamentos" },
  { id: "conscienciosidade",   label: "Organização" },
];

export default function TraitsScreen() {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const [category, setCategory] = useState<Category>("todos");
  const [showPreview, setShowPreview] = useState(false);

  const filtered = (() => {
    const list = category === "todos"
      ? TRAIT_ADJECTIVES
      : TRAIT_ADJECTIVES.filter(a => a.category === category);
    if (category !== "todos") return list;
    const seen = new Set<string>();
    return list.filter(a => {
      if (seen.has(a.text)) return false;
      seen.add(a.text);
      return true;
    });
  })();

  function toggle(text: string) {
    setSelected(prev =>
      prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]
    );
  }

  async function handleContinue() {
    await AsyncStorage.setItem("@meueu_trait_adjectives", JSON.stringify(selected));
    router.push("/onboarding/state");
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color="#0F1F1B" />
        </Pressable>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: "33%" }]} />
        </View>
        <Text style={styles.stepLabel}>Etapa 1 de 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Título */}
        <View style={styles.iconWrap}>
          <Feather name="user" size={24} color="#1B6B5A" />
        </View>
        <Text style={styles.title}>Sua personalidade</Text>
        <Text style={styles.subtitle}>
          Selecione os adjetivos que descrevem como você{" "}
          <Text style={styles.bold}>tende a ser</Text> na maioria das situações —
          independentemente de como está se sentindo hoje.
        </Text>

        {/* Dica */}
        <View style={styles.tipBox}>
          <Feather name="info" size={13} color="#1B6B5A" />
          <Text style={styles.tipText}>
            Pense em como amigos próximos te descreveriam. Inclua tanto pontos fortes quanto padrões que quer mudar.
          </Text>
        </View>

        {/* Categorias */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.id}
              style={[styles.catChip, category === cat.id && styles.catChipActive]}
              onPress={() => setCategory(cat.id)}>
              <Text style={[styles.catLabel, category === cat.id && styles.catLabelActive]}>
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Adjetivos */}
        <View style={styles.grid}>
          {filtered.map(adj => {
            const isSelected = selected.includes(adj.text);
            const isPositive = adj.valence === "positive";
            return (
              <Pressable
                key={adj.text + adj.category}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  !isSelected && isPositive && styles.chipPositive,
                ]}
                onPress={() => toggle(adj.text)}>
                <Text style={[
                  styles.chipText,
                  isSelected && styles.chipTextSelected,
                  !isSelected && isPositive && styles.chipTextPositive,
                ]}>
                  {adj.text}
                </Text>
                {adj.example && !isSelected && (
                  <Text style={styles.chipExample} numberOfLines={1}>
                    {adj.example}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Preview Big Five */}
        {selected.length >= 3 && (
          <View style={{ marginTop: 16 }}>
            <Pressable
              style={styles.previewToggle}
              onPress={() => setShowPreview(p => !p)}>
              <Feather name="bar-chart-2" size={14} color="#1B6B5A" />
              <Text style={styles.previewToggleText}>
                {showPreview ? "Esconder prévia Big Five" : "Ver prévia Big Five"}
              </Text>
              <Feather name={showPreview ? "chevron-up" : "chevron-down"} size={14} color="#1B6B5A" />
            </Pressable>
            {showPreview && (
              <Big5LivePreview currentAdjectives={selected} compact={false} />
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      {selected.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.selectedTags}>
            {selected.slice(0, 4).map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
                <Pressable onPress={() => toggle(t)}>
                  <Feather name="x" size={11} color="#1B6B5A" />
                </Pressable>
              </View>
            ))}
            {selected.length > 4 && (
              <Text style={styles.moreTag}>+{selected.length - 4}</Text>
            )}
          </View>
          <Pressable
            style={[styles.continueBtn, selected.length < 5 && styles.continueBtnDisabled]}
            onPress={handleContinue}
            disabled={selected.length < 5}>
            <Text style={styles.continueBtnText}>
              {selected.length < 5
                ? `Selecione mais ${5 - selected.length}`
                : `Continuar com ${selected.length} selecionados`}
            </Text>
            <Feather name="arrow-right" size={16} color="#fff" />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F5F8F6" },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E8F0ED" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  progressBar: { flex: 1, height: 4, backgroundColor: "#E8F0ED", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#1B6B5A", borderRadius: 2 },
  stepLabel: { fontSize: 12, color: "#6B8F7E", fontWeight: "600" },
  content: { padding: 16 },
  iconWrap: { width: 44, height: 44, backgroundColor: "#E8F5F1", borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F1F1B", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6B8F7E", lineHeight: 22, marginBottom: 12 },
  bold: { fontWeight: "700", color: "#0F1F1B" },
  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: "#E8F5F1", borderRadius: 10, padding: 12, marginBottom: 16 },
  tipText: { flex: 1, fontSize: 12, color: "#1B6B5A", lineHeight: 18 },
  catScroll: { marginBottom: 14 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8F0ED", marginRight: 8 },
  catChipActive: { backgroundColor: "#1B6B5A", borderColor: "#1B6B5A" },
  catLabel: { fontSize: 12, fontWeight: "600", color: "#6B8F7E" },
  catLabelActive: { color: "#fff" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: "#D8E8E4", backgroundColor: "#fff" },
  chipSelected: { backgroundColor: "#1B6B5A", borderColor: "#1B6B5A" },
  chipPositive: { borderColor: "#1B6B5A44", backgroundColor: "#E8F5F1" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#3D5A52" },
  chipTextSelected: { color: "#fff" },
  chipTextPositive: { color: "#1B6B5A" },
  chipExample: { fontSize: 10, color: "#A8C0B8", marginTop: 2 },
  previewToggle: { flexDirection: "row", alignItems: "center", gap: 7, justifyContent: "center", paddingVertical: 10, backgroundColor: "#E8F5F1", borderRadius: 10, marginBottom: 4 },
  previewToggleText: { fontSize: 13, fontWeight: "600", color: "#1B6B5A" },
  footer: { backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#E8F0ED", padding: 16, gap: 10 },
  selectedTags: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#E8F5F1", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  tagText: { fontSize: 12, color: "#1B6B5A", fontWeight: "600" },
  moreTag: { fontSize: 12, color: "#6B8F7E", fontWeight: "600", paddingVertical: 5 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#1B6B5A", borderRadius: 14, paddingVertical: 14 },
  continueBtnDisabled: { backgroundColor: "#A8C0B8" },
  continueBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
