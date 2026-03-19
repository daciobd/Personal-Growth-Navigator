# MeuEu × Longevi — Guia de Integração API

**Versão:** 1.0 — MVP  
**Status:** ✅ Pronto para integrar  
**Base URL:** `https://personal-growth-navigator.replit.app/api`

---

## Autenticação

**Nenhuma no MVP.** Qualquer requisição com `Content-Type: application/json` é aceita.

> Para produção escalável, discutir API key via header `X-Api-Key`.

---

## CORS

A API aceita requisições de qualquer origem (`*`). Sem configuração adicional necessária no Longevi.

---

## Rotas disponíveis para o Longevi

### 1. `POST /api/plan/generate`

Gera um plano terapêutico de 7 práticas personalizado com base no perfil e contexto clínico do usuário.

#### Request

```json
{
  "deviceId": "longevi-user-uuid-aqui",

  // Opcional: adjetivos de personalidade do usuário
  // Se não enviado, o plano é gerado apenas com healthContext
  "traitAdjectives": ["prático", "sobrecarregado"],
  "stateAdjectives": ["cansado", "preocupado"],
  "futureAdjectives": ["constante", "disciplinado", "energizado"],
  "assessmentNumber": 0,

  // Contexto clínico — o campo mais importante para o Longevi
  "healthContext": {
    "careMode": "adult",
    "biomarkerFocus": {
      "key": "ferritin",
      "label": "Ferritina",
      "status": "suboptimal",
      "value": 19,
      "unit": "ng/mL"
    },
    "clinicalSummary": "Ferritina em 19 ng/mL. Para longevidade, o alvo ideal é 30–300 ng/mL.",
    "targetOutcome": "melhorar reservas de ferro e aumentar consistência na suplementação",
    "barriers": ["enjoo", "esqueço de tomar"],
    "examContext": {
      "examId": "exam_abc123",
      "examDate": "2026-03-19"
    }
  }
}
```

#### Campos obrigatórios

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `deviceId` | `string` | Não (mas recomendado) | ID do usuário no Longevi |
| `futureAdjectives` | `string[]` | Sim (ou healthContext) | Quem o usuário quer ser |
| `healthContext` | `object` | Sim (ou futureAdjectives) | Contexto clínico do Longevi |

> Se apenas `healthContext` for enviado (sem adjetivos), o plano é gerado só com os dados clínicos. Se ambos forem enviados, o Claude integra tudo.

#### Response `200 OK`

```json
{
  "success": true,
  "plan": {
    "sintese": "Você está cansado e preocupado agora, mas seus traços práticos são a base para construir consistência...",
    "estadoAtual": "Neste momento você carrega um cansaço real, e isso é reconhecido.",
    "fraseIntencao": "Cada pequeno passo consistente me aproxima da versão mais energizada de mim.",
    "praticas": [
      {
        "abordagem": "TCC",
        "nome": "Alarme com Intenção",
        "justificativa": "Para quem esquece de tomar suplementos, ancoragem a uma rotina existente aumenta a aderência.",
        "passos": [
          "Escolha um hábito que já faz todo dia (café, escovar dentes).",
          "Configure um alarme com a mensagem 'meu ferro + minha energia'.",
          "Tome o suplemento imediatamente após o hábito âncora.",
          "Marque num calendário. 3 dias seguidos = pequena celebração."
        ],
        "frequencia": "Diariamente, por 21 dias"
      },
      {
        "abordagem": "ACT",
        "nome": "...",
        "justificativa": "...",
        "passos": ["..."],
        "frequencia": "..."
      },
      {
        "abordagem": "Psicologia Positiva",
        "nome": "...",
        "justificativa": "...",
        "passos": ["..."],
        "frequencia": "..."
      }
    ],
    "perguntaReflexao": "O que você está disposto a fazer de diferente hoje para cuidar da sua energia?"
  },
  "approach": {
    "key": "act",
    "name": "Aceitação e Compromisso (ACT)",
    "anchorQuestion": "O que você está disposto a fazer de diferente hoje para cuidar da sua energia?"
  },
  "hasBig5": false,
  "hasState": true
}
```

#### Response `400 Bad Request`

```json
{ "error": "Adjetivos ou healthContext são obrigatórios" }
```

---

### 2. `POST /api/coach/message`

Envia uma mensagem ao coach de IA. O coach responde em pt-BR com abordagem terapêutica, adaptando as respostas ao contexto clínico do usuário quando fornecido.

#### Request

```json
{
  "deviceId": "longevi-user-uuid-aqui",
  "message": "Eu fico enjoado quando tomo o suplemento de ferro. O que eu faço?",

  // Opcional: histórico da conversa (últimas N mensagens)
  // Se não enviado, o histórico é carregado do banco pelo deviceId
  "history": [
    { "role": "user", "content": "Olá" },
    { "role": "assistant", "content": "Olá! Como você está hoje?" }
  ],

  // Contexto clínico — personaliza as respostas do coach
  "healthContext": {
    "biomarkerFocus": {
      "key": "ferritin",
      "label": "Ferritina",
      "status": "suboptimal",
      "value": 19,
      "unit": "ng/mL"
    },
    "clinicalSummary": "Ferritina em 19 ng/mL. Alvo ideal: 30–300 ng/mL.",
    "targetOutcome": "melhorar aderência ao suplemento de ferro",
    "barriers": ["enjoo", "esqueço de tomar"]
  }
}
```

#### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `deviceId` | `string` | **Sim** | ID do usuário |
| `message` | `string` | **Sim** | Mensagem do usuário |
| `history` | `Message[]` | Não | Histórico da conversa |
| `healthContext` | `object` | Não | Contexto clínico para personalizar o coach |

