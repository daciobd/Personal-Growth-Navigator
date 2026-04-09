import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import Feather from "@expo/vector-icons/Feather";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PwaHead } from "@/components/PwaHead";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import WebSidebar from "@/components/WebSidebar";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function RootLayoutNavInner() {
  const { isWide } = useSidebar();
  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1, paddingLeft: isWeb && isWide ? 220 : 0 }}>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding/welcome" />
        <Stack.Screen name="onboarding/traits" />
        <Stack.Screen name="onboarding/state" />
        <Stack.Screen name="onboarding/current" />
        <Stack.Screen name="onboarding/current_primary_issue" />
        <Stack.Screen name="onboarding/current_deep_dive" />
        <Stack.Screen name="onboarding/adaptive_frequency" />
        <Stack.Screen name="onboarding/first_mission" />
        <Stack.Screen name="onboarding/future" />
        <Stack.Screen name="onboarding/plan" />
        <Stack.Screen name="daily-practice" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="intervention/[id]" />
        <Stack.Screen name="coach/index" options={{ presentation: "modal" }} />
        <Stack.Screen name="assessment/index" />
        <Stack.Screen name="assessment/result" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />
        <Stack.Screen name="journeys/index" />
        <Stack.Screen name="journeys/[id]" />
      </Stack>
      <WebSidebar />
    </View>
  );
}

function RootLayoutNav() {
  return (
    <SidebarProvider>
      <RootLayoutNavInner />
    </SidebarProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    Font.loadAsync(Feather.font)
      .catch(() => {})
      .finally(() => setIconsLoaded(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && iconsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, iconsLoaded]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[SW] Registrado"))
        .catch((err) => console.warn("[SW] Falha ao registrar:", err));
    } else {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) {
          reg.unregister();
        }
      });
    }
  }, []);

  if ((!fontsLoaded && !fontError) || !iconsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
              <AuthProvider>
                <GamificationProvider>
                  <PwaHead />
                  <RootLayoutNav />
                </GamificationProvider>
              </AuthProvider>
            </AppProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
