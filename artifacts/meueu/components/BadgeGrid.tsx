import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { BADGES } from "@/data/gamification";
import { useGamification } from "@/context/GamificationContext";

export function BadgeGrid() {
  const { earnedBadges } = useGamification();
  const colors = Colors.light;
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
        Conquistas
      </Text>
      <Text style={[styles.sectionSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
        {earnedIds.size} de {BADGES.length} desbloqueadas
      </Text>
      <View style={styles.grid}>
        {BADGES.map((badge) => {
          const earned = earnedIds.has(badge.id);
          return (
            <View
              key={badge.id}
              style={[
                styles.badge,
                {
                  backgroundColor: earned ? colors.primary : colors.card,
                  borderColor: earned ? colors.primary : colors.cardBorder,
                  opacity: earned ? 1 : 0.5,
                },
              ]}
            >
              <Feather
                name={badge.icon as any}
                size={18}
                color={earned ? "#fff" : colors.textMuted}
              />
              <Text
                style={[
                  styles.badgeName,
                  {
                    color: earned ? "#fff" : colors.textMuted,
                    fontFamily: "Inter_600SemiBold",
                  },
                ]}
                numberOfLines={2}
              >
                {badge.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8 },
  sectionTitle: { fontSize: 17 },
  sectionSub: { fontSize: 13 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    width: "30%",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
    minHeight: 80,
    justifyContent: "center",
  },
  badgeName: {
    fontSize: 10,
    textAlign: "center",
    lineHeight: 13,
  },
});
