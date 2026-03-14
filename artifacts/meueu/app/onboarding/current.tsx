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
import { CURRENT_ADJECTIVES } from "@/data/interventions";

export default function CurrentScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { setCurrentAdjectives } = useApp();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (adj: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelected((prev) =>
      prev.includes(adj) ? prev.filter((a) => a !== adj) : [...prev, adj]
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
          paddingTop: Platform.OS === "web" ? 67 : insets.top,
        },
      ]}
    >
      <View style={styles.header}>
        <ProgressBar progress={1} total={2} />
        <Text style={[styles.step, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
          1 de 2
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.chip.default }]}>
            <Feather name="user" size={28} color={colors.primary} />
          </View>
          <Text
            style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}
          >
            Como você se vê{"\n"}hoje?
          </Text>
          <Text
            style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
          >
            Escolha os adjetivos que melhor te descrevem agora. Seja honesto — sem julgamentos.
          </Text>
        </View>

        <View style={styles.chipsContainer}>
          {CURRENT_ADJECTIVES.map((adj) => (
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
          onPress={handleNext}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor:
                selected.length > 0 ? colors.primary : colors.chip.default,
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
            Continuar
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color={selected.length > 0 ? "#fff" : colors.textMuted}
          />
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
  step: {
    fontSize: 12,
    textAlign: "right",
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
