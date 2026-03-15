import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState, useRef } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import {
  BIG5_ITEMS,
  BIG5_STORAGE_KEY,
  TOTAL_PAGES,
  getPageItems,
  scoreAnswers,
  type StoredBig5,
} from "@/data/big5";

const LIKERT_LABELS = ["1", "2", "3", "4", "5"];
const LIKERT_DESCRIPTIONS = [
  "Discordo totalmente",
  "Discordo",
  "Neutro",
  "Concordo",
  "Concordo totalmente",
];

export default function AssessmentScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const scrollRef = useRef<ScrollView>(null);

  const items = getPageItems(page);
  const progress = (page - 1) / TOTAL_PAGES;
  const answeredOnPage = items.filter((i) => answers[i.id] !== undefined).length;
  const pageComplete = answeredOnPage === items.length;
  const isLastPage = page === TOTAL_PAGES;

  const setAnswer = (itemId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleNext = async () => {
    if (!pageComplete) return;

    if (isLastPage) {
      const scores = scoreAnswers(answers);
      const stored: StoredBig5 = {
        scores,
        completedAt: new Date().toISOString(),
        answers,
      };
      await AsyncStorage.setItem(BIG5_STORAGE_KEY, JSON.stringify(stored));
      router.replace("/assessment/result");
    } else {
      setPage((p) => p + 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  };

  const handleBack = () => {
    if (page > 1) {
      setPage((p) => p - 1);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    } else {
      router.back();
    }
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
        <Pressable onPress={handleBack} hitSlop={12}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Avaliação de Personalidade
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Página {page} de {TOTAL_PAGES}
          </Text>
        </View>
        <Text style={[styles.pct, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
          {Math.round(progress * 100)}%
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressOuter, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.progressInner,
            { backgroundColor: colors.primary, width: `${progress * 100}%` as any },
          ]}
        />
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: Platform.OS === "web" ? 34 + 100 : insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Likert legend */}
        <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.legendRow}>
            {LIKERT_LABELS.map((l, i) => (
              <View key={l} style={styles.legendItem}>
                <Text style={[styles.legendNum, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
                  {l}
                </Text>
                <Text
                  style={[
                    styles.legendDesc,
                    { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                  ]}
                  numberOfLines={2}
                >
                  {LIKERT_DESCRIPTIONS[i]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Items */}
        {items.map((item, idx) => {
          const globalIdx = (page - 1) * 10 + idx + 1;
          const selected = answers[item.id];
          return (
            <View
              key={item.id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: colors.card,
                  borderColor: selected !== undefined ? colors.primary : colors.cardBorder,
                },
              ]}
            >
              <View style={styles.itemHeader}>
                <View style={[styles.itemNum, { backgroundColor: selected !== undefined ? colors.primary : colors.background }]}>
                  <Text
                    style={[
                      styles.itemNumText,
                      {
                        color: selected !== undefined ? "#fff" : colors.textMuted,
                        fontFamily: "Inter_700Bold",
                      },
                    ]}
                  >
                    {globalIdx}
                  </Text>
                </View>
                <Text style={[styles.itemText, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {item.text}
                </Text>
              </View>
              <View style={styles.likertRow}>
                {LIKERT_LABELS.map((l, i) => {
                  const val = i + 1;
                  const active = selected === val;
                  return (
                    <Pressable
                      key={l}
                      onPress={() => setAnswer(item.id, val)}
                      style={[
                        styles.likertBtn,
                        {
                          backgroundColor: active ? colors.primary : colors.background,
                          borderColor: active ? colors.primary : colors.cardBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.likertBtnText,
                          {
                            color: active ? "#fff" : colors.textMuted,
                            fontFamily: "Inter_700Bold",
                          },
                        ]}
                      >
                        {l}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.cardBorder,
            backgroundColor: colors.card,
            paddingBottom: Platform.OS === "web" ? 16 : insets.bottom + 8,
          },
        ]}
      >
        <Text style={[styles.footerProgress, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          {answeredOnPage}/{items.length} respondidas nesta página
        </Text>
        <Pressable
          onPress={handleNext}
          disabled={!pageComplete}
          style={[
            styles.nextBtn,
            { backgroundColor: pageComplete ? colors.primary : colors.cardBorder },
          ]}
        >
          <Text style={[styles.nextBtnText, { fontFamily: "Inter_600SemiBold" }]}>
            {isLastPage ? "Ver resultado" : "Próxima página"}
          </Text>
          <Feather name="arrow-right" size={16} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  pct: { fontSize: 13 },
  progressOuter: { height: 3 },
  progressInner: { height: 3 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  legend: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 4,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  legendItem: {
    alignItems: "center",
    flex: 1,
    gap: 2,
  },
  legendNum: { fontSize: 13 },
  legendDesc: { fontSize: 9, textAlign: "center" },
  itemCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  itemNum: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  itemNumText: { fontSize: 12 },
  itemText: { flex: 1, fontSize: 14, lineHeight: 20 },
  likertRow: {
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
  },
  likertBtn: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 40,
    maxWidth: 56,
  },
  likertBtnText: { fontSize: 15 },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  footerProgress: { fontSize: 12, textAlign: "center" },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 15, color: "#fff" },
});
