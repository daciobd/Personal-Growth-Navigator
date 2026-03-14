import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

type Props = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function AdjectiveChip({ label, selected, onPress }: Props) {
  const scale = useSharedValue(1);
  const colors = Colors.light;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.chip,
          {
            backgroundColor: selected
              ? colors.chip.selected
              : colors.chip.default,
            borderColor: selected ? colors.primary : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color: selected
                ? colors.chip.textSelected
                : colors.chip.textDefault,
              fontFamily: selected ? "Inter_600SemiBold" : "Inter_500Medium",
            },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 100,
    borderWidth: 1.5,
    margin: 4,
  },
  label: {
    fontSize: 14,
    letterSpacing: 0.1,
  },
});
