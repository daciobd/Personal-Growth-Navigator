import { Feather } from "@expo/vector-icons";
import { router, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGamification } from "@/context/GamificationContext";
import { getApiUrl } from "@/utils/api";

type Message = {
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
};

export default function CoachScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isInTabs = segments.includes("(tabs)" as never);
  const { deviceId, recordCoachMessage } = useGamification();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const listRef = useRef<FlatList>(null);

  const domain = getApiUrl();

  useEffect(() => {
    fetch(`${domain}/api/coach/history?deviceId=${encodeURIComponent(deviceId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.history) {
          setMessages(data.history);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [deviceId, domain]);

  const scrollToEnd = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    if (!loadingHistory && messages.length > 0) {
      scrollToEnd();
    }
  }, [loadingHistory, messages.length]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    scrollToEnd();

    try {
      const history = messages.slice(-20);
      const response = await fetch(`${domain}/api/coach/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId, message: text, history }),
      });

      const data = await response.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response ?? "Estou aqui com você.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      recordCoachMessage();
      scrollToEnd();
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Não consegui me conectar. Tente novamente." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowAssistant,
        ]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Feather name="message-circle" size={14} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.primary }]
              : [styles.bubbleAssistant, { backgroundColor: colors.card, borderColor: colors.cardBorder }],
          ]}
        >
          <Text
            style={[
              styles.bubbleText,
              {
                color: isUser ? "#fff" : colors.text,
                fontFamily: "Inter_400Regular",
              },
            ]}
          >
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: colors.background },
        Platform.OS === "web" && { paddingBottom: 60 },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + 12,
            borderBottomColor: colors.cardBorder,
            backgroundColor: colors.card,
          },
        ]}
      >
        {!isInTabs && (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        )}
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Coach
          </Text>
          <Text style={[styles.headerSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Seu espaço de reflexão
          </Text>
        </View>
        <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
      </View>

      {loadingHistory ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={[
            styles.messageList,
            { paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 16 },
          ]}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: "#EAF2EF" }]}>
                <Feather name="message-circle" size={28} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                Olá! Sou seu coach.
              </Text>
              <Text style={[styles.emptyBody, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                Estou aqui para apoiar sua jornada. Como você está se sentindo hoje?
              </Text>
            </View>
          }
        />
      )}

      <View
        style={[
          styles.inputBar,
          {
            borderTopColor: colors.cardBorder,
            backgroundColor: colors.card,
            paddingBottom: Platform.OS === "web" ? 16 : insets.bottom + 8,
          },
        ]}
      >
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Digite sua mensagem..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.background,
              borderColor: colors.cardBorder,
              fontFamily: "Inter_400Regular",
            },
          ]}
          onSubmitEditing={sendMessage}
        />
        <Pressable
          onPress={sendMessage}
          disabled={!input.trim() || sending}
          style={[
            styles.sendBtn,
            {
              backgroundColor:
                input.trim() && !sending ? colors.primary : colors.cardBorder,
            },
          ]}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="send" size={18} color="#fff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17 },
  headerSub: { fontSize: 12 },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  messageRowUser: { justifyContent: "flex-end" },
  messageRowAssistant: { justifyContent: "flex-start" },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 17, textAlign: "center" },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  inputBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
});
