import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import type { Intervention } from "@/data/interventions";

const THERAPY_COLORS: Record<string, { bg: string; text: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8" },
  ACT: { bg: "#F0FDF4", text: "#166534" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8" },
  "Terapia Narrativa": { bg: "#FEF3C7", text: "#92400E" },
  "Focada em Compaixão": { bg: "#FDF2F8", text: "#86198F" },
};

type Props = {
  interventions: Intervention[];
  viewedIds: string[];
  todayDone: number;
};

export default function ExtraPracticeGrid({
  interventions,
  viewedIds,
  todayDone,
}: Props) {
  const colors = Colors.light;
  const shown = interventions.slice(0, 5);

  return (
    <View style={styles.section}>
      {/* Título do bloco */}
      <View style={styles.titleRow}>
        <Feather name="compass" size={16} color={colors.primary} />
        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: "Inter_700Bold" },
          ]}
        >
          Outras formas de avançar agora
        </Text>
        <View
          style={[
            styles.counter,
            { backgroundColor: colors.chip?.default ?? "#F0F0F0" },
          ]}
        >
          <Text
            style={[
              styles.counterText,
              { color: colors.textMuted, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {todayDone}/{shown.length}
          </Text>
        </View>
      </View>

      {/* Lista de práticas */}
      <View style={styles.list}>
        {shown.map((intervention) => {
          const tc = THERAPY_COLORS[intervention.therapy] ?? {
            bg: "#F5F5F5",
            text: "#555",
          };
          const viewed = viewedIds.includes(intervention.id);

          return (
            <Pressable
              key={intervention.id}
              style={({ pressed }) => [
                styles.card,
                {
                  backgroundColor: colors.card,
                  borderColor: viewed
                    ? "#22C55E30"
                    : colors.cardBorder,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/intervention/[id]",
                  params: { id: intervention.id },
                })
              }
            >
              {/* Linha superior: título + check */}
              <View style={styles.cardHeader}>
                <View
                  style={[styles.therapyBadge, { backgroundColor: tc.bg }]}
                >
                  <Text
                    style={[
                      styles.therapyText,
                      { color: tc.text, fontFamily: "Inter_600SemiBold" },
                    ]}
                  >
                    {intervention.therapy}
                  </Text>
                </View>
                {viewed && (
                  <Feather name="check-circle" size={14} color="#22C55E" />
                )}
              </View>

              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text, fontFamily: "Inter_600SemiBold" },
                ]}
              >
                {intervention.title}
              </Text>

              {/* Descrição curta */}
              <Text
                style={[
                  styles.cardDesc,
                  {
                    color: colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {intervention.description}
              </Text>

              {/* Duração */}
              <View style={styles.durationRow}>
                <Feather name="clock" size={11} color={colors.textMuted} />
                <Text
                  style={[
                    styles.durationText,
                    { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {intervention.duration}
                </Text>
                <Feather
                  name="chevron-right"
                  size={13}
                  color={colors.textMuted}
                  style={styles.chevron}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: { fontSize: 16, flex: 1 },
  counter: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  counterText: { fontSize: 12 },
  list: { gap: 10 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 5,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  therapyBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    alignSelf: "flex-start",
  },
  therapyText: { fontSize: 10 },
  cardTitle: { fontSize: 14, lineHeight: 19 },
  cardDesc: { fontSize: 12, lineHeight: 17 },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  durationText: { fontSize: 11, flex: 1 },
  chevron: { marginLeft: "auto" },
});
