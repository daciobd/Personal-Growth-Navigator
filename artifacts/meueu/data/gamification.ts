export type Level = {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
};

export const LEVELS: Level[] = [
  { level: 1, title: "Iniciante", minXP: 0, maxXP: 99 },
  { level: 2, title: "Explorador", minXP: 100, maxXP: 299 },
  { level: 3, title: "Praticante", minXP: 300, maxXP: 599 },
  { level: 4, title: "Buscador", minXP: 600, maxXP: 999 },
  { level: 5, title: "Comprometido", minXP: 1000, maxXP: 1499 },
  { level: 6, title: "Consistente", minXP: 1500, maxXP: 2099 },
  { level: 7, title: "Transformador", minXP: 2100, maxXP: 2799 },
  { level: 8, title: "Mestre", minXP: 2800, maxXP: 3599 },
  { level: 9, title: "Guia", minXP: 3600, maxXP: 4499 },
  { level: 10, title: "Pleno", minXP: 4500, maxXP: Infinity },
];

export function getLevelForXP(xp: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getProgressInLevel(xp: number): number {
  const current = getLevelForXP(xp);
  if (current.maxXP === Infinity) return 1;
  const range = current.maxXP - current.minXP + 1;
  const progress = xp - current.minXP;
  return Math.min(progress / range, 1);
}

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export const BADGES: Badge[] = [
  {
    id: "primeiro_passo",
    name: "Primeiro Passo",
    description: "Completou o primeiro check-in",
    icon: "flag",
  },
  {
    id: "corajoso",
    name: "Corajoso",
    description: "Assumiu o compromisso com uma prática",
    icon: "award",
  },
  {
    id: "tres_dias",
    name: "3 Dias Seguidos",
    description: "Manteve o hábito por 3 dias consecutivos",
    icon: "zap",
  },
  {
    id: "sete_dias",
    name: "7 Dias Seguidos",
    description: "Uma semana inteira de dedicação",
    icon: "star",
  },
  {
    id: "quatorze_dias",
    name: "Duas Semanas",
    description: "14 dias de prática consistente",
    icon: "shield",
  },
  {
    id: "semana_completa",
    name: "Semana Completa",
    description: "7 check-ins em 7 dias seguidos",
    icon: "calendar",
  },
  {
    id: "nota_perfeita",
    name: "Nota Perfeita",
    description: "Registrou nota 5 pela primeira vez",
    icon: "heart",
  },
  {
    id: "sempre_positivo",
    name: "Sempre Positivo",
    description: "5 avaliações com nota 4 ou mais",
    icon: "trending-up",
  },
  {
    id: "mes_dedicado",
    name: "Mês Dedicado",
    description: "30 check-ins realizados no total",
    icon: "target",
  },
  {
    id: "explorador",
    name: "Explorador",
    description: "Iniciou a primeira conversa com o coach",
    icon: "message-circle",
  },
  {
    id: "conversador",
    name: "Conversador",
    description: "10 mensagens trocadas com o coach",
    icon: "message-square",
  },
  {
    id: "nivel_5",
    name: "Comprometido",
    description: "Alcançou o nível 5",
    icon: "layers",
  },
  {
    id: "pleno",
    name: "Pleno",
    description: "Alcançou o nível máximo",
    icon: "sun",
  },
  {
    id: "anotador",
    name: "Anotador",
    description: "Registrou notas em 5 check-ins",
    icon: "edit",
  },
  {
    id: "sincero",
    name: "Sincero",
    description: "Reconheceu dificuldades 3 vezes (nota ≤ 2)",
    icon: "eye",
  },
];

export const XP_TABLE = {
  checkinBase: 5,
  checkinCompleted: 20,
  ratingBonus4: 10,
  ratingBonus5: 15,
  streakBonusPerDay: 5,
  streakBonusMax: 50,
  coachMessage: 2,
} as const;

export function calculateCheckinXP(
  completed: boolean,
  rating: number | undefined,
  streak: number
): number {
  let xp = XP_TABLE.checkinBase;
  if (completed) xp += XP_TABLE.checkinCompleted;
  if (rating !== undefined) {
    if (rating === 5) xp += XP_TABLE.ratingBonus5;
    else if (rating >= 4) xp += XP_TABLE.ratingBonus4;
  }
  const streakBonus = Math.min(streak * XP_TABLE.streakBonusPerDay, XP_TABLE.streakBonusMax);
  xp += streakBonus;
  return xp;
}
