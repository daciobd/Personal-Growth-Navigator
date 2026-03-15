# Abordagens do Eu Futuro — Guia de Instalação

## O que este pacote adiciona

- **8 abordagens terapêuticas** do "eu futuro" integradas ao prompt do Claude
- **Seleção automática** pela perfil Big Five: N≥75% → CFT, C<35% → TFS, O≥70% → Narrativa, etc.
- **Rotação por sessão** quando não há Big Five disponível
- **`ApproachBadge`** — componente que exibe a perspectiva usada + pergunta âncora no plano
- **`perguntaReflexao`** — novo campo retornado pelo plano para exibir ao usuário

---

## Arquivos e destinos

| Arquivo | Destino | Ação |
|---------|---------|------|
| `artifacts/api-server/src/data/futureApproaches.ts` | `artifacts/api-server/src/data/futureApproaches.ts` | Criar |
| `artifacts/api-server/src/routes/plan.ts` | `artifacts/api-server/src/routes/plan.ts` | **Substituir** |
| `artifacts/meueu/hooks/usePlanGeneration.ts` | `artifacts/meueu/hooks/usePlanGeneration.ts` | **Substituir** |
| `artifacts/meueu/components/ApproachBadge.tsx` | `artifacts/meueu/components/ApproachBadge.tsx` | Criar |

---

## Passo a passo

### 1. Criar diretório de dados no api-server
```bash
mkdir -p artifacts/api-server/src/data
```

### 2. Substituir plan.ts
O novo `plan.ts` é retrocompatível. Sem Big Five → funciona como antes.
Com Big Five → enriquece o prompt e seleciona a abordagem.

### 3. Adicionar ApproachBadge na tela do plano
Em `artifacts/meueu/app/(tabs)/plan.tsx` (ou onde o plano é exibido):
```tsx
import ApproachBadge from "../../components/ApproachBadge";

// Logo após o cabeçalho do plano, antes das práticas:
{approach && (
  <ApproachBadge
    approachName={approach.name}
    anchorQuestion={approach.anchorQuestion}
  />
)}
```

### 4. Atualizar onde usePlanGeneration é chamado
O hook agora retorna `{ plan, approach, hasBig5 }`.
Salve `approach` no estado do componente para passar ao `ApproachBadge`.

### 5. Exibir perguntaReflexao no plano
O plano agora inclui `perguntaReflexao`. Exiba como card de reflexão:
```tsx
{plan.perguntaReflexao && (
  <View style={styles.reflectionCard}>
    <Text style={styles.reflectionLabel}>Pergunta para hoje</Text>
    <Text style={styles.reflectionText}>"{plan.perguntaReflexao}"</Text>
  </View>
)}
```

---

## Lógica de seleção por Big Five

| Condição | Abordagem |
|----------|-----------|
| N ≥ 75% | CFT (compaixão — autocrítica alta) |
| N ≥ 60% | TCC (reestruturação cognitiva) |
| C < 35% | TFS (pequenos passos concretos) |
| O ≥ 70% | Narrativa (re-autoria, metáforas) |
| A ≥ 65% + N < 55% | ACT (valores e direções) |
| C ≥ 75% | Esquema (Adulto Saudável vs. perfeccionismo) |
| E ≥ 65% | Gestalt (presença e contato) |
| O ≥ 55% + N < 50% | Humanista (tendência atualizante) |
| Sem Big Five | Rotação pela contagem de avaliações |
