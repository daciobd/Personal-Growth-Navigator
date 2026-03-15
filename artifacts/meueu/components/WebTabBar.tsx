import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

// expo-router strips route groups from usePathname():
//   (tabs)/index.tsx   → "/"
//   (tabs)/profile.tsx → "/profile"
//   journeys/index.tsx → "/journeys"
//   coach/index.tsx    → "/coach"
const TABS = [
  { pathMatch: ["/", "/(tabs)"], label: "Hoje", icon: "zap" as const, navigate: () => router.replace("/(tabs)") },
  { pathMatch: ["/journeys"], label: "Jornadas", icon: "map" as const, navigate: () => router.replace("/journeys") },
  { pathMatch: ["/coach"], label: "Coach", icon: "message-circle" as const, navigate: () => router.push("/coach") },
  { pathMatch: ["/profile", "/(tabs)/profile"], label: "Meu Eu", icon: "user" as const, navigate: () => router.replace("/(tabs)/profile") },
];

// Show the bar on tab-accessible routes
const SHOW_PATHS = ["/", "/profile", "/journeys", "/coach", "/intervention", "/(tabs)"];

function shouldShowBar(pathname: string): boolean {
  return SHOW_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function isTabActive(tab: (typeof TABS)[0], pathname: string): boolean {
  return tab.pathMatch.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function WebTabBar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (Platform.OS !== "web") return null;
  if (!mounted) return null;
  if (!shouldShowBar(pathname)) return null;

  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = isTabActive(tab, pathname);
        const color = active ? "#1B6B5A" : "#A8C0B8";
        return (
          <Pressable
            key={tab.label}
            style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.7 : 1 }]}
            onPress={tab.navigate}
          >
            <Feather name={tab.icon} size={22} color={color} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    // @ts-ignore — position: fixed is valid in RN Web
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E8F0ED",
    flexDirection: "row",
    zIndex: 9999,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
});
