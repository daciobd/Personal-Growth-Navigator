import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";

export default function LoginScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { deviceId } = useGamification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Preencha email e senha.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      router.back();
    } else {
      setError(result.error ?? "Erro ao fazer login.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 16,
            paddingBottom: Platform.OS === "web" ? 34 + 32 : insets.bottom + 32,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>

        <View style={styles.topSection}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <Feather name="user" size={28} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Entrar
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Acesse sua conta para salvar seu progresso na nuvem
          </Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: "#FEE2E2", borderColor: "#FCA5A5" }]}>
              <Feather name="alert-circle" size={15} color="#B91C1C" />
              <Text style={[styles.errorText, { color: "#B91C1C", fontFamily: "Inter_400Regular" }]}>
                {error}
              </Text>
            </View>
          )}

          <View>
            <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="seu@email.com"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              Senha
            </Text>
            <View style={styles.passwordWrap}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="current-password"
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    color: colors.text,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/auth/forgot-password")}
            style={styles.forgotBtn}
          >
            <Text style={[styles.forgotText, { color: colors.primary, fontFamily: "Inter_400Regular" }]}>
              Esqueci minha senha
            </Text>
          </Pressable>

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={[styles.primaryBtn, { backgroundColor: loading ? colors.textMuted : colors.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={[styles.primaryBtnText, { fontFamily: "Inter_600SemiBold" }]}>Entrar</Text>
                <Feather name="arrow-right" size={16} color="#fff" />
              </>
            )}
          </Pressable>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
            <Text style={[styles.dividerText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>ou</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.cardBorder }]} />
          </View>

          <Pressable
            onPress={() => router.replace("/auth/register")}
            style={[styles.secondaryBtn, { borderColor: colors.cardBorder, backgroundColor: colors.card }]}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
              Criar conta
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              Continuar sem conta
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 28 },
  backBtn: { alignSelf: "flex-start" },
  topSection: { alignItems: "center", gap: 12 },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 26 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 21 },
  form: { gap: 16 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { flex: 1, fontSize: 13 },
  label: { fontSize: 13, marginBottom: 6 },
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
  },
  passwordWrap: { position: "relative" },
  passwordInput: { paddingRight: 46 },
  eyeBtn: { position: "absolute", right: 12, top: 13 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  primaryBtnText: { color: "#fff", fontSize: 16 },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 13 },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 15 },
  forgotBtn: { alignItems: "flex-end", marginTop: -4 },
  forgotText: { fontSize: 13 },
  skipBtn: { alignItems: "center", paddingVertical: 8 },
  skipText: { fontSize: 13 },
});
