// artifacts/api-server/src/routes/journeys.ts
// Versão com progressão adaptativa completa.
// Diferenças da versão anterior:
//   • /day-challenge agora busca histórico do DB e aplica adaptiveEngine
//   • /checkin retorna `adaptiveSignal` para o frontend mostrar ao usuário
//   • novo endpoint GET /api/journeys/context/:deviceId/:journeyId
//     retorna tudo que o frontend precisa para o check-in unificado

import { Router } from "express";
import { db } from "@workspace/db";
import {
  userJourneysTable,
  journeyCheckinsTable,
  dailyCheckinsTable,
} from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { JOURNEY_CATALOG, getJourney, getJourneyDay } from "../data/journeyCatalog.js";
import { analyzeProgress, formatHistoryForPrompt } from "../data/adaptiveEngine.js";

const router = Router();

function todayStr() { return new Date().toISOString().split("T")[0]; }

// ── GET /api/journeys ─────────────────────────────────────
router.get("/", (_req, res) => {
  res.json({
    journeys: JOURNEY_CATALOG.map(j => ({
      id: j.id, title: j.title, subtitle: j.subtitle,
      description: j.description, color: j.color, icon: j.icon,
      targetDimension: j.targetDimension, totalDays: j.days.length,
      phases: j.phases.map(p => ({ number: p.number, title: p.title, description: p.description })),
    })),
  });
});

// ── POST /api/journeys/start ──────────────────────────────
router.post("/start", async (req, res) => {
  const { deviceId, journeyId } = req.body as { deviceId: string; journeyId: string };
  if (!deviceId || !journeyId) { res.status(400).json({ error: "Campos obrigatórios ausentes" }); return; }
  const journey = getJourney(journeyId);
  if (!journey) { res.status(404).json({ error: "Jornada não encontrada" }); return; }

  await db.update(userJourneysTable)
    .set({ status: "paused" })
    .where(and(eq(userJourneysTable.deviceId, deviceId), eq(userJourneysTable.status, "active")));

  const existing = await db.select().from(userJourneysTable)
    .where(and(eq(userJourneysTable.deviceId, deviceId), eq(userJourneysTable.journeyId, journeyId))).limit(1);

  let uj;
  if (existing.length > 0) {
    [uj] = await db.update(userJourneysTable).set({ status: "active" })
      .where(eq(userJourneysTable.id, existing[0].id)).returning();
  } else {
    [uj] = await db.insert(userJourneysTable)
      .values({ deviceId, journeyId, phase: 1, currentDay: 1, status: "active" }).returning();
  }

  res.json({ success: true, userJourney: uj, currentDayPractice: getJourneyDay(journeyId, uj.currentDay) });
});

// ── GET /api/journeys/active/:deviceId ───────────────────
router.get("/active/:deviceId", async (req, res) => {
  const [active] = await db.select().from(userJourneysTable)
    .where(and(eq(userJourneysTable.deviceId, req.params.deviceId), eq(userJourneysTable.status, "active"))).limit(1);

  if (!active) { res.json({ active: null }); return; }

  const journey    = getJourney(active.journeyId);
  const todayPractice = getJourneyDay(active.journeyId, active.currentDay);
  const [todayCI]  = await db.select().from(journeyCheckinsTable)
    .where(and(
      eq(journeyCheckinsTable.deviceId, req.params.deviceId),
      eq(journeyCheckinsTable.journeyId, active.journeyId),
      eq(journeyCheckinsTable.checkinDate, todayStr()),
    )).limit(1);

  res.json({
    active, todayPractice,
    journey: journey ? { id: journey.id, title: journey.title, color: journey.color, phases: journey.phases } : null,
    checkinDoneToday: !!todayCI,
    completionPct: Math.round(((active.currentDay - 1) / 30) * 100),
  });
});

