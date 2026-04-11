// ─── Daily Loop — Check-in Types and Options ──────────────────────────────

export type DailyCheckinMood =
  | "stuck"
  | "anxious"
  | "confused"
  | "tired"
  | "calm"
  | "motivated";

export type DailyCheckinNeed =
  | "clarity"
  | "energy"
  | "courage"
  | "lightness"
  | "focus"
  | "restart";

export type DailyCheckin = {
  mood: DailyCheckinMood;
  need: DailyCheckinNeed;
};

export type CheckinOption<T> = {
  id: T;
  label: string;
  icon: string; // Feather icon name
};

export const MOOD_OPTIONS: CheckinOption<DailyCheckinMood>[] = [
  { id: "stuck", label: "Travado", icon: "pause-circle" },
  { id: "anxious", label: "Ansioso", icon: "activity" },
  { id: "confused", label: "Confuso", icon: "help-circle" },
  { id: "tired", label: "Cansado", icon: "moon" },
  { id: "calm", label: "Calmo", icon: "feather" },
  { id: "motivated", label: "Com vontade de avançar", icon: "play-circle" },
];

export const NEED_OPTIONS: CheckinOption<DailyCheckinNeed>[] = [
  { id: "clarity", label: "Clareza", icon: "compass" },
  { id: "energy", label: "Energia", icon: "zap" },
  { id: "courage", label: "Coragem", icon: "shield" },
  { id: "lightness", label: "Leveza", icon: "feather" },
  { id: "focus", label: "Foco", icon: "crosshair" },
  { id: "restart", label: "Recomeçar", icon: "refresh-cw" },
];
