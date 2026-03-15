import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { RadarChart } from "@/components/RadarChart";
import {
  BIG5_STORAGE_KEY,
  DIMENSION_INFO,
  FACET_INFO,
  qualitativeLevel,
  type Big5Scores,
  type Dimension,
  type FacetKey,
  type StoredBig5,
} from "@/data/big5";
import { getApiUrl } from "@/utils/api";

const DIMENSIONS: Dimension[] = ["O", "C", "E", "A", "N"];
const domain = getApiUrl();

type Tab = "overview" | "facets";

export default function AssessmentResultScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [stored, setStored] = useState<StoredBig5 | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loadingInterp, setLoadingInterp] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(BIG5_STORAGE_KEY).then((raw) => {
      if (raw) {
        const data: StoredBig5 = JSON.parse(raw);
        setStored(data);
        fetchInterpretation(data.scores);
      } else {
        setLoadingInterp(false);
      }
    });
  }, []);

  async function fetchInterpretation(scores: Big5Scores) {
    setLoadingInterp(true);
    try {
      const res = await fetch(`${domain}/api/assessment/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      if (res.ok) {
        const data = await res.json();
        setInterpretation(data.interpretation);
      }
    } catch {
      // silently fallback
    }
    setLoadingInterp(false);
  }

  if (!stored) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          Carregando resultado...
        </Text>
      </View>
    );
  }

  const { scores } = stored;
  const completedDate = new Date(stored.completedAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const radarData = DIMENSIONS.map((d) => ({
    label: DIMENSION_INFO[d].name,
    value: scores[d],
    color: DIMENSION_INFO[d].color,
  }));

  const facetsByDim: Record<Dimension, FacetKey[]> = {
    O: ["O1", "O2", "O3", "O4", "O5", "O6"],
    C: ["C1", "C2", "C3", "C4", "C5", "C6"],
    E: ["E1", "E2", "E3", "E4", "E5", "E6"],
    A: ["A1", "A2", "A3", "A4", "A5", "A6"],
    N: ["N1", "N2", "N3", "N4", "N5", "N6"],
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Platform.OS === "web" ? 67 : insets.top + 8,
            borderBottomColor: colors.cardBorder,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Seu Perfil Big Five
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {completedDate}
          </Text>
        </View>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        {(["overview", "facets"] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: tab === t ? colors.primary : colors.textMuted,
                  fontFamily: tab === t ? "Inter_600SemiBold" : "Inter_400Regular",
                },
              ]}
            >
              {t === "overview" ? "Visao geral" : "30 Facetas"}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 + 20 : insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {tab === "overview" && (
          <>
            {/* Radar */}
            <View style={[styles.radarCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <RadarChart data={radarData} size={280} />
              <View style={styles.legendRow}>
                {DIMENSIONS.map((d) => (
                  <View key={d} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: DIMENSION_INFO[d].color }]} />
                    <Text style={[styles.legendName, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                      {DIMENSION_INFO[d].name}
                    </Text>
                    <Text style={[styles.legendScore, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                      {scores[d]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* AI Interpretation */}
            <View style={[styles.interpCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.interpHeader}>
                <Feather name="zap" size={16} color={colors.primary} />
                <Text style={[styles.interpTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  Interpretacao personalizada
                </Text>
              </View>
              {loadingInterp ? (
                <View style={styles.interpLoading}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={[styles.interpLoadingText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                    Gerando interpretacao com IA...
                  </Text>
                </View>
              ) : (
                <Text style={[styles.interpText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                  {interpretation ?? "Nao foi possivel gerar a interpretacao no momento."}
                </Text>
              )}
            </View>

            {/* Dimension cards */}
            {DIMENSIONS.map((d) => {
              const info = DIMENSION_INFO[d];
              const score = scores[d];
              const level = qualitativeLevel(score);
              return (
                <View
                  key={d}
                  style={[styles.dimCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                >
                  <View style={styles.dimCardHeader}>
                    <View style={[styles.dimColorBar, { backgroundColor: info.color }]} />
                    <View style={styles.dimCardTitles}>
                      <Text style={[styles.dimCardName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                        {info.fullName}
                      </Text>
                      <Text style={[styles.dimCardLevel, { color: info.color, fontFamily: "Inter_600SemiBold" }]}>
                        {level} — {score}%
                      </Text>
                    </View>
                  </View>
                  {/* Progress bar */}
                  <View style={[styles.barTrack, { backgroundColor: colors.background }]}>
                    <View
                      style={[
                        styles.barFill,
                        { backgroundColor: info.color, width: `${score}%` as any },
                      ]}
                    />
                  </View>
                  <Text style={[styles.dimCardDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                    {info.description}
                  </Text>
                  <View style={[styles.dimCardFooter, { backgroundColor: colors.background }]}>
                    <View style={styles.dimCardFooterRow}>
                      <Feather name="arrow-down-circle" size={13} color={colors.textMuted} />
                      <Text style={[styles.dimCardFooterText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                        {info.lowDesc}
                      </Text>
                    </View>
                    <View style={styles.dimCardFooterRow}>
                      <Feather name="arrow-up-circle" size={13} color={info.color} />
                      <Text style={[styles.dimCardFooterText, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                        {info.highDesc}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </>
        )}

        {tab === "facets" && (
          <>
            {DIMENSIONS.map((d) => {
              const info = DIMENSION_INFO[d];
              return (
                <View key={d} style={[styles.facetGroup, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.facetGroupHeader}>
                    <View style={[styles.dimColorBar, { backgroundColor: info.color }]} />
                    <Text style={[styles.facetGroupTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                      {info.fullName}
                    </Text>
                    <Text style={[styles.facetGroupScore, { color: info.color, fontFamily: "Inter_700Bold" }]}>
                      {scores[d]}%
                    </Text>
                  </View>
                  <View style={styles.facetList}>
                    {facetsByDim[d].map((fk) => {
                      const facet = FACET_INFO[fk];
                      const facetScore = scores.facets[fk] ?? 50;
                      return (
                        <View key={fk} style={styles.facetRow}>
                          <Text style={[styles.facetName, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                            {facet.name}
                          </Text>
                          <View style={[styles.facetBarTrack, { backgroundColor: colors.background }]}>
                            <View
                              style={[
                                styles.facetBarFill,
                                { backgroundColor: info.color, width: `${facetScore}%` as any },
                              ]}
                            />
                          </View>
                          <Text style={[styles.facetScore, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                            {facetScore}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { fontSize: 14 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 15 },
  headerSub: { fontSize: 12 },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {},
  tabText: { fontSize: 13 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 14,
  },
  radarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 16,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  legendItem: { alignItems: "center", gap: 3 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { fontSize: 10 },
  legendScore: { fontSize: 13 },
  interpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  interpHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  interpTitle: { fontSize: 14 },
  interpLoading: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  interpLoadingText: { fontSize: 13 },
  interpText: { fontSize: 14, lineHeight: 22 },
  dimCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  dimCardHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  dimColorBar: { width: 4, height: 36, borderRadius: 2 },
  dimCardTitles: { flex: 1 },
  dimCardName: { fontSize: 15 },
  dimCardLevel: { fontSize: 12 },
  barTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  barFill: { height: 6, borderRadius: 3 },
  dimCardDesc: { fontSize: 13, lineHeight: 18 },
  dimCardFooter: { borderRadius: 10, padding: 10, gap: 6 },
  dimCardFooterRow: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  dimCardFooterText: { flex: 1, fontSize: 12, lineHeight: 16 },
  facetGroup: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  facetGroupHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  facetGroupTitle: { flex: 1, fontSize: 14 },
  facetGroupScore: { fontSize: 14 },
  facetList: { gap: 10 },
  facetRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  facetName: { width: 130, fontSize: 12 },
  facetBarTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  facetBarFill: { height: 6, borderRadius: 3 },
  facetScore: { width: 28, fontSize: 12, textAlign: "right" },
});
