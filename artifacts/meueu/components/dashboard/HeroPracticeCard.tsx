import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { shadow } from "@/constants/tokens";
import type { Practice } from "@/context/AppContext";

const APPROACH_DARK: Record<string, string> = {
  TCC: "#1D4ED8",
  ACT: "#166534",
  "Psicologia Positiva": "#6B21A8",
  Mindfulness: "#9A3412",
  "Atenção Plena": "#9A3412",
  DBT: "#9A3412",
  CFT: "#86198F",
};

type CheckinStatus = "done" | "missed";

type Props = {
  practice: Practice;
  practiceIdx: number;
  status: CheckinStatus | null;
  onCheckin: (status: CheckinStatus) => void;
};

export default function HeroPracticeCard({
  practice,
  practiceIdx,
  status,
  onCheckin,
}: Props) {
  const bg = APPROACH_DARK[practice.abordagem] ?? "#0F1F1B";
  const benefits = practice.passos.slice(0, 3);

  return (
    <View style={[styles.card, { backgroundColor: bg }]}>
      {/* Badge abordagem */}
      <View style={styles.badge}>
        <Text style={[styles.badgeText, { fontFamily: "Inter_600SemiBold" }]}>
          {practice.abordagem}
        </Text>
      </View>

      {/* Título principal */}
      <Text style={[styles.title, { fontFamily: "Inter_700Bold" }]}>
        {practice.nome}
      </Text>

      {/* Descrição */}
      <Text style={[styles.desc, { fontFamily: "Inter_400Regular" }]}>
        {practice.justificativa}
      </Text>

      {/* Benefícios — primeiros 3 passos */}
      <View style={styles.benefits}>
        {benefits.map((b, i) => (
          <View key={i} style={styles.benefitRow}>
            <Feather name="check" size={13} color="rgba(255,255,255,0.7)" />
            <Text
              style={[styles.benefitText, { fontFamily: "Inter_400Regular" }]}
              numberOfLines={1}
            >
              {b}
            </Text>
          </View>
        ))}
      </View>

      {/* Rodapé: tempo + CTA */}
      <View style={styles.footer}>
        <View style={styles.timeRow}>
          <Feather name="clock" size={13} color="rgba(255,255,255,0.6)" />
          <Text
            style={[styles.timeText, { fontFamily: "Inter_400Regular" }]}
          >
            {practice.frequencia}
          </Text>
        </View>

        {status ? (
          /* Já registrado */
          <View style={styles.doneChip}>
            <Feather
              name={status === "done" ? "check-circle" : "x-circle"}
              size={14}
              color={status === "done" ? "#22C55E" : "#F87171"}
            />
            <Text
              style={[
                styles.doneChipText,
                { fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {status === "done" ? "Feito" : "Não feito"}
            </Text>
          </View>
        ) : (
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.85 : 1 },
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
              style={[styles.primaryBtnText, { fontFamily: "Inter_700Bold" }]}
            >
              Começar agora
            </Text>
            <Feather name="arrow-right" size={14} color={bg} />
          </Pressable>
        )}
      </View>

      {/* Check-in outline (só se não registrado ainda) */}
      {!status && (
        <View style={styles.checkinRow}>
          <Pressable
            style={styles.checkinBtn}
            onPress={() => onCheckin("done")}
          >
            <Feather name="check" size={13} color="rgba(255,255,255,0.7)" />
            <Text
              style={[
                styles.checkinBtnText,
                { fontFamily: "Inter_500Medium" },
              ]}
            >
              Já fiz
            </Text>
          </Pressable>
          <Pressable
            style={styles.checkinBtn}
            onPress={() => onCheckin("missed")}
          >
            <Feather name="x" size={13} color="rgba(255,255,255,0.5)" />
            <Text
              style={[
                styles.checkinBtnText,
                {
                  fontFamily: "Inter_500Medium",
                  color: "rgba(255,255,255,0.5)",
                },
              ]}
            >
              Não consegui
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 12,
    ...shadow.card,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    color: "#fff",
    lineHeight: 27,
  },
  desc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.75)",
    lineHeight: 21,
  },
  benefits: { gap: 6 },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  benefitText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
  },
  primaryBtnText: {
    fontSize: 14,
  },
  doneChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  doneChipText: {
    fontSize: 13,
    color: "#fff",
  },
  checkinRow: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    paddingTop: 12,
    marginTop: 2,
  },
  checkinBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  checkinBtnText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
});
