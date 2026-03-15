import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { RadarChart } from "@/components/RadarChart";
import { DIMENSION_INFO, BIG5_STORAGE_KEY, type StoredBig5, type Dimension } from "@/data/big5";

const DIMENSIONS: Dimension[] = ["O", "C", "E", "A", "N"];
const REASSESS_DAYS = 28;

export function AssessmentEntry() {
  const colors = Colors.light;
  const [stored, setStored] = useState<StoredBig5 | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(BIG5_STORAGE_KEY)
      .then((raw) => {
        if (raw) setStored(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (!stored) {
    return (
      <Pressable
        onPress={() => router.push("/assessment")}
        style={[styles.inviteCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      >
        <View style={[styles.inviteIcon, { backgroundColor: "#EAF2EF" }]}>
          <Feather name="activity" size={22} color={colors.primary} />
        </View>
        <View style={styles.inviteTexts}>
          <Text style={[styles.inviteTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Perfil de Personalidade
          </Text>
          <Text style={[styles.inviteSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Descubra seus Big Five — 120 itens, ~10 min
          </Text>
          <View style={styles.dimRow}>
            {DIMENSIONS.map((d) => (
              <View key={d} style={[styles.dimDot, { backgroundColor: DIMENSION_INFO[d].color }]}>
                <Text style={styles.dimDotText}>{DIMENSION_INFO[d].name[0]}</Text>
              </View>
            ))}
          </View>
        </View>
        <Feather name="arrow-right" size={18} color={colors.textMuted} />
      </Pressable>
    );
  }

  const completedAt = new Date(stored.completedAt);
  const daysSince = Math.floor((Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
  const daysUntilReassess = Math.max(0, REASSESS_DAYS - daysSince);

  const radarData = DIMENSIONS.map((d) => ({
    label: DIMENSION_INFO[d].name,
    value: stored.scores[d],
    color: DIMENSION_INFO[d].color,
  }));

  return (
    <Pressable
      onPress={() => router.push("/assessment/result")}
      style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.resultTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Seu Perfil Big Five
        </Text>
        <View style={[styles.reassessBadge, { backgroundColor: colors.background }]}>
          <Feather name="clock" size={11} color={colors.textMuted} />
          <Text style={[styles.reassessText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {daysUntilReassess > 0
              ? `Reavaliação em ${daysUntilReassess}d`
              : "Reavaliação disponível"}
          </Text>
        </View>
      </View>

      <View style={styles.miniChartRow}>
        <RadarChart data={radarData} size={140} />
        <View style={styles.scoreList}>
          {DIMENSIONS.map((d) => (
            <View key={d} style={styles.scoreRow}>
              <View style={[styles.scoreDot, { backgroundColor: DIMENSION_INFO[d].color }]} />
              <Text style={[styles.scoreDim, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                {DIMENSION_INFO[d].name}
              </Text>
              <Text style={[styles.scoreValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {stored.scores[d]}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {daysUntilReassess === 0 && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            router.push("/assessment");
          }}
          style={[styles.reassessBtn, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.reassessBtnText, { fontFamily: "Inter_600SemiBold" }]}>
            Refazer avaliação
          </Text>
        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  inviteIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  inviteTexts: { flex: 1, gap: 6 },
  inviteTitle: { fontSize: 15 },
  inviteSub: { fontSize: 12, lineHeight: 16 },
  dimRow: { flexDirection: "row", gap: 5, marginTop: 2 },
  dimDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dimDotText: { fontSize: 9, color: "#fff", fontWeight: "700" },
  resultCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultTitle: { fontSize: 15 },
  reassessBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  reassessText: { fontSize: 11 },
  miniChartRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreList: { flex: 1, gap: 6 },
  scoreRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scoreDot: { width: 8, height: 8, borderRadius: 4 },
  scoreDim: { flex: 1, fontSize: 12 },
  scoreValue: { fontSize: 13 },
  reassessBtn: {
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  reassessBtnText: { fontSize: 14, color: "#fff" },
});
