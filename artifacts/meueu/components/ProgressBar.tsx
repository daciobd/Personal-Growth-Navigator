import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Colors from "@/constants/colors";

type Props = {
  progress: number;
  total: number;
};

export function ProgressBar({ progress, total }: Props) {
  const colors = Colors.light;
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress / total, {
      damping: 20,
      stiffness: 100,
    });
  }, [progress, total]);

  const barStyle = useAnimatedStyle(() => ({
    flex: width.value,
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.chip.default },
      ]}
    >
      <Animated.View
        style={[
          styles.bar,
          { backgroundColor: colors.primary },
          barStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    flexDirection: "row",
  },
  bar: {
    borderRadius: 2,
  },
});
