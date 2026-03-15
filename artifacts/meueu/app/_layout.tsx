import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import Head from "expo-router/head";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import { GamificationProvider } from "@/context/GamificationContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding/welcome" />
      <Stack.Screen name="onboarding/current" />
      <Stack.Screen name="onboarding/future" />
      <Stack.Screen name="onboarding/plan" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="intervention/[id]" />
      <Stack.Screen name="coach/index" options={{ presentation: "modal" }} />
      <Stack.Screen name="assessment/index" />
      <Stack.Screen name="assessment/result" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Registra service worker no web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("[SW] Registrado"))
      .catch((err) => console.warn("[SW] Falha ao registrar:", err));
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
              <AuthProvider>
                <GamificationProvider>
                  {Platform.OS === "web" && (
                    <Head>
                      <meta charSet="utf-8" />
                      <meta name="application-name" content="MeuEu" />
                      <meta name="theme-color" content="#1B6B5A" />
                      <meta name="background-color" content="#F5F8F6" />
                      <meta name="mobile-web-app-capable" content="yes" />
                      <meta name="apple-mobile-web-app-capable" content="yes" />
                      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                      <meta name="apple-mobile-web-app-title" content="MeuEu" />
                      <meta name="format-detection" content="telephone=no" />
                      <link rel="manifest" href="/manifest.json" />
                      <link rel="apple-touch-icon" href="/icons/icon-192.png" />
                      <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
                      <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
                    </Head>
                  )}
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
