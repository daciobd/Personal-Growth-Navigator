import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, coachMessagesTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";

const router: IRouter = Router();

const SYSTEM_PROMPT = `Você é um coach terapêutico empático e encorajador chamado "Eu". Você faz parte do app MeuEu, um aplicativo de transformação pessoal.

Seu papel:
- Apoiar o usuário em sua jornada de transformação pessoal
- Usar linguagem simples, calorosa e em português brasileiro
- Fazer perguntas reflexivas quando apropriado
- Validar sentimentos sem julgamento
- Sugerir exercícios práticos baseados em TCC, ACT, Mindfulness ou Psicologia Positiva quando útil
- Manter respostas concisas (máximo 3-4 frases), a menos que o usuário peça mais detalhes

Você NÃO é um terapeuta e deve lembrar disso se o usuário mencionar crises graves.`;

type Message = { role: "user" | "assistant"; content: string };

router.post("/coach/message", async (req, res) => {
  const { deviceId, message, history } = req.body as {
    deviceId: string;
    message: string;
    history?: Message[];
  };

  if (!deviceId || !message) {
    res.status(400).json({ error: "deviceId e message são obrigatórios" });
    return;
  }

  let dbHistory: Message[] = [];
  if (!history || history.length === 0) {
    const stored = await db
      .select()
      .from(coachMessagesTable)
      .where(eq(coachMessagesTable.deviceId, deviceId))
      .orderBy(asc(coachMessagesTable.createdAt))
      .limit(20);

    dbHistory = stored.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));
  } else {
    dbHistory = history.slice(-20);
  }

  const messages: Message[] = [...dbHistory, { role: "user", content: message }];

  let response = "Estou aqui com você. Pode continuar.";

  try {
    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    });

    const content = aiResponse.content[0];
    if (content.type === "text") {
      response = content.text.trim();
    }
  } catch {
    // keep default response
  }

  await db.insert(coachMessagesTable).values([
    { deviceId, role: "user", content: message, xpEarned: 0 },
    { deviceId, role: "assistant", content: response, xpEarned: 2 },
  ]);

  res.json({ response, xpEarned: 2 });
});

router.get("/coach/history", async (req, res) => {
  const { deviceId } = req.query as { deviceId: string };

  if (!deviceId) {
    res.status(400).json({ error: "deviceId é obrigatório" });
    return;
  }

  const history = await db
    .select()
    .from(coachMessagesTable)
    .where(eq(coachMessagesTable.deviceId, deviceId))
    .orderBy(asc(coachMessagesTable.createdAt))
    .limit(50);

  res.json({
    history: history.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

export default router;
