// ─── MissionCard — Used on the mission preview screen ─────────────────────

import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { radius, shadow, spacing } from "@/constants/tokens";
import type {
  DailyMission,
  DailyMissionCategory,
} from "../data/missions";

const CATEGORY_LABEL: Record<DailyMissionCategory, string> = {
  action: "Ação",
  reflection: "Reflexão",
  alternative: "Caminho leve",
};

const CATEGORY_ICON: Record<DailyMissionCategory, string> = {
  action: "play",
  reflection: "help-circle",
  alternative: "feather",
};

type Props = {
  mission: DailyMission;
  reasonCopy?: string;
};

export function MissionCard({ mission, reasonCopy }: Props) {
  const colors = Colors.light;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          ...shadow.soft,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.chip.default }]}>
          <Feather
            name={CATEGORY_ICON[mission.category] as any}
            size={20}
            color={colors.primary}
          />
        </View>
        <View style={styles.metaBlock}>
          <Text
            style={[styles.category, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}
          >
            {CATEGORY_LABEL[mission.category]} · {mission.durationMin} min
            {mission.difficulty === "light" ? " · leve" : ""}
          </Text>
        </View>
      </View>

      <Text
        style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}
      >
        {mission.title}
      </Text>

      <Text
        style={[
          styles.subtitle,
          { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
        ]}
      >
        {reasonCopy ?? mission.subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing[5],
    gap: spacing[3],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metaBlock: { flex: 1 },
  category: { fontSize: 12, letterSpacing: 0.3 },
  title: { fontSize: 22, lineHeight: 28 },
  subtitle: { fontSize: 14, lineHeight: 20 },
});
