// artifacts/meueu/components/ApproachBadge.tsx
// Exibe a abordagem do eu futuro usada neste plano + pergunta âncora.
// Renderiza no topo da tela de resultado do plano.

import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

type Props = {
  approachName: string;
  anchorQuestion: string;
};

const APPROACH_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  tcc:       { bg: "#E8F5F1", text: "#0F4438", border: "#B8DDD4" },
  esquema:   { bg: "#EDF2FB", text: "#1A2F6B", border: "#B8C8F4" },
  cft:       { bg: "#FEF0E8", text: "#6B2A0A", border: "#F4C8A8" },
  narrativa: { bg: "#F5EEF8", text: "#4A1A6B", border: "#D4B8F4" },
  tfs:       { bg: "#E8F8F0", text: "#0A4A28", border: "#A8DFC0" },
  act:       { bg: "#FFFBE8", text: "#5A4000", border: "#F4DCA8" },
  gestalt:   { bg: "#F8EEE8", text: "#5A2A0A", border: "#F4C8A8" },
  humanista: { bg: "#EEF8F5", text: "#0A3A2A", border: "#A8D4C8" },
};

export default function ApproachBadge({ approachName, anchorQuestion }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Extrai a key do nome (ex: "TCC — Visualização..." → "tcc")
  const key = approachName.split("—")[0].trim().toLowerCase()
    .replace("terapia do esquema", "esquema")
    .replace("terapia narrativa", "narrativa")
    .replace("tfs", "tfs")
    .replace("act", "act")
    .replace("gestalt", "gestalt")
    .replace("cft", "cft")
    .replace("centrada na pessoa", "humanista")
    .replace("tcc", "tcc");

  const colors = APPROACH_COLORS[key] ?? APPROACH_COLORS.tcc;

  // Nome curto para exibir
  const shortName = approachName.split("—")[0].trim();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.bg, borderColor: colors.border }]}
      onPress={() => setExpanded(e => !e)}>
      <View style={styles.row}>
        <View style={styles.labelRow}>
          <Feather name="compass" size={13} color={colors.text} />
          <Text style={[styles.label, { color: colors.text + "99" }]}>Perspectiva desta jornada</Text>
        </View>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={colors.text + "99"}
        />
      </View>
      <Text style={[styles.name, { color: colors.text }]}>{shortName}</Text>

      {expanded && (
        <View style={[styles.questionBox, { borderTopColor: colors.border }]}>
          <Text style={[styles.questionLabel, { color: colors.text + "88" }]}>
            Pergunta para refletir hoje
          </Text>
          <Text style={[styles.question, { color: colors.text }]}>
            "{anchorQuestion}"
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14, borderWidth: 1,
    padding: 14, marginBottom: 16,
  },
  row: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 4,
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 11, fontWeight: "500" },
  name: { fontSize: 14, fontWeight: "700" },
  questionBox: {
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 1,
  },
  questionLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 },
  question: { fontSize: 13, lineHeight: 20, fontStyle: "italic" },
});
