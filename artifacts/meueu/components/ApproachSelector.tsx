import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ApproachOption = {
  key: string;
  label: string;
  title: string;
  description: string;
  color: string;
  bgColor: string;
};

type Props = {
  options: ApproachOption[];
  onSelect: (key: string) => void;
};

export default function ApproachSelector({ options, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSelect(key: string) {
    setSelected(key);
    setSaving(true);
    try {
      await AsyncStorage.setItem("@meueu_preferred_approach", key);
      await AsyncStorage.setItem("@meueu_approach_selected_at", new Date().toISOString());
    } catch {}
    setSaving(false);
    onSelect(key);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Qual dessas perspectivas fez mais sentido pra você agora?
      </Text>
      <Text style={styles.subtitle}>
        O app vai seguir essa linha com você — até você querer mudar.
      </Text>

      <View style={styles.options}>
        {options.map((opt) => {
          const isSelected = selected === opt.key;
          return (
            <Pressable
              key={opt.key}
              style={[
                styles.option,
                { borderColor: isSelected ? opt.color : "#E8F0ED" },
                isSelected && { backgroundColor: opt.bgColor },
              ]}
              onPress={() => handleSelect(opt.key)}
              disabled={saving}
            >
              <View style={styles.optionHeader}>
                <View style={[styles.badge, { backgroundColor: opt.color + "22" }]}>
                  <Text style={[styles.badgeText, { color: opt.color }]}>
                    {opt.label}
                  </Text>
                </View>
                {isSelected && (
                  <View style={[styles.checkCircle, { backgroundColor: opt.color }]}>
                    <Feather name="check" size={13} color="#fff" />
                  </View>
                )}
              </View>
              <Text style={[styles.optionTitle, isSelected && { color: opt.color }]}>
                {opt.title}
              </Text>
              <Text style={styles.optionDesc}>{opt.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {saving && (
        <ActivityIndicator color="#1B6B5A" style={{ marginTop: 8 }} />
      )}

      <Text style={styles.hint}>
        Você pode mudar isso a qualquer momento no seu perfil.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F1F1B",
    marginBottom: 6,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 13,
    color: "#6B8F7E",
    marginBottom: 18,
    lineHeight: 19,
  },
  options: { gap: 12 },
  option: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    backgroundColor: "#fff",
  },
  optionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F1F1B",
    marginBottom: 4,
  },
  optionDesc: { fontSize: 13, color: "#6B8F7E", lineHeight: 19 },
  hint: {
    fontSize: 11,
    color: "#A8C0B8",
    textAlign: "center",
    marginTop: 16,
  },
});
