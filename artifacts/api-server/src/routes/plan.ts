import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db, planLogsTable } from "@workspace/db";

const router: IRouter = Router();

type Big5Scores = {
  O: number; C: number; E: number; A: number; N: number;
  facets: Record<string, number>;
};

const DIM_NAMES: Record<string, string> = {
  O: "Abertura à Experiência",
  C: "Conscienciosidade",
  E: "Extroversão",
  A: "Amabilidade",
  N: "Neuroticismo",
};

const FACET_NAMES: Record<string, string> = {
  O1: "Fantasia", O2: "Estética", O3: "Sentimentos", O4: "Busca por Variedade", O5: "Intelecto", O6: "Valores",
  C1: "Competência", C2: "Ordem", C3: "Senso de Dever", C4: "Busca por Realizações", C5: "Autodisciplina", C6: "Deliberação",
  E1: "Cordialidade", E2: "Gregarismo", E3: "Assertividade", E4: "Nível de Atividade", E5: "Busca por Emoções", E6: "Emoções Positivas",
  A1: "Confiança", A2: "Franqueza", A3: "Altruísmo", A4: "Complacência", A5: "Modéstia", A6: "Sensibilidade",
  N1: "Ansiedade", N2: "Hostilidade", N3: "Tristeza", N4: "Autoconsciência Social", N5: "Impulsividade", N6: "Vulnerabilidade",
};

type FutureApproach = {
  key: string;
  name: string;
  instruction: string;
  question: string;
};

const FUTURE_SELF_APPROACHES: FutureApproach[] = [
  {
    key: "tcc",
    name: "TCC — Visualização e Consequências",
    instruction: `Use a abordagem da TCC para o "eu futuro": peça ao usuário para visualizar com riqueza de detalhes situações futuras onde age de forma adaptativa. Contraste o "eu futuro" que sofrerá consequências negativas com o "eu futuro" que colherá benefícios das escolhas saudáveis de hoje. Use o futuro como ensaio mental da mudança.`,
    question: "Como seria sua vida concreta daqui a 1 ano se você já fosse essa pessoa?",
  },
  {
    key: "esquema",
    name: "Terapia do Esquema — Adulto Saudável",
    instruction: `Use a abordagem da Terapia do Esquema: o "eu futuro" é o "Adulto Saudável" — a parte capaz de nutrir, proteger e estabelecer limites saudáveis. As práticas devem fortalecer progressivamente esse modo funcional. Fale diretamente ao Adulto Saudável que está emergindo.`,
    question: "Que parte de você, quando está no seu melhor, já se parece com quem você quer ser?",
  },
  {
    key: "cft",
    name: "CFT — Eu Compassivo Ideal",
    instruction: `Use a abordagem da Terapia Focada na Compaixão: o "eu futuro" é o "eu compassivo ideal" — sábio, forte e caloroso. As práticas devem ajudar o usuário a se visualizar no futuro já tendo integrado compaixão por si mesmo, e imaginar o que esse eu diria para ele hoje. Especialmente indicado se há autocrítica ou vergonha no perfil.`,
    question: "O que sua versão mais sábia e compassiva diria para você agora sobre esse caminho?",
  },
  {
    key: "narrativa",
    name: "Terapia Narrativa — Re-autoria",
    instruction: `Use a abordagem da Terapia Narrativa: a identidade é construída pelas histórias que contamos. O "eu futuro" é o protagonista de uma história alternativa ainda sendo escrita. Identifique "resultados únicos" — momentos em que o usuário já resistiu ao problema — e teça uma nova narrativa que aponte para esse futuro. Use linguagem de "tornar-se", não de "ser".`,
    question: "Em quais momentos recentes você já agiu como a pessoa que quer se tornar?",
  },
  {
    key: "tfs",
    name: "TFS — Pergunta do Milagre",
    instruction: `Use a abordagem da Terapia Focada na Solução: ignore a análise do problema e foque exclusivamente na construção da solução. Aplique a lógica da "pergunta do milagre" — como seria a manhã seguinte se o problema já estivesse resolvido? Identifique pequenos fragmentos desse futuro já presentes no presente e proponha ações para ampliá-los.`,
    question: "Se ao acordar amanhã o problema já estivesse resolvido, o que você faria de diferente logo cedo?",
  },
  {
    key: "act",
    name: "ACT — Valores e Ação Comprometida",
    instruction: `Use a abordagem da ACT: em vez de um "eu futuro" fixo, o foco são os valores (direções de vida). O futuro emerge como consequência de viver esses valores agora. Não pergunte "quem você quer ser", mas "o que é verdadeiramente importante para você e que direção você quer tomar". As práticas são ações comprometidas no presente que constroem esse futuro.`,
    question: "O que é verdadeiramente importante para você — não o que deveria ser, mas o que realmente importa?",
  },
  {
    key: "gestalt",
    name: "Gestalt — Emergência no Aqui-e-Agora",
    instruction: `Use a abordagem da Gestalt: o "eu futuro" não é distante — é uma potencialidade que emerge no presente. As práticas devem ajudar o usuário a perceber como já "ensaia" seu futuro na sua postura, tom de voz e escolhas cotidianas. O foco é na expansão da consciência no momento presente, não na projeção futura.`,
    question: "Onde, no seu dia de hoje, você já experimenta um pequeno sinal de quem está se tornando?",
  },
  {
    key: "humanista",
    name: "Centrada na Pessoa — Tendência Atualizante",
    instruction: `Use a abordagem Centrada na Pessoa de Rogers: existe uma "tendência atualizante" inata — a capacidade natural de crescer em direção a um eu mais autêntico e pleno. As práticas devem criar condições de empatia, aceitação e congruência para que essa tendência floresça naturalmente. O "eu futuro" não é construído, é descoberto.`,
    question: "Quando você se sente mais verdadeiramente você mesmo, sem máscaras — como é essa sensação?",
  },
];

