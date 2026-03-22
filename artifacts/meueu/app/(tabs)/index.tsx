import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import UnifiedCheckin from "@/components/UnifiedCheckin";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";
import { getRelevantInterventions } from "@/data/interventions";
import { getApiUrl } from "@/utils/api";
import { LEVELS, getLevelForXP, getProgressInLevel } from "@/data/gamification";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

const APPROACH_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8", icon: "edit-3" },
  ACT: { bg: "#F0FDF4", text: "#166534", icon: "compass" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8", icon: "star" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  "Atenção Plena": { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  DBT: { bg: "#FFF7ED", text: "#9A3412", icon: "wind" },
  CFT: { bg: "#FDF2F8", text: "#86198F", icon: "heart" },
};

type CheckinStatus = "done" | "missed";

const TODAY_KEY = new Date().toISOString().split("T")[0];
const CHECKINS_KEY = `@meueu_plan_checkins_${TODAY_KEY}`;

export default function TodayScreen() {
  const colors = Colors.light;
  const insets = useSafeAreaInsets();
  const { profile } = useApp();
  const { isLoggedIn } = useAuth();
  const { streak, totalXP, currentLevel } = useGamification();
  const plan = profile.generatedPlan;
  const domain = getApiUrl();

  const [hasAssessment, setHasAssessment] = useState(true);
  const [practiceCheckins, setPracticeCheckins] = useState<Record<number, CheckinStatus>>({});
  const [expandedPractices, setExpandedPractices] = useState<Set<number>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem("@meueu_assessments").then((val) => {
      setHasAssessment(val !== null);
    });
    AsyncStorage.getItem(CHECKINS_KEY).then((val) => {
      if (val) setPracticeCheckins(JSON.parse(val));
    });
  }, []);

  const interventions = useMemo(
    () =>
      getRelevantInterventions(
        profile.currentAdjectives,
        profile.futureAdjectives
      ),
    [profile.currentAdjectives, profile.futureAdjectives]
  );

  const todayDone = interventions.filter((i) =>
    profile.interventionsViewed.includes(i.id)
  ).length;

  const progress = getProgressInLevel(totalXP);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  const handlePracticeCheckin = useCallback(
    async (idx: number, status: CheckinStatus) => {
      const updated = { ...practiceCheckins, [idx]: status };
      setPracticeCheckins(updated);
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(updated));

      if (!domain || !plan?.praticas?.[idx]) return;
      const deviceId = (await AsyncStorage.getItem("@meueu_device_id")) ?? "unknown";
      const practice = plan.praticas[idx];
      try {
        await fetch(`${domain}/api/daily/checkin`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId,
            practiceIdx: idx,
            practiceName: practice.nome,
            completed: status === "done",
          }),
        });
      } catch {
        // falha silenciosa — estado local já salvo
      }
    },
    [practiceCheckins, domain, plan]
  );

  const toggleExpand = useCallback((idx: number) => {
    setExpandedPractices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* ── Cabeçalho ─────────────────────────────────────── */}
      <View style={styles.topRow}>
        <View style={styles.greeting}>
          <Text
            style={[
              styles.greetingText,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {getGreeting()}
          </Text>
          <Text
            style={[
              styles.heading,
              { color: colors.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            Sua jornada
          </Text>
        </View>
        {/* Streak compacto no cabeçalho */}
        <View
          style={[
            styles.streakPill,
            { backgroundColor: colors.chip?.default ?? "#F5F5F5" },
          ]}
        >
          <Feather name="zap" size={13} color="#E8A838" />
          <Text
            style={[
              styles.streakPillText,
              { color: colors.text, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {streak || profile.streakDays}{" "}
            {(streak || profile.streakDays) === 1 ? "dia" : "dias"}
          </Text>
        </View>
      </View>

      {/* ── Banner salvar progresso ────────────────────────── */}
      {!isLoggedIn && (
        <Pressable
          onPress={() => router.push("/auth/register")}
          style={styles.saveBanner}
        >
          <View>
            <Text style={styles.saveBannerTitle}>Salvar meu progresso</Text>
            <Text style={styles.saveBannerSub}>
              Crie uma conta gratuita para não perder seus dados
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}

      {/* ── Big Five CTA (só se não fez o teste) ──────────── */}
      {!hasAssessment && (
        <Pressable
          onPress={() => router.push("/assessment")}
          style={({ pressed }) => [
            styles.bigFiveCard,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="bar-chart-2" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.bigFiveTitle, { fontFamily: "Inter_700Bold" }]}
            >
              Descubra seu perfil Big Five
            </Text>
            <Text
              style={[styles.bigFiveSub, { fontFamily: "Inter_400Regular" }]}
            >
              120 itens · 30 facetas · 15 min · Científico
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}

      {/* ════════════════════════════════════════════════════
          BLOCO 1 — Práticas de hoje
      ════════════════════════════════════════════════════ */}
      <View style={styles.blockHeader}>
        <Feather name="sun" size={16} color={colors.primary} />
        <Text
          style={[
            styles.blockTitle,
            { color: colors.text, fontFamily: "Inter_700Bold" },
          ]}
        >
          Práticas de hoje
        </Text>
      </View>

      {/* Check-in da jornada ativa (se houver) */}
      <UnifiedCheckin journeyOnly />

      {/* Cards do plano personalizado com check-in inline */}
      {plan?.praticas ? (
        plan.praticas.map((practice, i) => {
          const aColor = APPROACH_COLORS[practice.abordagem] ?? {
            bg: "#F5F5F5",
            text: "#555",
            icon: "activity",
          };
          const status = practiceCheckins[i] ?? null;
          const isExpanded = expandedPractices.has(i);

          return (
            <View
              key={i}
              style={[
                styles.practiceCard,
                {
                  backgroundColor: colors.card,
                  borderColor:
                    status === "done"
                      ? "#22C55E40"
                      : status === "missed"
                      ? "#EF444440"
                      : colors.cardBorder,
                  borderWidth: status ? 1.5 : 1,
                },
              ]}
            >
              {/* Topo: ícone + abordagem + nome */}
              <View style={styles.practiceTop}>
                <View
                  style={[
                    styles.practiceIconBox,
                    { backgroundColor: aColor.bg },
                  ]}
                >
                  <Feather
                    name={aColor.icon as any}
                    size={16}
                    color={aColor.text}
                  />
                </View>
                <View style={styles.practiceTopText}>
                  <View
                    style={[
                      styles.badgeSmall,
                      { backgroundColor: aColor.bg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeSmallText,
                        {
                          color: aColor.text,
                          fontFamily: "Inter_600SemiBold",
                        },
                      ]}
                    >
                      {practice.abordagem}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.practiceName,
                      { color: colors.text, fontFamily: "Inter_600SemiBold" },
                    ]}
                  >
                    {practice.nome}
                  </Text>
                </View>
                {/* Indicador de status */}
                {status === "done" && (
                  <Feather name="check-circle" size={18} color="#22C55E" />
                )}
                {status === "missed" && (
                  <Feather name="x-circle" size={18} color="#EF4444" />
                )}
              </View>

              {/* Justificativa — 1 linha com "ver mais" inline */}
              <Text
                style={[
                  styles.justificativa,
                  { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
                ]}
                numberOfLines={isExpanded ? undefined : 1}
                ellipsizeMode="tail"
              >
                {practice.justificativa}
              </Text>
              <Pressable onPress={() => toggleExpand(i)}>
                <Text
                  style={[
                    styles.verMais,
                    { color: colors.primary, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {isExpanded ? "ver menos" : "ver mais"}
                </Text>
              </Pressable>

              {/* Frequência */}
              <View style={styles.frequencyRow}>
                <Feather name="clock" size={12} color={colors.textMuted} />
                <Text
                  style={[
                    styles.frequencyText,
                    { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {practice.frequencia}
                </Text>
              </View>

              {/* Ação principal: Ver passos (botão primário sólido) */}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/intervention/[id]",
                    params: {
                      id: `plan-${i}`,
                      practice: JSON.stringify(practice),
                    },
                  })
                }
                style={({ pressed }) => [
                  styles.primaryActionBtn,
                  { backgroundColor: aColor.text, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Text
                  style={[
                    styles.primaryActionText,
                    { fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  Ver passos
                </Text>
                <Feather name="arrow-right" size={14} color="#fff" />
              </Pressable>

              {/* Check-in secundário (outline) */}
              {!status && (
                <View style={styles.checkinRow}>
                  <Pressable
                    style={[
                      styles.checkinBtn,
                      styles.checkinDoneOutline,
                      { borderColor: "#22C55E" },
                    ]}
                    onPress={() => handlePracticeCheckin(i, "done")}
                  >
                    <Feather name="check" size={13} color="#22C55E" />
                    <Text
                      style={[
                        styles.checkinBtnOutlineText,
                        { color: "#22C55E", fontFamily: "Inter_500Medium" },
                      ]}
                    >
                      Fiz
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.checkinBtn,
                      styles.checkinMissedOutline,
                      { borderColor: "#D1D5DB" },
                    ]}
                    onPress={() => handlePracticeCheckin(i, "missed")}
                  >
                    <Feather name="x" size={13} color="#9CA3AF" />
                    <Text
                      style={[
                        styles.checkinBtnOutlineText,
                        { color: "#9CA3AF", fontFamily: "Inter_500Medium" },
                      ]}
                    >
                      Não consegui
                    </Text>
                  </Pressable>
                </View>
              )}
              {status && (
                <Pressable
                  onPress={() => handlePracticeCheckin(i, status === "done" ? "missed" : "done")}
                  style={styles.undoRow}
                >
                  <Feather name="rotate-ccw" size={11} color={colors.textMuted} />
                  <Text
                    style={[
                      styles.undoText,
                      { color: colors.textMuted, fontFamily: "Inter_400Regular" },
                    ]}
                  >
                    {status === "done" ? "Marcado como feito" : "Marcado como não feito"} · desfazer
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })
      ) : (
        <Pressable
          onPress={() => router.push("/onboarding")}
          style={[
            styles.emptyPlan,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Feather name="plus-circle" size={20} color={colors.primary} />
          <Text
            style={[
              styles.emptyPlanText,
              { color: colors.text, fontFamily: "Inter_500Medium" },
            ]}
          >
            Gerar meu plano personalizado
          </Text>
          <Feather name="arrow-right" size={16} color={colors.primary} />
        </Pressable>
      )}

      {/* ── Banner Eu Futuro (entre bloco 1 e 2) ──────────── */}
      {plan?.fraseIntencao && (
        <View
          style={[styles.intentionBanner, { backgroundColor: colors.primary }]}
        >
          <Feather name="zap" size={16} color="rgba(255,255,255,0.8)" />
          <Text
            style={[
              styles.intentionText,
              { fontFamily: "Inter_500Medium" },
            ]}
          >
            {plan.fraseIntencao}
          </Text>
        </View>
      )}

      {/* ════════════════════════════════════════════════════
          BLOCO 2 — Progresso do dia (compacto, 1 linha)
      ════════════════════════════════════════════════════ */}
      <View
        style={[
          styles.progressRow,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
        ]}
      >
        {/* Nível */}
        <View style={styles.levelBadge}>
          <Feather name="layers" size={11} color={colors.primary} />
          <Text
            style={[
              styles.levelText,
              { color: colors.primary, fontFamily: "Inter_700Bold" },
            ]}
          >
            Nv {currentLevel.level}
          </Text>
        </View>

        {/* Barra de XP */}
        <View style={styles.xpBarWrap}>
          <Text
            style={[
              styles.xpLabel,
              { color: colors.text, fontFamily: "Inter_500Medium" },
            ]}
          >
            {currentLevel.title}
          </Text>
          <View
            style={[
              styles.xpBarOuter,
              { backgroundColor: colors.cardBorder },
            ]}
          >
            <View
              style={[
                styles.xpBarInner,
                {
                  backgroundColor: colors.primary,
                  width: `${progress * 100}%` as any,
                },
              ]}
            />
          </View>
        </View>

        {/* XP total */}
        <Text
          style={[
            styles.xpTotal,
            { color: colors.textMuted, fontFamily: "Inter_400Regular" },
          ]}
        >
          {totalXP} XP
        </Text>

        {/* Separador */}
        <View
          style={[styles.dividerV, { backgroundColor: colors.cardBorder }]}
        />

        {/* Streak */}
        <Feather name="zap" size={13} color="#E8A838" />
        <Text
          style={[
            styles.streakCount,
            { color: colors.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {streak || profile.streakDays}{" "}
          {(streak || profile.streakDays) === 1 ? "dia" : "dias"}
        </Text>
      </View>

      {/* ════════════════════════════════════════════════════
          BLOCO 3 — Explorar práticas extras
      ════════════════════════════════════════════════════ */}
      <View style={styles.blockHeader}>
        <Feather name="compass" size={16} color={colors.primary} />
        <Text
          style={[
            styles.blockTitle,
            { color: colors.text, fontFamily: "Inter_700Bold" },
          ]}
        >
          Explorar práticas extras
        </Text>
        <View
          style={[
            styles.counterBadge,
            { backgroundColor: colors.chip?.default ?? "#F5F5F5" },
          ]}
        >
          <Text
            style={[
              styles.counterText,
              { color: colors.textMuted, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {todayDone}/{Math.min(interventions.length, 5)}
          </Text>
        </View>
      </View>

      {interventions.slice(0, 5).map((intervention) => (
        <Pressable
          key={intervention.id}
          onPress={() =>
            router.push({
              pathname: "/intervention/[id]",
              params: { id: intervention.id },
            })
          }
          style={({ pressed }) => [
            styles.miniCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <View style={styles.miniRow}>
            <Text
              style={[
                styles.miniTitle,
                { color: colors.text, fontFamily: "Inter_600SemiBold" },
              ]}
            >
              {intervention.title}
            </Text>
            {profile.interventionsViewed.includes(intervention.id) && (
              <Feather name="check-circle" size={14} color={colors.success} />
            )}
          </View>
          <Text
            style={[
              styles.miniDesc,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {intervention.description}
          </Text>
          <Text
            style={[
              styles.miniTherapy,
              { color: colors.textMuted, fontFamily: "Inter_400Regular" },
            ]}
          >
            {intervention.therapy} · {intervention.duration}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 12 },

  // Cabeçalho
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: { gap: 2 },
  greetingText: { fontSize: 14 },
  heading: { fontSize: 26, lineHeight: 32 },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
  },
  streakPillText: { fontSize: 13 },

  // Banners
  saveBanner: {
    backgroundColor: "#E8A838",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  saveBannerTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  saveBannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },
  bigFiveCard: {
    backgroundColor: "#3A5A8C",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bigFiveTitle: { color: "#fff", fontSize: 15 },
  bigFiveSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  // Títulos de bloco
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  blockTitle: { fontSize: 17, flex: 1 },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  counterText: { fontSize: 12 },

  // Cards de práticas
  practiceCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  practiceTop: { flexDirection: "row", gap: 10, alignItems: "center" },
  practiceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  practiceTopText: { flex: 1, gap: 4 },
  badgeSmall: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeSmallText: { fontSize: 10 },
  practiceName: { fontSize: 14, lineHeight: 19 },
  justificativa: { fontSize: 13, lineHeight: 19 },
  verMais: { fontSize: 12, marginTop: -4 },
  frequencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  frequencyText: { fontSize: 12, flex: 1 },
  // Botão primário sólido — Ver passos
  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
  },
  primaryActionText: {
    fontSize: 14,
    color: "#fff",
  },

  // Check-in secundário (outline)
  checkinRow: {
    flexDirection: "row",
    gap: 8,
  },
  checkinBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  checkinDoneOutline: {
    backgroundColor: "transparent",
  },
  checkinMissedOutline: {
    backgroundColor: "transparent",
  },
  checkinBtnOutlineText: {
    fontSize: 12,
  },
  undoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: -2,
  },
  undoText: { fontSize: 11 },

  // Empty plan
  emptyPlan: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  emptyPlanText: { flex: 1, fontSize: 14 },

  // Banner intenção
  intentionBanner: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  intentionText: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    lineHeight: 21,
  },

  // Bloco 2 — Progresso compacto
  progressRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#EAF2EF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelText: { fontSize: 11 },
  xpBarWrap: { flex: 1, gap: 3 },
  xpLabel: { fontSize: 11 },
  xpBarOuter: { height: 4, borderRadius: 2, overflow: "hidden" },
  xpBarInner: { height: 4, borderRadius: 2 },
  xpTotal: { fontSize: 11 },
  dividerV: { width: 1, height: 24 },
  streakCount: { fontSize: 13 },

  // Bloco 3 — Mini cards de intervenções
  miniCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  miniRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  miniTitle: { fontSize: 14 },
  miniDesc: { fontSize: 12, lineHeight: 17 },
  miniTherapy: { fontSize: 12 },
});
