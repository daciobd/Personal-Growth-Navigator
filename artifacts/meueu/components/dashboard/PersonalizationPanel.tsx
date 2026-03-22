import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

type Props = {
  sintese: string;
  currentAdjectives: string[];
  futureAdjectives: string[];
  primaryApproach?: string;
};

function buildBullets(
  current: string[],
  future: string[],
  approach?: string
): string[] {
  const bullets: string[] = [];

  if (current.length > 0) {
    const adj = current.slice(0, 2).join(" e ");
    bullets.push(`Você se descreveu como ${adj}`);
  }

  if (future.length > 0) {
    const adj = future.slice(0, 2).join(" e ");
    bullets.push(`Seu objetivo é se tornar mais ${adj}`);
  }

  if (approach) {
    const reasonByApproach: Record<string, string> = {
      TCC: "A TCC é eficaz para identificar padrões de pensamento que limitam seu crescimento",
      ACT: "A ACT ajuda a agir em direção aos seus valores, mesmo diante de dificuldades",
      "Psicologia Positiva": "Focar no que você já tem de forte acelera a transformação",
      Mindfulness: "A atenção plena reduz o piloto automático e amplia sua consciência",
      "Atenção Plena": "A atenção plena reduz o piloto automático e amplia sua consciência",
      DBT: "O equilíbrio emocional é o ponto de partida para mudanças duradouras",
      CFT: "Tratar-se com compaixão é mais eficaz do que autocrítica",
    };
    const reason = reasonByApproach[approach];
    if (reason) bullets.push(reason);
  }

  return bullets;
}

export default function PersonalizationPanel({
  sintese,
  currentAdjectives,
  futureAdjectives,
  primaryApproach,
}: Props) {
  const colors = Colors.light;
  const bullets = buildBullets(currentAdjectives, futureAdjectives, primaryApproach);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.chip?.default ?? "#F5F5F5" },
      ]}
    >
      {/* Cabeçalho */}
      <View style={styles.titleRow}>
        <View
          style={[styles.iconBox, { backgroundColor: colors.primary + "18" }]}
        >
          <Feather name="user" size={15} color={colors.primary} />
        </View>
        <Text
          style={[
            styles.title,
            { color: colors.text, fontFamily: "Inter_700Bold" },
          ]}
        >
          Por que sugerimos isso para você
        </Text>
      </View>

      {/* Síntese do perfil */}
      {sintese ? (
        <Text
          style={[
            styles.sintese,
            { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
          ]}
        >
          {sintese}
        </Text>
      ) : null}

      {/* Bullets de personalização */}
      {bullets.length > 0 && (
        <View style={styles.bullets}>
          {bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View
                style={[
                  styles.bulletDot,
                  { backgroundColor: colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.bulletText,
                  { color: colors.text, fontFamily: "Inter_400Regular" },
                ]}
              >
                {b}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Conclusão */}
      <View style={styles.conclusionRow}>
        <Feather name="arrow-right" size={13} color={colors.primary} />
        <Text
          style={[
            styles.conclusion,
            { color: colors.primary, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Por isso, focamos em ações práticas e imediatas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 15, flex: 1 },
  sintese: { fontSize: 13, lineHeight: 19 },
  bullets: { gap: 8 },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: { fontSize: 13, lineHeight: 19, flex: 1 },
  conclusionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  conclusion: { fontSize: 13, flex: 1 },
});