function selectApproach(
  big5?: Big5Scores | null,
  sessionCount = 1
): FutureApproach {
  if (!big5) {
    return FUTURE_SELF_APPROACHES[(sessionCount - 1) % FUTURE_SELF_APPROACHES.length];
  }

  const { N, E, O, A, C } = big5;

  if (N >= 70) return FUTURE_SELF_APPROACHES.find(a => a.key === "cft")!;
  if (C < 35) return FUTURE_SELF_APPROACHES.find(a => a.key === "tfs")!;
  if (O >= 70) return FUTURE_SELF_APPROACHES.find(a => a.key === "narrativa")!;
  if (A >= 65 && N < 50) return FUTURE_SELF_APPROACHES.find(a => a.key === "act")!;
  if (C >= 70) return FUTURE_SELF_APPROACHES.find(a => a.key === "esquema")!;
  if (E >= 65) return FUTURE_SELF_APPROACHES.find(a => a.key === "gestalt")!;

  return FUTURE_SELF_APPROACHES.find(a => a.key === "tcc")!;
}

function qualLevel(s: number): string {
  if (s <= 20) return "muito baixo";
  if (s <= 35) return "baixo";
  if (s <= 65) return "médio";
  if (s <= 80) return "alto";
  return "muito alto";
}

function buildBig5PromptBlock(scores: Big5Scores): string {
  const dims = ["O", "C", "E", "A", "N"];
  const lines: string[] = [
    "\nPERFIL DE PERSONALIDADE (Big Five) DO CLIENTE:",
  ];

  for (const d of dims) {
    const score = (scores as any)[d];
    const facetsForDim = Object.entries(scores.facets)
      .filter(([k]) => k.startsWith(d))
      .sort(([, a], [, b]) => b - a);

    const topFacets = facetsForDim.slice(0, 2).map(([k, v]) => `${FACET_NAMES[k] ?? k} (${v}%)`);
    const lowFacets = facetsForDim.slice(-2).map(([k, v]) => `${FACET_NAMES[k] ?? k} (${v}%)`);

    lines.push(
      `${DIM_NAMES[d]}: ${score}% (${qualLevel(score)}) — mais alto em ${topFacets.join(", ")}; mais baixo em ${lowFacets.join(", ")}`
    );
  }

  lines.push(
    "\nUse este perfil para personalizar AINDA MAIS o plano: adapte as técnicas ao estilo do cliente. " +
    "Por exemplo: alta Abertura → práticas criativas e reflexivas; alta Conscienciosidade → estrutura e metas claras; " +
    "alto Neuroticismo → técnicas de regulação emocional e mindfulness; baixa Amabilidade → foco em compaixão; " +
    "baixa Extroversão → práticas introspectivas e individuais."
  );

  return lines.join("\n");
}

