import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/context/AuthContext";

const ITEMS = [
  {
    label: "Hoje",
    icon: "zap" as const,
    pathMatch: ["/", "/(tabs)"],
    navigate: () => router.replace("/(tabs)"),
  },
  {
    label: "Meu Eu",
    icon: "user" as const,
    pathMatch: ["/profile", "/(tabs)/profile"],
    navigate: () => router.replace("/(tabs)/profile"),
  },
  {
    label: "Teste Big Five",
    icon: "bar-chart-2" as const,
    pathMatch: ["/assessment"],
    navigate: () => router.push("/assessment"),
  },
  {
    label: "Jornadas",
    icon: "map" as const,
    pathMatch: ["/journeys"],
    navigate: () => router.replace("/journeys"),
  },
  {
    label: "Coach IA",
    icon: "message-circle" as const,
    pathMatch: ["/coach"],
    navigate: () => router.push("/coach"),
  },
];

function isItemActive(pathMatch: string[], pathname: string): boolean {
  return pathMatch.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

export default function WebSidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (Platform.OS !== "web") return null;
  if (!mounted) return null;

  const authActive = pathname.includes("auth") || pathname.includes("profile");

  return (
    <View style={styles.sidebar}>
      <Pressable
        onPress={() => router.replace("/(tabs)")}
        style={({ pressed }) => [styles.logo, { opacity: pressed ? 0.7 : 1 }]}
      >
        <View style={styles.logoMark}>
          <Text style={styles.logoLetter}>M</Text>
        </View>
        <Text style={styles.logoName}>MeuEu</Text>
      </Pressable>

      <View style={styles.nav}>
        {ITEMS.map((item) => {
          const active = isItemActive(item.pathMatch, pathname);
          const color = active ? "#1B6B5A" : "#6B8F7E";
          return (
            <Pressable
              key={item.label}
              style={({ pressed }) => [
                styles.item,
                active && styles.itemActive,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={item.navigate}
            >
              <Feather name={item.icon} size={18} color={color} />
              <Text style={[styles.label, active && styles.labelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.item,
            authActive && styles.itemActive,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() =>
            router.push(isLoggedIn ? "/(tabs)/profile" : "/auth/login")
          }
        >
          <Feather
            name={isLoggedIn ? "user-check" : "log-in"}
            size={18}
            color={authActive ? "#1B6B5A" : "#6B8F7E"}
          />
          <Text
            style={[styles.label, authActive && styles.labelActive]}
            numberOfLines={1}
          >
            {isLoggedIn ? user?.name || "Meu perfil" : "Entrar / Criar conta"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    // @ts-ignore — position: fixed is valid in RN Web
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 220,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#E8F0ED",
    paddingTop: 24,
    paddingHorizontal: 16,
    zIndex: 200,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 8,
    marginBottom: 32,
  },
  logoMark: {
    width: 36,
    height: 36,
    backgroundColor: "#1B6B5A",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoLetter: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C8F0E0",
    fontStyle: "italic",
  },
  logoName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F1F1B",
  },
  nav: { gap: 4 },
  footer: {
    // @ts-ignore
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  itemActive: { backgroundColor: "#E8F5F1" },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B8F7E",
  },
  labelActive: {
    color: "#1B6B5A",
    fontWeight: "700",
  },
});
