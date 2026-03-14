import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router: IRouter = Router();

router.post("/plan/generate", async (req, res) => {
  const { currentAdjectives, futureAdjectives } = req.body as {
    currentAdjectives: string[];
    futureAdjectives: string[];
  };

  if (!Array.isArray(currentAdjectives) || !Array.isArray(futureAdjectives)) {
    res.status(400).json({ error: "currentAdjectives and futureAdjectives são obrigatórios" });
    return;
  }

  const prompt = `Você é um psicólogo especializado em psicoterapias baseadas em evidências (TCC, ACT, Psicologia Positiva, Mindfulness/DBT). 
Um cliente fez uma autoavaliação e você deve criar um plano personalizado de desenvolvimento pessoal.

EU HOJE (adjetivos que descrevem o cliente atualmente):
${currentAdjectives.join(", ")}

EU FUTURO (adjetivos que descrevem quem o cliente quer se tornar):
${futureAdjectives.join(", ")}

Com base nessas informações, gere um plano em JSON com a seguinte estrutura exata:

{
  "sintese": "Uma síntese narrativa de 2-3 frases sobre a jornada de transformação do cliente, conectando quem ele é hoje com quem quer se tornar. Deve ser empática, esperançosa e profissional.",
  "fraseIntencao": "Uma frase de intenção poderosa e pessoal (começando com 'Eu escolho...' ou 'Eu me comprometo...') que capture a essência da transformação desejada.",
  "praticas": [
    {
      "abordagem": "TCC",
      "nome": "Nome da técnica específica",
      "justificativa": "Uma frase explicando por que esta técnica é especificamente relevante para a jornada DESTE cliente (mencione os adjetivos concretos).",
      "passos": [
        "Passo 1 concreto e específico",
        "Passo 2 concreto e específico",
        "Passo 3 concreto e específico",
        "Passo 4 concreto e específico"
      ],
      "frequencia": "Ex: Diariamente por 10 minutos"
    },
    {
      "abordagem": "ACT",
      "nome": "Nome da técnica específica",
      "justificativa": "Justificativa personalizada para este cliente.",
      "passos": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "frequencia": "Frequência sugerida"
    },
    {
      "abordagem": "Psicologia Positiva",
      "nome": "Nome da técnica específica",
      "justificativa": "Justificativa personalizada para este cliente.",
      "passos": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "frequencia": "Frequência sugerida"
    }
  ]
}

REGRAS IMPORTANTES:
- As 3 práticas devem ser de abordagens DIFERENTES (use TCC, ACT e Psicologia Positiva exatamente como mostrado)
- Os passos devem ser concretos, acionáveis e específicos para a jornada DESTE cliente
- Use a primeira pessoa ("você") ao falar com o cliente
- O plano deve criar uma ponte real entre os adjetivos atuais e os desejados
- Responda APENAS com o JSON válido, sem texto adicional antes ou depois`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Robust JSON parsing with fallback
    let planData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      // Fallback: return raw text so frontend can handle it
      planData = { rawText, parseError: true };
    }

    res.json({ success: true, plan: planData });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: "Erro ao gerar plano. Tente novamente." });
  }
});

export default router;
