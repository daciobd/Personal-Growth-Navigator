# MeuEu — Progressão Adaptativa + Check-in Unificado

## O que este pacote adiciona

### Progressão adaptativa das jornadas
Baseada no histórico de check-ins, a IA adapta automaticamente a prática do dia:

| Sinal | Condição | O que muda |
|-------|----------|------------|
| `micro_step` | 2+ dias sem completar | Versão de 2 min, sem preparação |
| `easier_variant` | 2 dias com nota 1-2 | Prática simplificada |
| `alternative_approach` | 3+ dias com nota 1-2 | Abordagem terapêutica diferente |
| `adjust_today` | 1 dia difícil | Dica extra de facilitação |
| `deepen` | 3+ dias com nota 4-5 | Desafio extra opcional |
| `ready_to_advance` | 5+ dias com nota 4-5 | Integração e avanço de fase |
| `on_track` | Progresso estável | Incentivo e especificidade |

### Check-in unificado
`UnifiedCheckin` cobre automaticamente o que o usuário precisa fazer:
- Tem jornada ativa com check-in pendente → usa a jornada
- Só tem plano personalizado → usa o plano
- Fluxo único < 2 minutos para ambos os casos

---

## Arquivos e destinos

| Arquivo | Destino | Ação |
|---------|---------|------|
| `artifacts/api-server/src/data/adaptiveEngine.ts` | idem | Criar |
| `artifacts/api-server/src/routes/journeys.ts` | idem | **Substituir** (versão com adaptação) |
| `artifacts/meueu/components/UnifiedCheckin.tsx` | idem | Criar |

---

## Passo a passo

### 1. Substituir journeys.ts
O novo arquivo inclui o motor adaptativo. **Substitui completamente** o anterior.

### 2. Criar adaptiveEngine.ts
Novo arquivo de dados — coloque em `artifacts/api-server/src/data/`.

### 3. Substituir DailyChallenge por UnifiedCheckin na tab principal
Em `artifacts/meueu/app/(tabs)/index.tsx`:
```tsx
// Remova:
import DailyChallenge from "../../components/DailyChallenge";

// Adicione:
import UnifiedCheckin from "../../components/UnifiedCheckin";

// No render, substitua <DailyChallenge /> por:
<UnifiedCheckin onComplete={(xp) => console.log(`+${xp} XP`)} />
```

O `UnifiedCheckin` detecta automaticamente se o usuário tem jornada ativa
ou só o plano personalizado, e exibe o desafio correto.

---

## Como funciona a adaptação

1. Usuário faz check-in com nota baixa
2. `/api/journeys/checkin` salva e calcula `nextAdaptiveSignal`
3. Na próxima abertura do app, `/api/journeys/day-challenge` busca o histórico,
   chama `analyzeProgress()` e passa o `promptModifier` ao Claude
4. Claude gera uma proposição de ação adaptada (mais simples, diferente, ou mais desafiadora)
5. O componente exibe a tag de adaptação ("Versão adaptada", "Estratégia alternativa")

---

## Novo endpoint

`GET /api/journeys/context/:deviceId/:journeyId`

Retorna tudo numa chamada para o check-in unificado:
- `userJourney`, `journey`, `dayData`
- `adaptiveSignal`, `adaptiveUiHint`
- `recentCheckins` (últimos 5 da jornada)
- `dailyRecentCheckins` (últimos 3 do plano)
- `completionPct`
