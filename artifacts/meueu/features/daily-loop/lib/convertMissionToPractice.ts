// ─── DailyMission → Practice adapter ───────────────────────────────────────
// Lets the existing Home (HeroPracticeCard, PersonalizationPanel,
// `/api/daily/checkin`) consume a DailyMission without changing its
// `Practice` contract.
//
// IMPORTANT: this adapter is intentionally lossy in one direction —
// `Practice` is a flatter shape than `DailyMission`. We preserve the
// fields the UI needs and fill defaults for the rest.

import type { Practice } from "@/context/AppContext";
import type {
  DailyMission,
  DailyMissionCategory,
} from "@/features/daily-loop/data/missions";

// The Home expects a human-readable "approach" string. DailyMission has
// `category` instead. We map to a short label so the UI has something to
// show; APPROACH_COLORS lookup falls back to its default tone for these.
const CATEGORY_LABEL: Record<DailyMissionCategory, string> = {
  action: "Ação",
  reflection: "Reflexão",
  alternative: "Caminho leve",
};

export function convertMissionToPractice(mission: DailyMission): Practice {
  return {
    nome: mission.title,
    justificativa: mission.subtitle,
    passos: mission.steps,
    frequencia: "diária",
    // DailyMission has no "origin" field today. Category label is the
    // safest semantic substitute and keeps the existing card layout
    // working without lying about a therapeutic approach.
    abordagem: CATEGORY_LABEL[mission.category],
  };
}
