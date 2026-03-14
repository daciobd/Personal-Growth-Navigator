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
import { AdjectiveChip } from "@/components/AdjectiveChip";
import { ProgressBar } from "@/components/ProgressBar";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { FUTURE_ADJECTIVES } from "@/data/interventions";

export default function FutureScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { setFutureAdjectives, completeOnboarding } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (adj: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected((prev) =>
      prev.includes(adj) ? prev.filter((a) => a !== adj) : [...prev, adj]
    );
  };

  const handleDone = () => {
    if (selected.length === 0) return;
    setFutureAdjectives(selected);
    completeOnboarding();
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    router.replace("/(tabs)");
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <ProgressBar progress={2} total={2} />
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[styles.step, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
            2 de 2
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={[styles.iconCircle, { backgroundColor: "#FDF5E8" }]}>
            <Feather name="star" size={28} color={colors.accent} />
          </View>
          <Text
            style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}
          >
            Como você quer{"\n"}se tornar?
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
          >
            Pense na pessoa que quer ser. Quais qualidades descrevem essa versão futura de você?
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {FUTURE_ADJECTIVES.map((adj) => (
            <AdjectiveChip
              key={adj}
              label={adj}
              selected={selected.includes(adj)}
              onPress={() => toggle(adj)}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16,
            backgroundColor: colors.background,
          },
        ]}
      >
        {selected.length > 0 && (
          <Text style={[styles.count, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {selected.length} selecionado{selected.length !== 1 ? "s" : ""}
          </Text>
        )}
        <Pressable
          onPress={handleDone}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor:
                selected.length > 0 ? colors.primary : colors.chip.default,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <Feather
            name="check"
            size={18}
            color={selected.length > 0 ? "#fff" : colors.textMuted}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: selected.length > 0 ? "#fff" : colors.textMuted,
                fontFamily: "Inter_600SemiBold",
              },
            ]}
          >
            Começar minha jornada
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 4,
  },
  step: {
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  topSection: {
    gap: 12,
    marginBottom: 32,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  count: {
    fontSize: 13,
    textAlign: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 16,
  },
});
