import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, dailyCheckinsTable, coachMessagesTable, planLogsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

const DIM_NAMES: Record<string, string> = {
  O: "Abertura à Experiência",
  C: "Conscienciosidade",
  E: "Extroversão",
  A: "Amabilidade",
  N: "Neuroticismo",
};

function qualLevel(s: number): string {
  if (s <= 20) return "muito baixo";
  if (s <= 35) return "baixo";
  if (s <= 65) return "médio";
  if (s <= 80) return "alto";
  return "muito alto";
}

// GET /api/admin/report/:deviceId
router.get("/admin/report/:deviceId", async (req, res) => {
  const { deviceId } = req.params;

  try {
    const [checkins, coachMessages, planLogs] = await Promise.all([
      db.select().from(dailyCheckinsTable).where(eq(dailyCheckinsTable.deviceId, deviceId)).orderBy(desc(dailyCheckinsTable.createdAt)).limit(60),
      db.select().from(coachMessagesTable).where(eq(coachMessagesTable.deviceId, deviceId)).orderBy(desc(coachMessagesTable.createdAt)).limit(30),
      db.select().from(planLogsTable).where(eq(planLogsTable.sessionId, deviceId)).orderBy(desc(planLogsTable.createdAt)).limit(5),
    ]);

    const completedCheckins = checkins.filter((c) => c.completed);
    const avgRating = completedCheckins.length > 0
      ? Math.round((completedCheckins.reduce((s, c) => s + (c.rating ?? 0), 0) / completedCheckins.length) * 10) / 10
      : null;

    const maxStreak = checkins.reduce((max, c) => Math.max(max, c.streakDays), 0);
    const totalXP = checkins.reduce((s, c) => s + c.xpEarned, 0);

    res.json({
      checkins,
      coachMessages,
      planLogs,
      stats: {
        totalCheckins: checkins.length,
        completedCheckins: completedCheckins.length,
        avgRating,
        maxStreak,
        totalXP,
        coachInteractions: coachMessages.length,
      },
    });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ error: "Erro ao gerar relatório." });
  }
});

// POST /api/admin/report/:deviceId/interpret
router.post("/admin/report/:deviceId/interpret", async (req, res) => {
  const { big5Scores, clientName, checkinStats } = req.body as {
    big5Scores?: Record<string, number>;
    clientName?: string;
    checkinStats?: { completed: number; total: number; avgRating: number | null; maxStreak: number };
  };

  if (!big5Scores) {
    res.status(400).json({ error: "big5Scores é obrigatório." });
    return;
  }

  const dims = ["O", "C", "E", "A", "N"];
  const profileLines = dims.map((d) => {
    const score = big5Scores[d] ?? 50;
    return `${DIM_NAMES[d]}: ${score}% (${qualLevel(score)})`;
  });

  const statsText = checkinStats
    ? `\nEngajamento: ${checkinStats.completed} check-ins completos de ${checkinStats.total} total, nota média ${checkinStats.avgRating ?? "N/A"}/5, sequência máxima de ${checkinStats.maxStreak} dias.`
    : "";

  const prompt = `Você é um psicólogo clínico escrevendo um relatório de progresso terapêutico para ${clientName ?? "o paciente"}.

Perfil Big Five:
${profileLines.join("\n")}
${statsText}

Escreva uma interpretação clínica estruturada com:
1. Perfil de personalidade (2-3 frases)
2. Pontos fortes identificados (3 bullet points)
3. Áreas de desenvolvimento sugeridas (2-3 bullet points)
4. Recomendações terapêuticas (2-3 frases)

Use linguagem clínica profissional mas acessível. Seja objetivo e baseado nos dados apresentados.`;

  let interpretation = "Não foi possível gerar a interpretação no momento.";

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    const content = message.content[0];
    if (content.type === "text") interpretation = content.text.trim();
  } catch (err) {
    console.error("AI interpretation error:", err);
  }

  res.json({ interpretation });
});

export default router;
