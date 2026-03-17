import { Feather } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";

const SIDEBAR_W = 220;

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
  const { isOpen, isWide, toggle, close } = useSidebar();

  const slideAnim = React.useRef(new Animated.Value(-SIDEBAR_W)).current;
  const backdropAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isWide) {
      slideAnim.setValue(0);
      backdropAnim.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_W,
        useNativeDriver: false,
        tension: 80,
        friction: 12,
      }),
      Animated.timing(backdropAnim, {
        toValue: isOpen ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOpen, isWide]);

  if (Platform.OS !== "web") return null;
  if (!mounted) return null;

  const authActive = pathname.includes("auth") || pathname.includes("profile");

  const handleLogoPress = () => {
    if (isWide) {
      router.replace("/(tabs)");
    } else {
      toggle();
    }
  };

  const handleItemPress = (navigate: () => void) => {
    navigate();
    if (!isWide) close();
  };

  return (
    <>
      {/* Backdrop — only on narrow */}
      {!isWide && (
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropAnim, pointerEvents: isOpen ? "auto" : "none" } as any,
          ]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      )}

      {/* Sidebar drawer */}
      <Animated.View
        style={[
          styles.sidebar,
          !isWide && { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <Pressable
          onPress={handleLogoPress}
          style={({ pressed }) => [styles.logo, { opacity: pressed ? 0.7 : 1 }]}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
          <Text style={styles.logoName}>MeuEu</Text>
          {!isWide && (
            <View style={styles.closeIcon}>
              <Feather name={isOpen ? "x" : "menu"} size={18} color="#6B8F7E" />
            </View>
          )}
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
                onPress={() => handleItemPress(item.navigate)}
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
            onPress={() => {
              router.push(isLoggedIn ? "/(tabs)/profile" : "/auth/login");
              if (!isWide) close();
            }}
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
      </Animated.View>

      {/* Floating hamburger button — only on narrow when sidebar is closed */}
      {!isWide && !isOpen && (
        <Pressable
          onPress={toggle}
          style={({ pressed }) => [
            styles.hamburger,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <View style={styles.logoMark}>
            <Text style={styles.logoLetter}>M</Text>
          </View>
        </Pressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    // @ts-ignore
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 199,
  },
  sidebar: {
    // @ts-ignore
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_W,
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
    flex: 1,
  },
  closeIcon: {
    marginLeft: "auto",
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
  hamburger: {
    // @ts-ignore
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 201,
  },
});
