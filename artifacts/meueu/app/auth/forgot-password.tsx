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
import { getApiUrl } from "@/utils/api";

export default function ForgotPasswordScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const domain = getApiUrl();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Digite seu email.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await fetch(`${domain}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setSent(true);
    } catch {
      setError("Não foi possível enviar. Verifique sua conexão.");
    } finally {
      setLoading(false);
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
          <View style={[styles.iconBox, { backgroundColor: "#EFF6FF" }]}>
            <Feather name="mail" size={28} color="#1D4ED8" />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Esqueci minha senha
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Digite seu email e enviaremos um link para criar uma nova senha.
          </Text>
        </View>

        {sent ? (
          <View style={[styles.successBox, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
            <Feather name="check-circle" size={22} color="#16A34A" />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.successTitle, { color: "#14532D", fontFamily: "Inter_700Bold" }]}>
                Email enviado
              </Text>
              <Text style={[styles.successText, { color: "#166534", fontFamily: "Inter_400Regular" }]}>
                Se este email estiver cadastrado, você receberá o link em breve. Verifique também a pasta de spam.
              </Text>
            </View>
          </View>
        ) : (
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

            <Pressable
              onPress={handleSend}
              disabled={loading}
              style={[styles.primaryBtn, { backgroundColor: loading ? colors.textMuted : colors.primary }]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={[styles.primaryBtnText, { fontFamily: "Inter_600SemiBold" }]}>Enviar link</Text>
                  <Feather name="send" size={16} color="#fff" />
                </>
              )}
            </Pressable>
          </View>
        )}

        <Pressable onPress={() => router.back()} style={styles.backLink}>
          <Text style={[styles.backLinkText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Voltar para o login
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 28 },
  backBtn: { alignSelf: "flex-start" },
  topSection: { alignItems: "center", gap: 12 },
  iconBox: {
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
  successBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  successTitle: { fontSize: 15 },
  successText: { fontSize: 13, lineHeight: 19 },
  backLink: { alignItems: "center", paddingVertical: 8 },
  backLinkText: { fontSize: 13 },
});