router.post("/plan/generate", async (req, res) => {
  const { currentAdjectives, futureAdjectives, sessionId, big5Scores, sessionCount } = req.body as {
    currentAdjectives: string[];
    futureAdjectives: string[];
    sessionId?: string;
    big5Scores?: Big5Scores | null;
    sessionCount?: number;
  };

  if (!Array.isArray(currentAdjectives) || !Array.isArray(futureAdjectives)) {
    res.status(400).json({ error: "currentAdjectives and futureAdjectives são obrigatórios" });
    return;
  }

  const approach = selectApproach(big5Scores, sessionCount ?? 1);
  const big5Block = big5Scores ? buildBig5PromptBlock(big5Scores) : "";

  const approachBlock = `
=== PERSPECTIVA DO EU FUTURO: ${approach.name.toUpperCase()} ===
${approach.instruction}

Pergunta-chave desta jornada: "${approach.question}"

Use EXCLUSIVAMENTE essa perspectiva para fundamentar a síntese e a frase de intenção.
As práticas devem ENCARNAR essa abordagem — não apenas mencioná-la.
A frase de intenção deve ressoar com a linguagem e os valores dessa perspectiva.`;

  const prompt = `Você é um psicólogo especializado em psicoterapias baseadas em evidências (TCC, ACT, Terapia Narrativa, CFT, Gestalt, Terapia do Esquema, TFS, Psicologia Positiva).
Um cliente fez uma autoavaliação e você deve criar um plano personalizado de desenvolvimento pessoal.

EU HOJE (adjetivos que descrevem o cliente atualmente):
${currentAdjectives.join(", ")}

EU FUTURO (adjetivos que descrevem quem o cliente quer se tornar):
${futureAdjectives.join(", ")}
${big5Block}
${approachBlock}

Com base nessas informações, gere um plano em JSON com a seguinte estrutura exata:

{
  "sintese": "Uma síntese narrativa de 2-3 frases sobre a jornada de transformação do cliente, conectando quem ele é hoje com quem quer se tornar. Deve usar a linguagem e os valores da perspectiva selecionada. Seja empático, esperançoso e profissional.",
  "fraseIntencao": "Uma frase de intenção poderosa e pessoal (começando com 'Eu escolho...' ou 'Eu me comprometo...') que capture a essência da transformação desejada através da lente da perspectiva selecionada.",
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
- O plano deve criar uma ponte real entre os adjetivos atuais e os desejados${big5Scores ? "\n- Adapte as técnicas ao perfil Big Five do cliente" : ""}
- A síntese e a frase de intenção DEVEM refletir a perspectiva "${approach.name}" acima
- Responda APENAS com o JSON válido, sem texto adicional antes ou depois`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    let planData: any;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        planData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      planData = { rawText, parseError: true };
    }

    if (!planData.parseError) {
      db.insert(planLogsTable).values({
        sessionId: sessionId ?? null,
        currentAdjectives,
        futureAdjectives,
        sintese: planData.sintese ?? null,
        fraseIntencao: planData.fraseIntencao ?? null,
        praticas: planData.praticas ?? null,
      }).catch((err: Error) => console.error("Failed to log plan:", err));
    }

    res.json({
      success: true,
      plan: planData,
      approach: { key: approach.key, name: approach.name, question: approach.question },
    });
  } catch (error) {
    console.error("Error generating plan:", error);
    res.status(500).json({ error: "Erro ao gerar plano. Tente novamente." });
  }
});

export default router;
