import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
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

export default function ResetPasswordScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const domain = getApiUrl();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Preencha os dois campos de senha.");
      return;
    }
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (!token) {
      setError("Link inválido. Solicite um novo link de redefinição.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${domain}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao redefinir senha.");
        return;
      }
      setDone(true);
    } catch {
      setError("Não foi possível conectar. Verifique sua conexão.");
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
        <View style={styles.topSection}>
          <View style={[styles.iconBox, { backgroundColor: "#F0FDF4" }]}>
            <Feather name="lock" size={28} color="#16A34A" />
          </View>
          <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Nova senha
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Crie uma nova senha para sua conta.
          </Text>
        </View>

        {done ? (
          <>
            <View style={[styles.successBox, { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" }]}>
              <Feather name="check-circle" size={22} color="#16A34A" />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.successTitle, { color: "#14532D", fontFamily: "Inter_700Bold" }]}>
                  Senha redefinida
                </Text>
                <Text style={[styles.successText, { color: "#166534", fontFamily: "Inter_400Regular" }]}>
                  Sua senha foi atualizada com sucesso. Agora você pode entrar com a nova senha.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.replace("/auth/login")}
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.primaryBtnText, { fontFamily: "Inter_600SemiBold" }]}>Ir para o login</Text>
              <Feather name="arrow-right" size={16} color="#fff" />
            </Pressable>
          </>
        ) : (
          <View style={styles.form}>
            {!token && (
              <View style={[styles.errorBox, { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }]}>
                <Feather name="alert-triangle" size={15} color="#92400E" />
                <Text style={[styles.errorText, { color: "#92400E", fontFamily: "Inter_400Regular" }]}>
                  Link inválido ou expirado. Solicite um novo link de redefinição.
                </Text>
              </View>
            )}

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
                Nova senha
              </Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNew}
                  autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
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
                <Pressable onPress={() => setShowNew((v) => !v)} style={styles.eyeBtn}>
                  <Feather name={showNew ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                Confirmar nova senha
              </Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirm}
                  autoComplete="new-password"
                  placeholder="Repita a senha"
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
                <Pressable onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>

            <Pressable
              onPress={handleReset}
              disabled={loading || !token}
              style={[
                styles.primaryBtn,
                { backgroundColor: loading || !token ? colors.textMuted : colors.primary },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={[styles.primaryBtnText, { fontFamily: "Inter_600SemiBold" }]}>Salvar nova senha</Text>
                  <Feather name="check" size={16} color="#fff" />
                </>
              )}
            </Pressable>
          </View>
        )}

        {!done && (
          <Pressable onPress={() => router.replace("/auth/login")} style={styles.backLink}>
            <Text style={[styles.backLinkText, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              Voltar para o login
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 24, gap: 28 },
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
