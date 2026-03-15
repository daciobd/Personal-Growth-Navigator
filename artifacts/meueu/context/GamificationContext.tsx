import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BADGES, LEVELS, getLevelForXP } from "@/data/gamification";

const STORAGE_KEY = "@meueu_gamification_v1";

function generateDeviceId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "device_";
  for (let i = 0; i < 20; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

type EarnedBadge = {
  id: string;
  earnedAt: string;
};

type GamificationState = {
  deviceId: string;
  totalXP: number;
  streak: number;
  maxStreak: number;
  lastCheckinDate: string | null;
  checkinDates: string[];
  totalCheckinsCompleted: number;
  checkinsWithNote: number;
  checkinsWithLowRating: number;
  countHighRatings: number;
  coachMessages: number;
  earnedBadges: EarnedBadge[];
};

type GamificationContextType = {
  deviceId: string;
  totalXP: number;
  streak: number;
  maxStreak: number;
  currentLevel: (typeof LEVELS)[number];
  earnedBadges: EarnedBadge[];
  addXP: (amount: number) => void;
  recordCheckin: (opts: {
    date: string;
    completed: boolean;
    rating?: number;
    hasNote: boolean;
    xpEarned: number;
    streak: number;
  }) => void;
  recordCoachMessage: () => void;
  isLoading: boolean;
};

const defaultState: GamificationState = {
  deviceId: generateDeviceId(),
  totalXP: 0,
  streak: 0,
  maxStreak: 0,
  lastCheckinDate: null,
  checkinDates: [],
  totalCheckinsCompleted: 0,
  checkinsWithNote: 0,
  checkinsWithLowRating: 0,
  countHighRatings: 0,
  coachMessages: 0,
  earnedBadges: [],
};

const GamificationContext = createContext<GamificationContextType | null>(null);

function checkBadges(state: GamificationState): EarnedBadge[] {
  const now = new Date().toISOString();
  const earned = new Set(state.earnedBadges.map((b) => b.id));
  const newBadges: EarnedBadge[] = [...state.earnedBadges];

  const tryAward = (id: string, condition: boolean) => {
    if (condition && !earned.has(id)) {
      earned.add(id);
      newBadges.push({ id, earnedAt: now });
    }
  };

  const level = getLevelForXP(state.totalXP);

  tryAward("primeiro_passo", state.checkinDates.length >= 1);
  tryAward("corajoso", state.totalCheckinsCompleted >= 1);
  tryAward("tres_dias", state.maxStreak >= 3);
  tryAward("sete_dias", state.maxStreak >= 7);
  tryAward("quatorze_dias", state.maxStreak >= 14);
  tryAward("semana_completa", state.checkinDates.length >= 7);
  tryAward("nota_perfeita", state.countHighRatings >= 1 && state.totalCheckinsCompleted >= 1);
  tryAward("sempre_positivo", state.countHighRatings >= 5);
  tryAward("mes_dedicado", state.totalCheckinsCompleted >= 30);
  tryAward("explorador", state.coachMessages >= 1);
  tryAward("conversador", state.coachMessages >= 10);
  tryAward("nivel_5", level.level >= 5);
  tryAward("pleno", level.level >= 10);
  tryAward("anotador", state.checkinsWithNote >= 5);
  tryAward("sincero", state.checkinsWithLowRating >= 3);

  return newBadges;
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GamificationState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as GamificationState;
          setState({ ...defaultState, ...parsed });
        }
      } catch {}
      setIsLoading(false);
    };
    load();
  }, []);

  const save = useCallback(async (updated: GamificationState) => {
    setState(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const addXP = useCallback(
    (amount: number) => {
      const updated: GamificationState = { ...state, totalXP: state.totalXP + amount };
      const withBadges = { ...updated, earnedBadges: checkBadges(updated) };
      save(withBadges);
    },
    [state, save]
  );

  const recordCheckin = useCallback(
    (opts: {
      date: string;
      completed: boolean;
      rating?: number;
      hasNote: boolean;
      xpEarned: number;
      streak: number;
    }) => {
      const updated: GamificationState = {
        ...state,
        totalXP: state.totalXP + opts.xpEarned,
        streak: opts.streak,
        maxStreak: Math.max(state.maxStreak, opts.streak),
        lastCheckinDate: opts.date,
        checkinDates: state.checkinDates.includes(opts.date)
          ? state.checkinDates
          : [...state.checkinDates, opts.date],
        totalCheckinsCompleted: opts.completed
          ? state.totalCheckinsCompleted + 1
          : state.totalCheckinsCompleted,
        checkinsWithNote: opts.hasNote ? state.checkinsWithNote + 1 : state.checkinsWithNote,
        checkinsWithLowRating:
          opts.rating !== undefined && opts.rating <= 2
            ? state.checkinsWithLowRating + 1
            : state.checkinsWithLowRating,
        countHighRatings:
          opts.rating !== undefined && opts.rating >= 4
            ? state.countHighRatings + 1
            : state.countHighRatings,
      };
      const withBadges = { ...updated, earnedBadges: checkBadges(updated) };
      save(withBadges);
    },
    [state, save]
  );

  const recordCoachMessage = useCallback(() => {
    const updated: GamificationState = {
      ...state,
      totalXP: state.totalXP + 2,
      coachMessages: state.coachMessages + 1,
    };
    const withBadges = { ...updated, earnedBadges: checkBadges(updated) };
    save(withBadges);
  }, [state, save]);

  const currentLevel = getLevelForXP(state.totalXP);

  return (
    <GamificationContext.Provider
      value={{
        deviceId: state.deviceId,
        totalXP: state.totalXP,
        streak: state.streak,
        maxStreak: state.maxStreak,
        currentLevel,
        earnedBadges: state.earnedBadges,
        addXP,
        recordCheckin,
        recordCoachMessage,
        isLoading,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error("useGamification must be used inside GamificationProvider");
  return ctx;
}
