import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import {
  Intervention,
  THERAPY_COLORS,
} from "@/data/interventions";

type Props = {
  intervention: Intervention;
  onPress: () => void;
  isViewed?: boolean;
};

export function InterventionCard({ intervention, onPress, isViewed }: Props) {
  const scale = useSharedValue(1);
  const colors = Colors.light;
  const therapyColor = THERAPY_COLORS[intervention.therapy];

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: isViewed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.row}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: therapyColor.bg },
            ]}
          >
            <Feather
              name={intervention.icon as any}
              size={20}
              color={therapyColor.text}
            />
          </View>
          <View style={styles.content}>
            <View style={styles.topRow}>
              <View
                style={[
                  styles.therapyBadge,
                  { backgroundColor: therapyColor.bg },
                ]}
              >
                <Text
                  style={[styles.therapyText, { color: therapyColor.text }]}
                >
                  {intervention.therapy}
                </Text>
              </View>
              {isViewed && (
                <Feather
                  name="check-circle"
                  size={14}
                  color={colors.success}
                />
              )}
            </View>
            <Text
              style={[
                styles.title,
                { color: colors.text, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {intervention.title}
            </Text>
            <Text
              style={[
                styles.description,
                { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
              ]}
              numberOfLines={2}
            >
              {intervention.description}
            </Text>
            <View style={styles.footer}>
              <Feather name="clock" size={12} color={colors.textMuted} />
              <Text
                style={[
                  styles.duration,
                  { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                ]}
              >
                {intervention.duration}
              </Text>
              <Text style={[styles.steps, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                • {intervention.steps.length} passos
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={18} color={colors.textMuted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  therapyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  therapyText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  duration: {
    fontSize: 12,
  },
  steps: {
    fontSize: 12,
  },
});
