import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BadgeGrid } from "@/components/BadgeGrid";
import { XPBar } from "@/components/XPBar";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import { THERAPY_COLORS, Therapy } from "@/data/interventions";

export default function ProfileScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { profile, resetProfile } = useApp();
  const { streak } = useGamification();

  const therapiesDone = new Set(
    profile.interventionsViewed
      .map((id) => {
        const [, therapy] = id.split("-");
        return therapy;
      })
  );

  const handleReset = () => {
    Alert.alert(
      "Recomeçar jornada",
      "Isso apagará seus dados e você voltará ao início. Tem certeza?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Recomeçar",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning
              );
            }
            resetProfile();
            router.replace("/");
          },
        },
      ]
    );
  };

  const totalInterventions = profile.interventionsViewed.length;

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
      <Text
        style={[
          styles.heading,
          { color: colors.text, fontFamily: "Inter_700Bold" },
        ]}
      >
        Meu Eu
      </Text>

      <View
        style={[
          styles.statsRow,
          { backgroundColor: colors.primary },
        ]}
      >
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { fontFamily: "Inter_700Bold" }]}>
            {streak || profile.streakDays}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>
            {(streak || profile.streakDays) === 1 ? "dia seguido" : "dias seguidos"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { fontFamily: "Inter_700Bold" }]}>
            {totalInterventions}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>
            {totalInterventions === 1 ? "prática feita" : "práticas feitas"}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={[styles.statNumber, { fontFamily: "Inter_700Bold" }]}>
            {profile.currentAdjectives.length}
          </Text>
          <Text style={[styles.statLabel, { fontFamily: "Inter_400Regular" }]}>
            qualidades mapeadas
          </Text>
        </View>
      </View>

      <XPBar />

      <Pressable
        onPress={() => router.push("/coach")}
        style={[styles.coachCard, { backgroundColor: colors.primary }]}
      >
        <View style={styles.coachCardLeft}>
          <View style={[styles.coachIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="message-circle" size={20} color="#fff" />
          </View>
          <View>
            <Text style={[styles.coachTitle, { fontFamily: "Inter_700Bold" }]}>
              Coach
            </Text>
            <Text style={[styles.coachSub, { fontFamily: "Inter_400Regular" }]}>
              Converse e ganhe XP
            </Text>
          </View>
        </View>
        <Feather name="arrow-right" size={18} color="rgba(255,255,255,0.7)" />
      </Pressable>

      <BadgeGrid />

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Eu hoje
        </Text>
        {profile.currentAdjectives.length > 0 ? (
          <View style={styles.adjectivesGrid}>
            {profile.currentAdjectives.map((adj) => (
              <View
                key={adj}
                style={[styles.adjChip, { backgroundColor: colors.chip.default }]}
              >
                <Text
                  style={[
                    styles.adjText,
                    { color: colors.chip.textDefault, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {adj}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Nenhum adjetivo selecionado.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Eu futuro
        </Text>
        {profile.futureAdjectives.length > 0 ? (
          <View style={styles.adjectivesGrid}>
            {profile.futureAdjectives.map((adj) => (
              <View
                key={adj}
                style={[
                  styles.adjChip,
                  { backgroundColor: "#FDF5E8" },
                ]}
              >
                <Text
                  style={[
                    styles.adjText,
                    { color: "#8A5A1A", fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {adj}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Nenhum adjetivo selecionado.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          Sobre as abordagens
        </Text>
        {(["TCC", "ACT", "Mindfulness", "Psicologia Positiva", "Terapia Narrativa", "Focada em Compaixão"] as Therapy[]).map(
          (therapy) => {
            const tc = THERAPY_COLORS[therapy];
            const descriptions: Record<Therapy, string> = {
              TCC: "Terapia Cognitivo-Comportamental: identifica e reformula padrões de pensamento.",
              ACT: "Terapia de Aceitação e Compromisso: foco em valores e ação comprometida.",
              Mindfulness: "Atenção Plena: cultiva presença e consciência do momento atual.",
              "Psicologia Positiva": "Ciência do florescimento humano, forças e gratidão.",
              "Terapia Narrativa": "Reescreve histórias internas limitantes com uma nova perspectiva.",
              "Focada em Compaixão": "Desenvolve autocompaixão como base de toda mudança saudável.",
            };
            return (
              <View
                key={therapy}
                style={[
                  styles.therapyItem,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={[styles.therapyBadge, { backgroundColor: tc.bg }]}>
                  <Text
                    style={[
                      styles.therapyName,
                      { color: tc.text, fontFamily: "Inter_600SemiBold" },
                    ]}
                  >
                    {therapy}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.therapyDesc,
                    { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {descriptions[therapy]}
                </Text>
              </View>
            );
          }
        )}
      </View>

      <Pressable
        onPress={handleReset}
        style={({ pressed }) => [
          styles.resetButton,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Feather name="refresh-cw" size={16} color={colors.danger} />
        <Text
          style={[
            styles.resetText,
            { color: colors.danger, fontFamily: "Inter_500Medium" },
          ]}
        >
          Recomeçar jornada
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
  heading: {
    fontSize: 26,
    lineHeight: 32,
  },
  statsRow: {
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
    gap: 4,
  },
  statNumber: {
    fontSize: 28,
    color: "#fff",
    lineHeight: 34,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
  },
  adjectivesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  adjChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  adjText: {
    fontSize: 14,
  },
  empty: {
    fontSize: 14,
  },
  therapyItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  therapyBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  therapyName: {
    fontSize: 12,
  },
  therapyDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  resetText: {
    fontSize: 15,
  },
  coachCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  coachCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  coachIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  coachTitle: {
    fontSize: 15,
    color: "#fff",
  },
  coachSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
});
