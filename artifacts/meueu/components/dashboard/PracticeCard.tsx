import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { shadow } from "@/constants/tokens";
import type { Practice } from "@/context/AppContext";

const APPROACH_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8", icon: "edit-3" },
  ACT: { bg: "#F0FDF4", text: "#166534", icon: "compass" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8", icon: "star" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  "Atenção Plena": { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  DBT: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  CFT: { bg: "#FDF2F8", text: "#86198F", icon: "heart" },
};

type CheckinStatus = "done" | "missed";

type Props = {
  practice: Practice;
  practiceIdx: number;
  status: CheckinStatus | null;
  expanded: boolean;
  onToggleExpand: () => void;
  onCheckin: (status: CheckinStatus) => void;
};

export default function PracticeCard({
  practice,
  practiceIdx,
  status,
  expanded,
  onToggleExpand,
  onCheckin,
}: Props) {
  const colors = Colors.light;
  const aColor = APPROACH_COLORS[practice.abordagem] ?? {
    bg: "#F5F5F5",
    text: "#555",
    icon: "activity",
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: status === "done"
            ? "#22C55E40"
            : status === "missed"
            ? "#EF444430"
            : colors.cardBorder,
          borderWidth: status ? 1.5 : 1,
        },
      ]}
    >
      {/* Cabeçalho: ícone + badge + nome + status */}
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: aColor.bg }]}>
          <Feather name={aColor.icon as any} size={15} color={aColor.text} />
        </View>
        <View style={styles.headerText}>
          <View style={[styles.badge, { backgroundColor: aColor.bg }]}>
            <Text
              style={[
                styles.badgeText,
                { color: aColor.text, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {practice.abordagem}
            </Text>
          </View>
          <Text
            style={[
              styles.name,
              { color: colors.text, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {practice.nome}
          </Text>
        </View>
        {status === "done" && (
          <Feather name="check-circle" size={16} color="#22C55E" />
        )}
        {status === "missed" && (
          <Feather name="x-circle" size={16} color="#EF4444" />
        )}
      </View>

      {/* Justificativa — 1 linha expansível */}
      <Text
        style={[
          styles.desc,
          { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
        ]}
        numberOfLines={expanded ? undefined : 1}
        ellipsizeMode="tail"
      >
        {practice.justificativa}
      </Text>
      <Pressable onPress={onToggleExpand}>
        <Text
          style={[
            styles.toggle,
            { color: colors.primary, fontFamily: "Inter_500Medium" },
          ]}
        >
          {expanded ? "ver menos" : "ver mais"}
        </Text>
      </Pressable>

      {/* Frequência */}
      <View style={styles.freqRow}>
        <Feather name="clock" size={11} color={colors.textMuted} />
        <Text
          style={[
            styles.freqText,
            { color: colors.textMuted, fontFamily: "Inter_400Regular" },
          ]}
        >
          {practice.frequencia}
        </Text>
      </View>

      {/* CTA: Ver como fazer */}
      <Pressable
        style={({ pressed }) => [
          styles.verBtn,
          { borderColor: aColor.text, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={() =>
          router.push({
            pathname: "/intervention/[id]",
            params: {
              id: `plan-${practiceIdx}`,
              practice: JSON.stringify(practice),
            },
          })
        }
      >
        <Text
          style={[
            styles.verBtnText,
            { color: aColor.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Ver como fazer
        </Text>
        <Feather name="arrow-right" size={13} color={aColor.text} />
      </Pressable>

      {/* Check-in secundário (outline) */}
      {!status ? (
        <View style={styles.checkinRow}>
          <Pressable
            style={[styles.checkinBtn, { borderColor: "#22C55E" }]}
            onPress={() => onCheckin("done")}
          >
            <Feather name="check" size={12} color="#22C55E" />
            <Text
              style={[
                styles.checkinText,
                { color: "#22C55E", fontFamily: "Inter_500Medium" },
              ]}
            >
              Fiz
            </Text>
          </Pressable>
          <Pressable
            style={[styles.checkinBtn, { borderColor: "#D1D5DB" }]}
            onPress={() => onCheckin("missed")}
          >
            <Feather name="x" size={12} color="#9CA3AF" />
            <Text
              style={[
                styles.checkinText,
                { color: "#9CA3AF", fontFamily: "Inter_500Medium" },
              ]}
            >
              Não consegui
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={styles.undoRow}
          onPress={() => onCheckin(status === "done" ? "missed" : "done")}
        >
          <Feather name="rotate-ccw" size={10} color={colors.textMuted} />
          <Text
            style={[
              styles.undoText,
              { color: colors.textMuted, fontFamily: "Inter_400Regular" },
            ]}
          >
            {status === "done" ? "Marcado como feito" : "Não feito"} · desfazer
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
    ...shadow.soft,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerText: { flex: 1, gap: 3 },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeText: { fontSize: 10 },
  name: { fontSize: 14, lineHeight: 19 },
  desc: { fontSize: 13, lineHeight: 18 },
  toggle: { fontSize: 12, marginTop: -4 },
  freqRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  freqText: { fontSize: 11 },
  verBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 9,
  },
  verBtnText: { fontSize: 13 },
  checkinRow: { flexDirection: "row", gap: 8 },
  checkinBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkinText: { fontSize: 12 },
  undoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  undoText: { fontSize: 11 },
});
