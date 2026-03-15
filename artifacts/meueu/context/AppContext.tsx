import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Practice = {
  abordagem: string;
  nome: string;
  justificativa: string;
  passos: string[];
  frequencia: string;
};

export type GeneratedPlan = {
  sintese: string;
  fraseIntencao: string;
  praticas: Practice[];
};

export type UserProfile = {
  currentAdjectives: string[];
  futureAdjectives: string[];
  onboardingComplete: boolean;
  interventionsViewed: string[];
  lastInterventionDate: string | null;
  streakDays: number;
  generatedPlan: GeneratedPlan | null;
};

type AppContextType = {
  profile: UserProfile;
  setCurrentAdjectives: (adjs: string[]) => void;
  setFutureAdjectives: (adjs: string[]) => void;
  completeOnboarding: (plan?: GeneratedPlan) => void;
  markInterventionViewed: (id: string) => void;
  resetProfile: () => void;
  setPlan: (plan: GeneratedPlan) => void;
  isLoading: boolean;
};

const defaultProfile: UserProfile = {
  currentAdjectives: [],
  futureAdjectives: [],
  onboardingComplete: false,
  interventionsViewed: [],
  lastInterventionDate: null,
  streakDays: 0,
  generatedPlan: null,
};

const STORAGE_KEY = "@meueu_profile_v2";

function generateDeviceId(): string {
  return "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as UserProfile;
          setProfile({ ...defaultProfile, ...parsed });
          if (parsed.generatedPlan) {
            await AsyncStorage.setItem(
              "@meueu_plan",
              JSON.stringify(parsed.generatedPlan)
            );
          }
          if (parsed.futureAdjectives?.length) {
            await AsyncStorage.setItem(
              "@meueu_future_adjectives",
              JSON.stringify(parsed.futureAdjectives)
            );
          }
        }
      } catch {}

      try {
        const existing = await AsyncStorage.getItem("@meueu_device_id");
        if (!existing) {
          await AsyncStorage.setItem("@meueu_device_id", generateDeviceId());
        }
      } catch {}

      setIsLoading(false);
    };
    load();
  }, []);

  const save = useCallback(async (updated: UserProfile) => {
    setProfile(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const setCurrentAdjectives = useCallback(
    (adjs: string[]) => {
      save({ ...profile, currentAdjectives: adjs });
    },
    [profile, save]
  );

  const setFutureAdjectives = useCallback(
    (adjs: string[]) => {
      save({ ...profile, futureAdjectives: adjs });
      AsyncStorage.setItem("@meueu_future_adjectives", JSON.stringify(adjs)).catch(
        () => {}
      );
    },
    [profile, save]
  );

  const setPlan = useCallback(
    (plan: GeneratedPlan) => {
      save({ ...profile, generatedPlan: plan });
      AsyncStorage.setItem("@meueu_plan", JSON.stringify(plan)).catch(() => {});
    },
    [profile, save]
  );

  const completeOnboarding = useCallback(
    (plan?: GeneratedPlan) => {
      const today = new Date().toISOString().split("T")[0];
      const resolvedPlan = plan ?? profile.generatedPlan;
      save({
        ...profile,
        onboardingComplete: true,
        lastInterventionDate: today,
        streakDays: 1,
        generatedPlan: resolvedPlan,
      });
      if (resolvedPlan) {
        AsyncStorage.setItem("@meueu_plan", JSON.stringify(resolvedPlan)).catch(
          () => {}
        );
      }
    },
    [profile, save]
  );

  const markInterventionViewed = useCallback(
    (id: string) => {
      const today = new Date().toISOString().split("T")[0];
      const wasYesterday =
        profile.lastInterventionDate ===
        new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const isToday = profile.lastInterventionDate === today;
      const newStreak = isToday
        ? profile.streakDays
        : wasYesterday
          ? profile.streakDays + 1
          : 1;

      save({
        ...profile,
        interventionsViewed: [...profile.interventionsViewed, id],
        lastInterventionDate: today,
        streakDays: newStreak,
      });
    },
    [profile, save]
  );

  const resetProfile = useCallback(() => {
    save({ ...defaultProfile });
  }, [save]);

  return (
    <AppContext.Provider
      value={{
        profile,
        setCurrentAdjectives,
        setFutureAdjectives,
        completeOnboarding,
        markInterventionViewed,
        resetProfile,
        setPlan,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
