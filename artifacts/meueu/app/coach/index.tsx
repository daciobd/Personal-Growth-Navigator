import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { useApp } from "@/context/AppContext";
import { useGamification } from "@/context/GamificationContext";
import { getApiUrl } from "@/utils/api";
import { track } from "@/utils/analytics";
import { usePreferredApproach } from "@/hooks/usePreferredApproach";

type CoachOptionType = "action" | "reflection" | "alternative";

type CoachOption = {
  type: CoachOptionType;
  label: string;
  prompt: string;
};

type CoachMeta = {
  promptVersion: string;
  usedFallback: boolean;
  missingTypes: CoachOptionType[];
  duplicateTypes: CoachOptionType[];
  priorityType?: CoachOptionType;
  adaptiveReason?: string;
};

type CommitmentLevel = "yes" | "maybe" | "not_yet";
type EmotionalState = "stuck" | "confused" | "emotional" | "calm";

type AdaptiveSignals = {
  onboardingCommitment?: CommitmentLevel;
  emotionalState?: EmotionalState;
  recentClicksByType?: Partial<Record<CoachOptionType, number>>;
};

const ADAPTIVE_SIGNALS_KEY = "@meueu_coach_adaptive_signals";

type Message = {
  role: "user" | "assistant";
  content: string;
  options?: CoachOption[];
  meta?: CoachMeta;
  createdAt?: string;
};

type UserContext = {
  problemLabel?: string;
  currentAdjectives?: string[];
  futureAdjectives?: string[];
};

const OPTION_TYPE_ICON: Record<CoachOptionType, string> = {
  action: "play",
  reflection: "help-circle",
  alternative: "shuffle",
};

// ─── Defensive read only (NO duplicated normalization logic) ───────────────
// Backend is the source of truth. Frontend trusts the typed contract and
// only handles the legacy string[] case for cached messages from older
// backend versions. All sanitization/ordering/validation lives in the
// backend's normalizeCoachResponse.
function readOptions(raw: unknown): CoachOption[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  // Legacy fallback: if the backend returned plain strings (very old version),
  // convert them positionally to typed options. This is the ONLY coercion
  // the frontend does.
  if (typeof raw[0] === "string") {
    const types: CoachOptionType[] = ["action", "reflection", "alternative"];
    return raw
      .filter((s): s is string => typeof s === "string" && s.trim().length > 0)
      .slice(0, 3)
      .map((s, i) => ({ type: types[i] ?? "alternative", label: s, prompt: s }));
  }

  // Trust the typed contract — backend already validated.
  return raw as CoachOption[];
}

function readMeta(raw: unknown): CoachMeta | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const m = raw as Record<string, unknown>;
  if (typeof m.promptVersion !== "string") return undefined;
  const validTypes = ["action", "reflection", "alternative"] as const;
  const priorityType =
    typeof m.priorityType === "string" && (validTypes as readonly string[]).includes(m.priorityType)
      ? (m.priorityType as CoachOptionType)
      : undefined;
  return {
    promptVersion: m.promptVersion,
    usedFallback: m.usedFallback === true,
    missingTypes: Array.isArray(m.missingTypes) ? (m.missingTypes as CoachOptionType[]) : [],
    duplicateTypes: Array.isArray(m.duplicateTypes) ? (m.duplicateTypes as CoachOptionType[]) : [],
    priorityType,
    adaptiveReason: typeof m.adaptiveReason === "string" ? m.adaptiveReason : undefined,
  };
}

// ─── Adaptive signals: persist click counts locally ────────────────────────
// We track per-device recent clicks so the next request can send them as
// signals to the backend's decidePriority(). The store is small and bounded.

async function loadAdaptiveSignals(): Promise<AdaptiveSignals> {
  try {
    const [rawSignals, commitment] = await Promise.all([
      AsyncStorage.getItem(ADAPTIVE_SIGNALS_KEY),
      AsyncStorage.getItem("@meueu_onboarding_commitment"),
    ]);
    const stored: AdaptiveSignals = rawSignals ? JSON.parse(rawSignals) : {};
    const onboardingCommitment: CommitmentLevel | undefined =
      commitment === "yes" ? "yes" :
      commitment === "maybe" ? "maybe" :
      commitment === "no" || commitment === "not_yet" ? "not_yet" :
      undefined;
    return { ...stored, onboardingCommitment };
  } catch {
    return {};
  }
}

async function recordOptionClick(type: CoachOptionType): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(ADAPTIVE_SIGNALS_KEY);
    const current: AdaptiveSignals = raw ? JSON.parse(raw) : {};
    const counts = { ...(current.recentClicksByType ?? {}) };
    counts[type] = (counts[type] ?? 0) + 1;
    await AsyncStorage.setItem(
      ADAPTIVE_SIGNALS_KEY,
      JSON.stringify({ ...current, recentClicksByType: counts })
    );
  } catch {
    // fire-and-forget
  }
}

