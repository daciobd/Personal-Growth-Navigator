import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CategoryPicker } from "@/components/CategoryPicker";
import { ProgressBar } from "@/components/ProgressBar";
import Big5LivePreview from "@/components/Big5LivePreview";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { CURRENT_ADJECTIVES } from "@/data/adjectives";

export default function CurrentScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { setCurrentAdjectives } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    setCurrentAdjectives(selected);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/onboarding/future");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.step, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
            Etapa 1 de 2
          </Text>
        </View>
        <ProgressBar progress={1} total={2} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={[styles.iconCircle, { backgroundColor: "#EFF6FF" }]}>
            <Feather name="user" size={26} color="#1D4ED8" />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Eu Hoje
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Selecione os adjetivos que descrevem como você é hoje — tanto desafios quanto pontos fortes.
          </Text>
        </View>

        <CategoryPicker
          adjectives={CURRENT_ADJECTIVES}
          selected={selected}
          onToggle={toggle}
        />

        <Big5LivePreview
          currentAdjectives={selected}
          compact={selected.length < 5}
        />

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 12,
            backgroundColor: colors.background,
          },
        ]}
      >
        {selected.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedPreview}
          >
            {selected.map((adj) => (
              <View key={adj} style={[styles.selectedChip, { backgroundColor: colors.chip.default }]}>
                <Text style={[styles.selectedChipText, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                  {adj}
                </Text>
                <Pressable onPress={() => toggle(adj)}>
                  <Feather name="x" size={12} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: selected.length > 0 ? colors.primary : colors.chip.default,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: selected.length > 0 ? "#fff" : colors.textMuted,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            {selected.length > 0 ? `Continuar com ${selected.length} selecionado${selected.length !== 1 ? "s" : ""}` : "Selecione ao menos um"}
          </Text>
          {selected.length > 0 && <Feather name="arrow-right" size={18} color="#fff" />}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  step: { fontSize: 13 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, gap: 20 },
  topSection: { gap: 10 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 28, lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 21 },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  selectedPreview: {
    flexDirection: "row",
    gap: 6,
    paddingBottom: 4,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 100,
  },
  selectedChipText: { fontSize: 13 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  buttonText: { fontSize: 15 },
});
