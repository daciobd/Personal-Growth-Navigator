import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";

export default function EntryScreen() {
  const { profile, isLoading } = useApp();
  const colors = Colors.light;

  useEffect(() => {
    if (isLoading) return;
    if (profile.onboardingComplete) {
      router.replace("/(tabs)");
    } else {
      router.replace("/onboarding/welcome");
    }
  }, [isLoading, profile.onboardingComplete]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
