import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, dailyCheckinsTable } from "@workspace/db";
import { eq, and, desc, gte } from "drizzle-orm";

const router: IRouter = Router();

function calculateCheckinXP(completed: boolean, rating: number | undefined, streak: number): number {
  let xp = 5;
  if (completed) xp += 20;
  if (rating !== undefined) {
    if (rating === 5) xp += 15;
    else if (rating >= 4) xp += 10;
  }
  const streakBonus = Math.min(streak * 5, 50);
  xp += streakBonus;
  return xp;
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function getPracticeIndexForDate(date: string): number {
  const d = new Date(date);
  return d.getDay() % 3;
}

router.post("/daily/challenge", async (req, res) => {
  const { deviceId, date, practice } = req.body as {
    deviceId: string;
    date: string;
    practice?: {
      nome: string;
      passos: string[];
      frequencia: string;
      abordagem: string;
      justificativa: string;
    };
  };

  if (!deviceId) {
    res.status(400).json({ error: "deviceId é obrigatório" });
    return;
  }

  const today = date ?? getTodayDate();

  const existing = await db
    .select()
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.deviceId, deviceId),
        eq(dailyCheckinsTable.date, today)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.json({ alreadyCheckedIn: true, checkin: existing[0] });
    return;
  }

  let aiAction =
    "Dedique 10 minutos hoje para explorar esta prática com intenção e presença plena.";

  if (practice) {
    try {
      const recentHistory = await db
        .select()
        .from(dailyCheckinsTable)
        .where(eq(dailyCheckinsTable.deviceId, deviceId))
        .orderBy(desc(dailyCheckinsTable.createdAt))
        .limit(7);

      const historyContext =
        recentHistory.length > 0
          ? `\nHistórico recente (últimos ${recentHistory.length} dias):\n` +
            recentHistory
              .map(
                (h) =>
                  `- ${h.date}: ${h.completed ? "completou" : "não completou"}, nota ${h.rating ?? "N/A"}`
              )
              .join("\n")
          : "\nSem histórico anterior — é o primeiro desafio do usuário.";

      const message = await anthropic.messages.create({
        model: "claude-haiku-4-5",
        max_tokens: 150,
        messages: [
          {
            role: "user",
            content: `Você é um coach terapêutico. Gere UMA proposição de ação concreta e motivadora para hoje, baseada nesta prática:

Prática: ${practice.nome} (${practice.abordagem})
Passos: ${practice.passos.slice(0, 2).join("; ")}
Frequência: ${practice.frequencia}
${historyContext}

A proposição deve ser:
- Específica e realizável em um dia
- Em português, máximo 2 frases
- Começando com um verbo de ação (Ex: "Hoje, reserve...", "Ao acordar...", "Em algum momento...")
- Adaptada ao histórico do usuário

Responda APENAS com a proposição de ação, sem introdução ou explicação.`,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        aiAction = content.text.trim();
      }
    } catch {
      // keep default action
    }
  }

  res.json({
    alreadyCheckedIn: false,
    aiAction,
    practiceIndex: getPracticeIndexForDate(today),
    date: today,
  });
});

router.post("/daily/checkin", async (req, res) => {
  const { deviceId, date, practiceIndex, practiceName, completed, rating, note } = req.body as {
    deviceId: string;
    date: string;
    practiceIndex: number;
    practiceName: string;
    completed: boolean;
    rating?: number;
    note?: string;
  };

  if (!deviceId || !practiceName) {
    res.status(400).json({ error: "deviceId e practiceName são obrigatórios" });
    return;
  }

  const today = date ?? getTodayDate();

  const existing = await db
    .select()
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.deviceId, deviceId),
        eq(dailyCheckinsTable.date, today)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.json({
      xpEarned: 0,
      aiTip: "Você já fez o check-in de hoje!",
      streakDays: existing[0].streakDays,
      alreadyDone: true,
    });
    return;
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const recentHistory = await db
    .select()
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.deviceId, deviceId),
        gte(dailyCheckinsTable.date, sevenDaysAgo)
      )
    )
    .orderBy(desc(dailyCheckinsTable.date))
    .limit(7);

  let streak = 1;
  if (recentHistory.length > 0) {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const lastDate = recentHistory[0].date;
    if (lastDate === yesterday) {
      streak = (recentHistory[0].streakDays ?? 1) + 1;
    }
  }

  const xpEarned = calculateCheckinXP(completed, rating, streak);

  let aiTip = "Ótimo trabalho hoje! Continue assim amanhã.";

  try {
    const recentRatings = recentHistory.map((h) => h.rating ?? 0).filter(Boolean);
    const lowRatings = recentRatings.filter((r) => r <= 3);

    let tipContext = "";
    if (rating !== undefined && rating <= 2) {
      tipContext = "dica de ajuste imediata (nota muito baixa hoje)";
    } else if (lowRatings.length >= 3) {
      tipContext = "proposta de estratégia alternativa (3+ dias com nota baixa)";
    } else if (rating !== undefined && rating >= 4) {
      tipContext = "reforço positivo e próximo nível de dificuldade";
    } else {
      tipContext = "encorajamento para continuar";
    }

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `Você é um coach terapêutico empático. O usuário acabou de fazer um check-in:
- Prática: ${practiceName}
- Completou: ${completed ? "Sim" : "Não"}
- Nota: ${rating ?? "Não informada"}/5
- Notas livres: ${note ?? "Nenhuma"}
- Sequência de dias: ${streak} dia(s)
- Contexto: ${tipContext}

Gere uma mensagem curta (máximo 2 frases) em português, empática e personalizada.
Responda APENAS com a mensagem, sem introdução.`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      aiTip = content.text.trim();
    }
  } catch {
    // keep default tip
  }

  await db.insert(dailyCheckinsTable).values({
    deviceId,
    date: today,
    practiceIndex: practiceIndex ?? 0,
    practiceName,
    completed,
    rating,
    note,
    aiTip,
    xpEarned,
    streakDays: streak,
  });

  res.json({ xpEarned, aiTip, streakDays: streak, alreadyDone: false });
});

router.get("/daily/history", async (req, res) => {
  const { deviceId, days } = req.query as { deviceId: string; days?: string };

  if (!deviceId) {
    res.status(400).json({ error: "deviceId é obrigatório" });
    return;
  }

  const daysBack = parseInt(days ?? "30", 10);
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const history = await db
    .select()
    .from(dailyCheckinsTable)
    .where(
      and(
        eq(dailyCheckinsTable.deviceId, deviceId),
        gte(dailyCheckinsTable.date, since)
      )
    )
    .orderBy(desc(dailyCheckinsTable.date))
    .limit(daysBack);

  res.json({ history });
});

export default router;