// ── GET /api/journeys/context/:deviceId/:journeyId ────────
// Contexto completo para o check-in unificado (jornada + plano diário)
router.get("/context/:deviceId/:journeyId", async (req, res) => {
  const { deviceId, journeyId } = req.params;

  const [uj] = await db.select().from(userJourneysTable)
    .where(and(eq(userJourneysTable.deviceId, deviceId), eq(userJourneysTable.journeyId, journeyId))).limit(1);
  if (!uj) { res.status(404).json({ error: "Jornada não iniciada" }); return; }

  // Últimos 5 check-ins da jornada
  const recentCheckins = await db.select({
    completed: journeyCheckinsTable.completed,
    note: journeyCheckinsTable.note,
  })
    .from(journeyCheckinsTable)
    .where(and(eq(journeyCheckinsTable.deviceId, deviceId), eq(journeyCheckinsTable.journeyId, journeyId)))
    .orderBy(desc(journeyCheckinsTable.checkinDate))
    .limit(5);

  // Últimos 3 check-ins do plano diário
  const dailyCheckins = await db.select({
    completed: dailyCheckinsTable.completed,
    note: dailyCheckinsTable.note,
  })
    .from(dailyCheckinsTable)
    .where(eq(dailyCheckinsTable.deviceId, deviceId))
    .orderBy(desc(dailyCheckinsTable.checkinDate))
    .limit(3);

  const adaptiveCtx = analyzeProgress(recentCheckins.reverse());
  const journey     = getJourney(journeyId);
  const dayData     = getJourneyDay(journeyId, uj.currentDay);

  res.json({
    userJourney: uj,
    journey: journey ? { id: journey.id, title: journey.title, color: journey.color, phases: journey.phases } : null,
    dayData,
    adaptiveSignal:  adaptiveCtx.signal,
    adaptiveUiHint:  adaptiveCtx.uiHint,
    recentCheckins:  recentCheckins.reverse(),
    dailyRecentCheckins: dailyCheckins,
    completionPct:   Math.round(((uj.currentDay - 1) / 30) * 100),
  });
});

// ── POST /api/journeys/day-challenge ─────────────────────
router.post("/day-challenge", async (req, res) => {
  const { deviceId, journeyId, day, futureAdjectives } = req.body as {
    deviceId: string; journeyId: string; day: number; futureAdjectives?: string[];
  };

  const dayData = getJourneyDay(journeyId, day);
  if (!dayData) { res.status(404).json({ error: "Dia não encontrado" }); return; }
  const journey = getJourney(journeyId);

  // Busca histórico para adaptação
  const recentCheckins = await db.select({
    completed: journeyCheckinsTable.completed,
    note: journeyCheckinsTable.note,
  })
    .from(journeyCheckinsTable)
    .where(and(eq(journeyCheckinsTable.deviceId, deviceId), eq(journeyCheckinsTable.journeyId, journeyId)))
    .orderBy(desc(journeyCheckinsTable.checkinDate))
    .limit(5);

  const adaptive  = analyzeProgress(recentCheckins.reverse());
  const histBlock = formatHistoryForPrompt(recentCheckins);

  const prompt = `Você é um coach terapêutico especializado em ${journey?.title ?? "transformação pessoal"}.

JORNADA: ${journey?.title}
DIA: ${day}/30 | FASE: ${dayData.phase}/3
PRÁTICA BASE: "${dayData.title}"
DESCRIÇÃO BASE: ${dayData.description}
TÉCNICA: ${dayData.technique} (${dayData.approach})
TEMPO ESTIMADO: ${dayData.duration}
${futureAdjectives?.length ? `EU FUTURO: ${futureAdjectives.join(", ")}` : ""}
${histBlock}

SINAL ADAPTATIVO: ${adaptive.signal}
${adaptive.promptModifier}

Gere a proposição de ação do dia em JSON:
{
  "titulo": "Frase curta motivadora (máx 8 palavras)",
  "acao": "O que fazer hoje — concreto e específico. Máx 3 frases.",
  "dica": "Como facilitar hoje. Máx 1 frase.",
  "tempo": "Tempo estimado adaptado",
  "perguntaReflexao": "Pergunta para após a prática",
  "adaptacao": "${adaptive.signal !== "on_track" ? "Frase curta explicando a adaptação (máx 10 palavras)" : ""}"
}

Responda APENAS com JSON válido.`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      messages: [{ role: "user", content: prompt }],
    });
    const raw   = message.content[0].type === "text" ? message.content[0].text : "";
    const match = raw.match(/\{[\s\S]*\}/);
    const challenge = match ? JSON.parse(match[0]) : { titulo: dayData.title, acao: dayData.description, dica: "", tempo: dayData.duration, perguntaReflexao: "", adaptacao: "" };

    res.json({
      success: true, challenge, dayData,
      adaptiveSignal: adaptive.signal,
      adaptiveUiHint: adaptive.uiHint,
    });
  } catch (err) {
    console.error("Journey challenge error:", err);
    res.status(500).json({ error: "Erro ao gerar desafio" });
  }
});

