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
import HeroPracticeCard from "@/components/dashboard/HeroPracticeCard";
import PracticeCard from "@/components/dashboard/PracticeCard";
import PersonalizationPanel from "@/components/dashboard/PersonalizationPanel";
import ExtraPracticeGrid from "@/components/dashboard/ExtraPracticeGrid";
import Colors from "@/constants/colors";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useGamification } from "@/context/GamificationContext";
import { getRelevantInterventions } from "@/data/interventions";
import { getApiUrl } from "@/utils/api";
import { LEVELS, getProgressInLevel } from "@/data/gamification";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

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
  const [practiceCheckins, setPracticeCheckins] = useState<
    Record<number, CheckinStatus>
  >({});
  const [expandedPractices, setExpandedPractices] = useState<Set<number>>(
    new Set()
  );

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

  const handleCheckin = useCallback(
    async (idx: number, status: CheckinStatus) => {
      const updated = { ...practiceCheckins, [idx]: status };
      setPracticeCheckins(updated);
      await AsyncStorage.setItem(CHECKINS_KEY, JSON.stringify(updated));

      if (!domain || !plan?.praticas?.[idx]) return;
      const deviceId =
        (await AsyncStorage.getItem("@meueu_device_id")) ?? "unknown";
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

  const streakDays = streak || profile.streakDays;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: insets.top + 16,
          paddingBottom:
            Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
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
              styles.greetingLabel,
              { color: colors.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {getGreeting()}
          </Text>
          <Text
            style={[
              styles.greetingHeading,
              { color: colors.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            Seu próximo passo
          </Text>
        </View>
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
            {streakDays} {streakDays === 1 ? "dia" : "dias"}
          </Text>
        </View>
      </View>

      {/* ── Banner salvar progresso ────────────────────────── */}
      {!isLoggedIn && (
        <Pressable
          onPress={() => router.push("/auth/register")}
          style={styles.saveBanner}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={[
                styles.saveBannerTitle,
                { fontFamily: "Inter_700Bold" },
              ]}
            >
              Salvar meu progresso
            </Text>
            <Text
              style={[
                styles.saveBannerSub,
                { fontFamily: "Inter_400Regular" },
              ]}
            >
              Crie uma conta gratuita para não perder seus dados
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color="#fff" />
        </Pressable>
      )}

      {/* ── Big Five CTA (só se não completou o teste) ──────── */}
      {!hasAssessment && (
        <Pressable
          onPress={() => router.push("/assessment")}
          style={({ pressed }) => [
            styles.bigFiveCard,
            { opacity: pressed ? 0.9 : 1 },
          ]}
        >
          <Feather name="bar-chart-2" size={20} color="#fff" />
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
          <Feather name="arrow-right" size={16} color="#fff" />
        </Pressable>
      )}

      {/* ── Check-in da jornada ativa (se houver) ──────────── */}
      <UnifiedCheckin journeyOnly />

      {/* ════════════════════════════════════════════════════
          BLOCO 1 — Práticas de hoje
      ════════════════════════════════════════════════════ */}
      {plan?.praticas ? (
        <>
          {/* Hero: primeira prática em destaque */}
          <HeroPracticeCard
            practice={plan.praticas[0]}
            practiceIdx={0}
            status={practiceCheckins[0] ?? null}
            onCheckin={(s) => handleCheckin(0, s)}
          />

          {/* Painel de personalização */}
          <PersonalizationPanel
            sintese={plan.sintese}
            currentAdjectives={profile.currentAdjectives}
            futureAdjectives={profile.futureAdjectives}
            primaryApproach={plan.praticas[0]?.abordagem}
          />

          {/* Práticas complementares (2ª em diante) */}
          {plan.praticas.slice(1).map((practice, relIdx) => {
            const idx = relIdx + 1;
            return (
              <PracticeCard
                key={idx}
                practice={practice}
                practiceIdx={idx}
                status={practiceCheckins[idx] ?? null}
                expanded={expandedPractices.has(idx)}
                onToggleExpand={() => toggleExpand(idx)}
                onCheckin={(s) => handleCheckin(idx, s)}
              />
            );
          })}
        </>
      ) : (
        /* Estado vazio: sem plano */
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

      {/* ── Banner Eu Futuro (entre blocos 1 e 2) ──────────── */}
      {plan?.fraseIntencao && (
        <View
          style={[
            styles.intentionBanner,
            { backgroundColor: colors.primary },
          ]}
        >
          <Feather name="zap" size={15} color="rgba(255,255,255,0.75)" />
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
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
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
            style={[styles.xpBarOuter, { backgroundColor: colors.cardBorder }]}
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

        <Text
          style={[
            styles.xpTotal,
            { color: colors.textMuted, fontFamily: "Inter_400Regular" },
          ]}
        >
          {totalXP} XP
        </Text>

        <View
          style={[styles.dividerV, { backgroundColor: colors.cardBorder }]}
        />

        <Feather name="zap" size={13} color="#E8A838" />
        <Text
          style={[
            styles.streakCount,
            { color: colors.text, fontFamily: "Inter_600SemiBold" },
          ]}
        >
          {streakDays} {streakDays === 1 ? "dia" : "dias"}
        </Text>
      </View>

      {/* ════════════════════════════════════════════════════
          BLOCO 3 — Explorar práticas extras
      ════════════════════════════════════════════════════ */}
      <ExtraPracticeGrid
        interventions={interventions}
        viewedIds={profile.interventionsViewed}
        todayDone={todayDone}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },

  // Cabeçalho
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  greeting: { gap: 2 },
  greetingLabel: { fontSize: 14 },
  greetingHeading: { fontSize: 26, lineHeight: 32 },
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
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  saveBannerTitle: { color: "#fff", fontSize: 14 },
  saveBannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 2,
  },
  bigFiveCard: {
    backgroundColor: "#3A5A8C",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  bigFiveTitle: { color: "#fff", fontSize: 14 },
  bigFiveSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 2 },

  // Estado sem plano
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
});