export default function CoachScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const isInTabs = segments.includes("(tabs)" as never);
  const { deviceId, recordCoachMessage } = useGamification();
  const { preferred } = usePreferredApproach();
  const { profile } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [userContext, setUserContext] = useState<UserContext>({});
  const listRef = useRef<FlatList>(null);

  const domain = getApiUrl();

  // Load onboarding context (problem from AsyncStorage + adjectives from profile)
  useEffect(() => {
    AsyncStorage.getItem("@meueu_onboarding_problem")
      .then((raw) => {
        let problemLabel: string | undefined;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as { label?: string };
            problemLabel = parsed.label;
          } catch {}
        }
        setUserContext({
          problemLabel,
          currentAdjectives: profile.currentAdjectives,
          futureAdjectives: profile.futureAdjectives,
        });
      })
      .catch(() => {
        setUserContext({
          currentAdjectives: profile.currentAdjectives,
          futureAdjectives: profile.futureAdjectives,
        });
      });
  }, [profile.currentAdjectives, profile.futureAdjectives]);

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

  /**
   * Send a message to the Coach.
   * - With no override: uses the input field, displays input as user message.
   * - With override: uses the option's prompt as the API payload, but displays
   *   the option's label as the user message in the UI.
   */
  const sendMessage = async (override?: { label: string; prompt: string }) => {
    const apiText = (override?.prompt ?? input).trim();
    const displayText = (override?.label ?? input).trim();
    if (!apiText || sending) return;

    const userMsg: Message = { role: "user", content: displayText };

    // Strip options from previous assistant message — they're consumed
    setMessages((prev) => {
      const stripped = prev.map((m, i) =>
        i === prev.length - 1 && m.role === "assistant" ? { ...m, options: undefined } : m
      );
      return [...stripped, userMsg];
    });

    if (!override) setInput("");
    setSending(true);
    scrollToEnd();

    try {
      const history = messages.slice(-20).map(({ role, content }) => ({ role, content }));
      const adaptiveSignals = await loadAdaptiveSignals();
      const response = await fetch(`${domain}/api/coach/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          message: apiText,
          history,
          preferredApproach: preferred?.key,
          userContext,
          adaptiveSignals,
        }),
      });

      const data = await response.json();
      const options = readOptions(data.options);
      const meta = readMeta(data.meta);
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response ?? "Estou aqui com você.",
        options,
        meta,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      recordCoachMessage();

      // Track render — types present + fallback + duplicate + adaptive signals
      track("coach_response_rendered", {
        prompt_version: meta?.promptVersion ?? "unknown",
        used_fallback: meta?.usedFallback ?? false,
        missing_types: meta?.missingTypes ?? [],
        duplicate_types: meta?.duplicateTypes ?? [],
        types_present: options?.map((o) => o.type) ?? [],
        priority_type: meta?.priorityType ?? "unknown",
        adaptive_reason: meta?.adaptiveReason ?? "unknown",
      });

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

  const handleOptionPress = (option: CoachOption, position: number, meta?: CoachMeta) => {
    // Persist click for next request's adaptive signals
    recordOptionClick(option.type);

    track("coach_option_clicked", {
      type: option.type,
      label: option.label,
      position,
      prompt_version: meta?.promptVersion ?? "unknown",
      used_fallback: meta?.usedFallback ?? false,
      priority_type: meta?.priorityType ?? "unknown",
      adaptive_reason: meta?.adaptiveReason ?? "unknown",
    });
    sendMessage({ label: option.label, prompt: option.prompt });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    const showOptions = !isUser && Array.isArray(item.options) && item.options.length > 0 && !sending;

    return (
      <View style={styles.messageBlock}>
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

        {showOptions && (
          <View style={styles.optionsContainer}>
            {item.options!.map((option, idx) => {
              const icon = OPTION_TYPE_ICON[option.type];
              return (
                <Pressable
                  key={`${option.label}-${idx}`}
                  onPress={() => handleOptionPress(option, idx, item.meta)}
                  style={({ pressed }) => [
                    styles.optionButton,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.primary,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    },
                  ]}
                >
                  <Feather name={icon as any} size={12} color={colors.primary} />
                  <Text
                    style={[
                      styles.optionText,
                      { color: colors.primary, fontFamily: "Inter_500Medium" },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
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
          onSubmitEditing={() => sendMessage()}
        />
        <Pressable
          onPress={() => sendMessage()}
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
  messageBlock: {
    gap: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  optionsContainer: {
    paddingLeft: 36,
    gap: 6,
    marginTop: 2,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    maxWidth: "85%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 13,
    lineHeight: 18,
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
