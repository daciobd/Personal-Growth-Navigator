import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { InterventionCard } from "@/components/InterventionCard";
import { StreakBadge } from "@/components/StreakBadge";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { getRelevantInterventions } from "@/data/interventions";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default function TodayScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { profile } = useApp();

  const interventions = useMemo(
    () =>
      getRelevantInterventions(
        profile.currentAdjectives,
        profile.futureAdjectives
      ),
    [profile.currentAdjectives, profile.futureAdjectives]
  );

  const todayDone = interventions.filter((i) =>
    profile.interventionsViewed.includes(i.id)
  ).length;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text
            style={[
              styles.greetingText,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {getGreeting()}
          </Text>
          <Text
            style={[
              styles.heading,
              { color: colors.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            Sua jornada
          </Text>
        </View>
        <StreakBadge days={profile.streakDays} />
      </View>

      {profile.currentAdjectives.length > 0 && (
        <View
          style={[
            styles.progressCard,
            { backgroundColor: colors.primary },
          ]}
        >
          <View style={styles.progressRow}>
            <Feather name="target" size={18} color="rgba(255,255,255,0.8)" />
            <Text
              style={[
                styles.progressLabel,
                { fontFamily: "Inter_500Medium" },
              ]}
            >
              Progresso de hoje
            </Text>
          </View>
          <Text style={[styles.progressNumber, { fontFamily: "Inter_700Bold" }]}>
            {todayDone} / {Math.min(interventions.length, 5)}
          </Text>
          <View style={styles.progressBarOuter}>
            <View
              style={[
                styles.progressBarInner,
                {
                  width: `${(todayDone / Math.min(interventions.length, 5)) * 100}%`,
                },
              ]}
            />
          </View>
          <Text
            style={[
              styles.progressSub,
              { fontFamily: "Inter_400Regular" },
            ]}
          >
            {todayDone === 0
              ? "Escolha uma prática para começar"
              : todayDone < 3
                ? "Ótimo começo! Continue."
                : "Excelente dedicação hoje!"}
          </Text>
        </View>
      )}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Práticas para você
        </Text>
        <Text
          style={[
            styles.sectionSub,
            { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
          ]}
        >
          Baseadas no seu perfil e objetivos
        </Text>
      </View>

      {interventions.map((intervention) => (
        <InterventionCard
          key={intervention.id}
          intervention={intervention}
          isViewed={profile.interventionsViewed.includes(intervention.id)}
          onPress={() =>
            router.push({
              pathname: "/intervention/[id]",
              params: { id: intervention.id },
            })
          }
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  greeting: {
    gap: 2,
  },
  greetingText: {
    fontSize: 14,
  },
  heading: {
    fontSize: 26,
    lineHeight: 32,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    gap: 8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
  },
  progressNumber: {
    fontSize: 36,
    color: "#fff",
    lineHeight: 44,
  },
  progressBarOuter: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarInner: {
    height: 4,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  progressSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  section: {
    marginBottom: 16,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
  },
  sectionSub: {
    fontSize: 13,
  },
});