// ── POST /api/journeys/checkin ────────────────────────────
router.post("/checkin", async (req, res) => {
  const { deviceId, journeyId, day, completed, note, comment } = req.body as {
    deviceId: string; journeyId: string; day: number;
    completed: boolean; note?: number; comment?: string;
  };

  const today   = todayStr();
  const dayData = getJourneyDay(journeyId, day);
  if (!dayData) { res.status(404).json({ error: "Dia não encontrado" }); return; }

  const [existing] = await db.select().from(journeyCheckinsTable)
    .where(and(
      eq(journeyCheckinsTable.deviceId, deviceId),
      eq(journeyCheckinsTable.journeyId, journeyId),
      eq(journeyCheckinsTable.checkinDate, today),
    )).limit(1);
  if (existing) { res.json({ success: true, alreadyDone: true }); return; }

  await db.insert(journeyCheckinsTable).values({
    deviceId, journeyId, day, phase: dayData.phase,
    practiceKey: dayData.practiceKey,
    completed, note: note ?? null, comment: comment ?? null, checkinDate: today,
  });

  // Avança dia se completou
  const nextDay    = completed ? Math.min(day + 1, 30) : day;
  const newPhase   = nextDay <= 10 ? 1 : nextDay <= 20 ? 2 : 3;
  const status     = completed && day >= 30 ? "completed" : "active";

  await db.update(userJourneysTable)
    .set({
      currentDay: nextDay, phase: newPhase, status,
      lastPracticeDate: today,
      completedAt: status === "completed" ? new Date() : undefined,
    })
    .where(and(eq(userJourneysTable.deviceId, deviceId), eq(userJourneysTable.journeyId, journeyId)));

  // Calcula próximo sinal adaptativo para o frontend
  const allCheckins = await db.select({ completed: journeyCheckinsTable.completed, note: journeyCheckinsTable.note })
    .from(journeyCheckinsTable)
    .where(and(eq(journeyCheckinsTable.deviceId, deviceId), eq(journeyCheckinsTable.journeyId, journeyId)))
    .orderBy(journeyCheckinsTable.checkinDate)
    .limit(5);

  const nextAdaptive = analyzeProgress(allCheckins);

  res.json({
    success: true, nextDay, journeyCompleted: status === "completed",
    phaseAdvanced: newPhase !== dayData.phase,
    nextAdaptiveSignal: nextAdaptive.signal,
    nextAdaptiveHint:   nextAdaptive.uiHint,
  });
});

// ── GET /api/journeys/progress/:deviceId/:journeyId ───────
router.get("/progress/:deviceId/:journeyId", async (req, res) => {
  const { deviceId, journeyId } = req.params;
  const [uj] = await db.select().from(userJourneysTable)
    .where(and(eq(userJourneysTable.deviceId, deviceId), eq(userJourneysTable.journeyId, journeyId))).limit(1);
  if (!uj) { res.status(404).json({ error: "Jornada não iniciada" }); return; }

  const checkins = await db.select().from(journeyCheckinsTable)
    .where(and(eq(journeyCheckinsTable.deviceId, deviceId), eq(journeyCheckinsTable.journeyId, journeyId)))
    .orderBy(journeyCheckinsTable.day);

  const done    = checkins.filter(c => c.completed).length;
  const notes   = checkins.filter(c => c.note);
  const avgNote = notes.length ? Math.round(notes.reduce((s, c) => s + (c.note ?? 0), 0) / notes.length * 10) / 10 : null;
  const adaptive = analyzeProgress(checkins.slice(-5).map(c => ({ completed: c.completed, note: c.note })));

  let streak = 0;
  const sorted = checkins.filter(c => c.completed).map(c => c.checkinDate).sort().reverse();
  for (let i = 0; i < sorted.length - 1; i++) {
    const diff = Math.round((new Date(sorted[i]).getTime() - new Date(sorted[i+1]).getTime()) / 86400000);
    if (diff === 1) streak++; else break;
  }
  if (sorted.length) streak++;

  res.json({
    userJourney: uj, checkins,
    stats: { completedDays: done, totalDays: uj.currentDay - 1, completionPct: Math.round((done / 30) * 100), avgNote, currentPhase: uj.phase, streak },
    adaptiveSignal: adaptive.signal,
    adaptiveUiHint: adaptive.uiHint,
  });
});

export default router;