#### Response `200 OK`

```json
{
  "response": "Enjoo com ferro é muito comum! Tente tomar com alimento, de preferência com algo que contenha vitamina C — isso ajuda na absorção e reduz o desconforto. Se persistir, conversar com seu médico sobre a forma do suplemento (bisglicinato, por exemplo, é mais suave).",
  "xpEarned": 2
}
```

---

## Como o Longevi deve chamar a API

### Exemplo em TypeScript/Node.js

```typescript
// Rota do backend Longevi: POST /api/behavioral/plan
async function getMeuEuPlan(userId: string, examData: ExamData) {
  const response = await fetch(
    "https://personal-growth-navigator.replit.app/api/plan/generate",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: `longevi-${userId}`,
        futureAdjectives: mapBiomarkerToAdjectives(examData.biomarker),
        healthContext: {
          careMode: "adult",
          biomarkerFocus: {
            key: examData.biomarker.key,
            label: examData.biomarker.label,
            status: examData.biomarker.status,
            value: examData.biomarker.value,
            unit: examData.biomarker.unit,
          },
          clinicalSummary: examData.summary,
          targetOutcome: examData.targetOutcome,
          barriers: examData.reportedBarriers,
        },
      }),
    }
  );

  const data = await response.json();
  if (!data.success) throw new Error(data.error);
  return data.plan;
}

// Mapeia biomarcador → adjetivos futuros (sugestão)
function mapBiomarkerToAdjectives(biomarker: { key: string }): string[] {
  const map: Record<string, string[]> = {
    ferritin:           ["energizado", "consistente", "disciplinado"],
    vitamin_d:          ["calmo", "equilibrado", "resiliente"],
    cortisol:           ["sereno", "presente", "centrado"],
    testosterone:       ["confiante", "focado", "motivado"],
    blood_glucose:      ["disciplinado", "consciente", "consistente"],
  };
  return map[biomarker.key] ?? ["energizado", "saudável", "consistente"];
}
```

### Exemplo de rota do coach

```typescript
// Rota do backend Longevi: POST /api/behavioral/coach
async function sendCoachMessage(userId: string, message: string, healthCtx: HealthContext) {
  const response = await fetch(
    "https://personal-growth-navigator.replit.app/api/coach/message",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deviceId: `longevi-${userId}`,
        message,
        healthContext: healthCtx,
      }),
    }
  );
  return response.json(); // { response: string, xpEarned: number }
}
```

---

## Teste manual (curl)

### Testar /plan/generate

```bash
curl -X POST https://personal-growth-navigator.replit.app/api/plan/generate \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "longevi-test-001",
    "futureAdjectives": ["energizado", "consistente", "disciplinado"],
    "healthContext": {
      "biomarkerFocus": {
        "key": "ferritin",
        "label": "Ferritina",
        "status": "suboptimal",
        "value": 19,
        "unit": "ng/mL"
      },
      "clinicalSummary": "Ferritina em 19 ng/mL. Alvo ideal: 30-300 ng/mL.",
      "targetOutcome": "melhorar aderência ao suplemento",
      "barriers": ["enjoo", "esqueço de tomar"]
    }
  }'
```

### Testar /coach/message

```bash
curl -X POST https://personal-growth-navigator.replit.app/api/coach/message \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "longevi-test-001",
    "message": "Fico enjoado quando tomo ferro. O que eu faço?",
    "healthContext": {
      "biomarkerFocus": { "key": "ferritin", "label": "Ferritina", "status": "suboptimal", "value": 19, "unit": "ng/mL" },
      "targetOutcome": "melhorar aderência ao suplemento de ferro",
      "barriers": ["enjoo"]
    }
  }'
```

---

## Fluxo completo sugerido no Longevi

```
1. Usuário vê resultado de exame no Longevi
         ↓
2. Longevi monta payload com biomarkerFocus + clinicalSummary + barriers
         ↓
3. Longevi chama POST /api/plan/generate
         ↓
4. MeuEu retorna plano com 3 práticas personalizadas
         ↓
5. Longevi exibe card "Seu Plano Comportamental" com sintese + práticas
         ↓
6. Usuário pode abrir chat: Longevi chama POST /api/coach/message
         ↓
7. Coach responde com orientações contextualizadas ao biomarcador
```

---

## Campos do healthContext — Referência completa

```typescript
type HealthContext = {
  careMode?: "adult" | "pediatric";          // tipo de cuidado
  biomarkerFocus?: {
    key: string;                             // ex: "ferritin", "vitamin_d", "cortisol"
    label: string;                           // ex: "Ferritina"
    status: "optimal" | "suboptimal" | "deficient" | "elevated";
    value?: number;                          // valor numérico
    unit?: string;                           // ex: "ng/mL"
  };
  clinicalSummary?: string;                  // resumo legível para o Claude
  targetOutcome?: string;                    // objetivo de mudança comportamental
  barriers?: string[];                       // barreiras relatadas pelo usuário
  examContext?: {
    examId?: string;
    examDate?: string;                       // ISO 8601
  };
}
```

---

## Notas importantes

- **Sem autenticação no MVP** — adicionar API key antes de ir para produção com escala
- **O `deviceId` persiste o histórico do coach** — use um ID estável por usuário (ex: `longevi-${userId}`)
- **Tempo de resposta** — `/plan/generate` leva 5–15s (chamada ao Claude). Mostre spinner no Longevi
- **`futureAdjectives` é opcional** se `healthContext` for enviado — mas enviar ambos melhora a qualidade do plano
- **O coach lembra o histórico** por `deviceId` — conversas anteriores são carregadas automaticamente se `history` não for enviado
