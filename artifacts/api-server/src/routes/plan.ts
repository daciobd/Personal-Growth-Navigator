// artifacts/api-server/src/routes/plan.ts (atualizado)
// Integra traços + estado + Big Five ao prompt do Claude.
// Traços → estimativa Big Five (estável)
// Estado → contexto emocional atual (volátil)
// O Claude recebe os dois separados e gera síntese diferenciada.

import { Router, type IRouter } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db } from "@workspace/db";
import { planLogsTable, type InsertPlanLog } from "@workspace/db/schema";
import { selectFutureApproach } from "../data/futureApproaches.js";

const router: IRouter = Router();

type DimKey = "N" | "E" | "O" | "A" | "C";

const DIM_NAMES: Record<DimKey, string> = {
  N: "Neuroticismo", E: "Extroversão", O: "Abertura",
  A: "Amabilidade",  C: "Conscienciosidade",
};

function levelLabel(p: number): string {
  if (p < 20) return "muito baixo";
  if (p < 35) return "baixo";
  if (p < 50) return "moderado-baixo";
  if (p < 65) return "moderado";
  if (p < 80) return "alto";
  return "muito alto";
}

router.post("/generate", async (req, res) => {
  const {
    // Novos campos v2
    traitAdjectives,     // traços estáveis → Big Five
    stateAdjectives,     // estado atual → contexto
    // Legados (compatibilidade)
    currentAdjectives,
    futureAdjectives,
    // Big Five (opcional, de avaliação completa ou estimativa)
    big5Scores,
    assessmentNumber = 1,
    // Contexto Longevi simplificado (via URL params)
    longeviContext,
    // Contexto de saúde rico (via API Longevi)
    healthContext,
  } = req.body as {
    traitAdjectives?: string[];
    stateAdjectives?: string[];
    currentAdjectives?: string[];
    futureAdjectives?: string[];
    big5Scores?: { dims: Record<string, number>; facets: Record<string, number> };
    assessmentNumber?: number;
    longeviContext?: { context: string; focus: string };
    healthContext?: {
      careMode?: string;
      biomarkerFocus?: {
        key: string;
        label: string;
        status: string;
        value?: number;
        unit?: string;
      };
      clinicalSummary?: string;
      targetOutcome?: string;
      barriers?: string[];
      examContext?: { examId?: string; examDate?: string };
    };
  };

  // Normaliza: usa novos campos se disponíveis, senão legados
  const traits  = traitAdjectives  ?? currentAdjectives ?? [];
  const states  = stateAdjectives  ?? [];
  const future  = futureAdjectives ?? [];

  const hasHealthContext = !!(healthContext?.biomarkerFocus || healthContext?.clinicalSummary);
  if (traits.length === 0 && future.length === 0 && !hasHealthContext) {
    res.status(400).json({ error: "Adjetivos ou healthContext são obrigatórios" });
    return;
  }

  // Seleciona abordagem do eu futuro
  const approach = selectFutureApproach(big5Scores?.dims, assessmentNumber);

  // Bloco Big Five
  let big5Block = "";
  if (big5Scores?.dims) {
    const dimLines = (["N","E","O","A","C"] as DimKey[]).map(d => {
      const pct = big5Scores.dims[d] ?? 50;
      return `  ${DIM_NAMES[d]}: ${pct}% (${levelLabel(pct)})`;
    });
    const source = assessmentNumber > 1 || big5Scores.dims.N !== undefined
      ? "avaliação IPIP-NEO-120"
      : "estimativa por adjetivos";
    big5Block = `PERFIL BIG FIVE (${source}):\n${dimLines.join("\n")}\n\n`;
  }

  // Bloco de estado atual
  const stateBlock = states.length > 0
    ? `ESTADO EMOCIONAL ATUAL (última semana — VOLÁTIL, não confunda com traço):\n  ${states.join(", ")}\n\n`
    : "";

  // Bloco Longevi (contexto clínico externo)
  const CONTEXT_LABELS: Record<string, string> = {
    insulin_resistance: "Resistência à Insulina",
    metabolic_syndrome: "Síndrome Metabólica",
    chronic_stress:     "Estresse Crônico",
    sleep_disorder:     "Distúrbio de Sono",
    gut_health:         "Saúde Intestinal",
  };
  const FOCUS_LABELS: Record<string, string> = {
    sleep_stress:      "Melhora do sono e redução de estresse",
    habit_consistency: "Consistência de hábitos de saúde",
    stress_reduction:  "Redução geral de estresse",
    stress_cortisol:   "Regulação de cortisol e estresse crônico",
    nutrition_habit:   "Hábitos alimentares saudáveis",
  };
  const longeviBlock = longeviContext?.context
    ? `CONTEXTO CLÍNICO (via Longevi — integre ao plano sem alarmar o usuário):
  Condição de atenção: ${CONTEXT_LABELS[longeviContext.context] ?? longeviContext.context}
  Foco de mudança comportamental: ${FOCUS_LABELS[longeviContext.focus] ?? longeviContext.focus}
  → As práticas devem ter impacto direto neste contexto clínico.
  → Mencione o contexto de saúde de forma acolhedora na síntese, sem diagnósticos.\n\n`
    : "";

  // Bloco healthContext rico (API Longevi)
  let healthBlock = "";
  if (healthContext) {
    const lines: string[] = [];
    if (healthContext.clinicalSummary) {
      lines.push(`  Resumo clínico: ${healthContext.clinicalSummary}`);
    }
    if (healthContext.biomarkerFocus) {
      const b = healthContext.biomarkerFocus;
      const valStr = b.value !== undefined ? ` (${b.value} ${b.unit ?? ""})` : "";
      lines.push(`  Biomarcador em foco: ${b.label}${valStr} — status: ${b.status}`);
    }
    if (healthContext.targetOutcome) {
      lines.push(`  Objetivo de mudança: ${healthContext.targetOutcome}`);
    }
    if (healthContext.barriers && healthContext.barriers.length > 0) {
      lines.push(`  Barreiras relatadas pelo usuário: ${healthContext.barriers.join(", ")}`);
    }
    if (lines.length > 0) {
      healthBlock = `CONTEXTO DE SAÚDE (dados clínicos do Longevi — use para personalizar o plano):
${lines.join("\n")}
  → As práticas devem endereçar diretamente essas barreiras e apoiar o objetivo de mudança.
  → Linguagem acolhedora, sem alarmismo. Não faça diagnósticos.\n\n`;
    }
  }

  const prompt = `Você é um psicólogo clínico especialista em psicoterapia integrativa.

${healthBlock}${longeviBlock}${big5Block}${stateBlock}TRAÇOS DE PERSONALIDADE (estáveis — base para o Big Five):
${traits.join(", ")}

EU FUTURO DESEJADO:
${future.join(", ")}

=== PERSPECTIVA TERAPÊUTICA DESTA SESSÃO ===
Abordagem: ${approach.name}
${approach.systemInstruction}
SÍNTESE: ${approach.synthesisLens}
FRASE DE INTENÇÃO: ${approach.intentionFrame}
PRÁTICAS: ${approach.practiceFrame}
===========================================

${stateBlock ? `IMPORTANTE: O estado atual (${states.slice(0, 3).join(", ")}...) representa o contexto emocional presente, não a personalidade permanente. O plano deve reconhecer esse estado E trabalhar com os traços estáveis como base de mudança.` : ""}

Gere o plano em JSON com esta estrutura:

{
  "sintese": "2-3 frases. ${approach.synthesisLens}${states.length > 0 ? " Reconheça o estado atual e conecte com os traços estáveis." : ""}",
  "estadoAtual": "${states.length > 0 ? "1 frase reconhecendo o contexto emocional presente com compaixão (não patologizando)" : ""}",
  "fraseIntencao": "${approach.intentionFrame}",
  "praticas": [
    {
      "abordagem": "TCC",
      "nome": "Nome",
      "justificativa": "Por que para ESTE perfil específico",
      "passos": ["Passo 1", "Passo 2", "Passo 3", "Passo 4"],
      "frequencia": "Sugestão"
    },
    { "abordagem": "ACT", "nome": "...", "justificativa": "...", "passos": ["...","...","...","..."], "frequencia": "..." },
    { "abordagem": "Psicologia Positiva", "nome": "...", "justificativa": "...", "passos": ["...","...","...","..."], "frequencia": "..." }
  ],
  "perguntaReflexao": "${approach.anchorQuestion}"
}

REGRAS:
- Diferencia traço (permanente) de estado (temporário) na síntese
- 3 práticas de abordagens DIFERENTES
- Use segunda pessoa ("você")
- Responda APENAS com JSON válido`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";
    let planData: Record<string, unknown>;
    try {
      const match = rawText.match(/\{[\s\S]*\}/);
      planData = match ? JSON.parse(match[0]) : { rawText, parseError: true };
    } catch {
      planData = { rawText, parseError: true };
    }

    const logEntry: InsertPlanLog = {
      currentAdjectives: traits as any,
      futureAdjectives: future as any,
      sintese: (planData?.sintese as string | undefined) ?? undefined,
      fraseIntencao: (planData?.fraseIntencao as string | undefined) ?? undefined,
      praticas: (planData?.praticas as any[] | undefined) ?? undefined,
    };
    db.insert(planLogsTable).values(logEntry)
      .catch(err => console.error("Plan log error:", err));

    res.json({
      success: true,
      plan: planData,
      approach: {
        key:            approach.key,
        name:           approach.name,
        anchorQuestion: approach.anchorQuestion,
      },
      hasBig5:  !!big5Scores,
      hasState: states.length > 0,
    });

  } catch (err) {
    console.error("Plan generation error:", err);
    res.status(500).json({ error: "Erro ao gerar plano. Tente novamente." });
  }
});

export default router;
