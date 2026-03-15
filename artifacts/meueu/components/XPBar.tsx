import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { LEVELS, getLevelForXP, getProgressInLevel } from "@/data/gamification";
import { useGamification } from "@/context/GamificationContext";

export function XPBar() {
  const { totalXP, currentLevel } = useGamification();
  const colors = Colors.light;
  const progress = getProgressInLevel(totalXP);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.row}>
        <View style={styles.levelBadge}>
          <Feather name="layers" size={12} color={colors.primary} />
          <Text style={[styles.levelText, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
            Nv {currentLevel.level}
          </Text>
        </View>
        <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
          {currentLevel.title}
        </Text>
        <Text style={[styles.xp, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          {totalXP} XP
        </Text>
      </View>

      <View style={[styles.barOuter, { backgroundColor: colors.cardBorder }]}>
        <View
          style={[
            styles.barInner,
            { backgroundColor: colors.primary, width: `${progress * 100}%` as any },
          ]}
        />
      </View>

      {nextLevel && (
        <Text style={[styles.nextLevel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          {nextLevel.minXP - totalXP} XP para {nextLevel.title}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#EAF2EF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelText: { fontSize: 11 },
  title: { flex: 1, fontSize: 14 },
  xp: { fontSize: 12 },
  barOuter: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barInner: {
    height: 6,
    borderRadius: 3,
  },
  nextLevel: { fontSize: 11, textAlign: "right" },
});
