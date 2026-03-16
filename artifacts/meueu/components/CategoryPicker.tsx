import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Colors from "@/constants/colors";
import {
  AdjectiveItem,
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  Category,
} from "@/data/adjectives";

const CATEGORY_LABELS: Record<Category, string> = {
  Emocional: "Emocional",
  Cognitivo: "Cognitivo",
  Social: "Social",
  Comportamental: "Comportamental",
  Valores: "Valores",
  Forças: "Pontos fortes",
};

type Props = {
  adjectives: AdjectiveItem[];
  selected: string[];
  onToggle: (label: string) => void;
};

function AdjectiveChipItem({
  item,
  selected,
  onToggle,
}: {
  item: AdjectiveItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const colors = Colors.light;
  const catColor = CATEGORY_COLORS[item.category];
  const isStrength = item.category === "Forças";

  return (
    <Pressable
      onPress={onToggle}
      style={[
        chipStyles.chip,
        {
          backgroundColor: selected ? catColor.active : colors.chip.default,
          borderColor: selected
            ? catColor.active
            : isStrength
            ? catColor.text
            : "transparent",
        },
      ]}
    >
      <Text
        style={[
          chipStyles.label,
          {
            color: selected
              ? "#fff"
              : isStrength
              ? catColor.text
              : colors.chip.textDefault,
            fontFamily: selected ? "Inter_600SemiBold" : "Inter_500Medium",
          },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    borderWidth: 1.5,
    margin: 3,
  },
  label: { fontSize: 14 },
});

export function CategoryPicker({ adjectives, selected, onToggle }: Props) {
  const [activeCategory, setActiveCategory] = useState<Category | "Todos">("Todos");
  const colors = Colors.light;

  const filtered =
    activeCategory === "Todos"
      ? adjectives
      : adjectives.filter((a) => a.category === activeCategory);

  const handleToggle = (label: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onToggle(label);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          onPress={() => setActiveCategory("Todos")}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                activeCategory === "Todos" ? colors.primary : colors.chip.default,
            },
          ]}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: activeCategory === "Todos" ? "#fff" : colors.chip.textDefault,
                fontFamily: "Inter_500Medium",
              },
            ]}
          >
            Todos
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => {
          const catColor = CATEGORY_COLORS[cat];
          const isActive = activeCategory === cat;
          const isStrengthCat = cat === "Forças";
          return (
            <Pressable
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isActive ? catColor.active : catColor.bg,
                  borderWidth: isStrengthCat && !isActive ? 1.5 : 0,
                  borderColor: isStrengthCat && !isActive ? catColor.text : "transparent",
                },
              ]}
            >
              <Feather
                name={CATEGORY_ICONS[cat] as any}
                size={12}
                color={isActive ? "#fff" : catColor.text}
              />
              <Text
                style={[
                  styles.filterText,
                  {
                    color: isActive ? "#fff" : catColor.text,
                    fontFamily: isStrengthCat && !isActive ? "Inter_600SemiBold" : "Inter_500Medium",
                  },
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.chipsWrap}>
        {filtered.map((item) => (
          <AdjectiveChipItem
            key={item.label + item.category}
            item={item}
            selected={selected.includes(item.label)}
            onToggle={() => handleToggle(item.label)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 16 },
  filterRow: { paddingHorizontal: 0, gap: 8, paddingVertical: 2 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 100,
  },
  filterText: { fontSize: 13 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap" },
});
