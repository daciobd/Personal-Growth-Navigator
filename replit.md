# MeuEu — App de Transformação Pessoal

## Visão Geral
Aplicativo mobile Expo (React Native) em português (pt-BR) para transformação pessoal. Usuários selecionam adjetivos que descrevem o "eu atual" e o "eu futuro" e recebem intervenções terapêuticas personalizadas geradas por IA (Claude Haiku via Anthropic).

## Painel Admin
- URL: `/admin/` — artifact React + Vite separado
- 6 seções: Dashboard, Intervenções, Adjetivos, Logs de Planos, Simulador de Perfil, **Relatórios**
- API: rotas `/api/admin/stats`, `/api/admin/logs`, `/api/admin/interventions`, `/api/admin/adjectives`, `/api/admin/simulate`, `/api/admin/report/:deviceId`
- Logs: cada plano gerado é salvo automaticamente em `plan_logs` no banco de dados
- Relatórios: busca por deviceId, exibe check-ins/coach/planos, perfil Big Five + interpretação IA, exporta PDF via print

## Autenticação
- Backend: `routes/auth.ts` — register/login/refresh/logout/migrate
- Tokens: JWT access (15min) + refresh opaque 30 dias com rotação
- Frontend Expo: `context/AuthContext.tsx` — SecureStore (mobile) + localStorage (web), auto-refresh
- Telas: `app/auth/login.tsx`, `app/auth/register.tsx`
- Perfil: botão de login/logout no tab de perfil
- DB: tabelas `users` + `refresh_tokens` no PostgreSQL (Drizzle schema em `lib/db/src/schema/users.ts`)
- JWT_SECRET: env var `JWT_SECRET` setada no ambiente shared (auto-gerada 32 bytes hex)

## Stack
- **Frontend**: Expo (React Native + Web) com Expo Router
- **Backend API**: Express.js (api-server)
- **AI**: Anthropic Claude Haiku-4-5 via Replit AI Integrations
- **Persistência**: AsyncStorage (local no dispositivo)
- **Navegação**: Expo Router (file-based routing)
- **UI**: @expo/vector-icons (Feather only), Inter font, sem emojis
- **Tabs**: NativeTabs (iOS 26+ liquid glass) ou ClassicTabs (blurred tab bar)

## Arquitetura
```
artifacts/
  meueu/           # Expo app (previewPath: "/")
  api-server/      # Express API
  admin/           # Painel admin React+Vite (previewPath: "/admin/")
lib/
  integrations-anthropic-ai/  # Anthropic client wrapper
  db/                          # Drizzle ORM + PostgreSQL (tabela: plan_logs)
  content/                     # Dados compartilhados: adjetivos + intervenções
  api-zod/                     # Shared Zod schemas
```

## Fluxo de Navegação
```
index → onboarding/welcome → onboarding/current → onboarding/future → onboarding/plan → (tabs)
```
- `index.tsx`: Redireciona para welcome (novo usuário) ou tabs (usuário com onboarding completo)
- `onboarding/welcome`: Apresenta o app, abordagens terapêuticas e como funciona
- `onboarding/current`: Seleção de adjetivos "Eu Hoje" com filtro por categoria
- `onboarding/future`: Seleção de adjetivos "Eu Futuro" com filtro por categoria
- `onboarding/plan`: Geração do plano personalizado via IA (Claude Haiku)
- `(tabs)/index`: Dashboard "Hoje" com plano gerado e práticas recomendadas
- `(tabs)/profile`: Perfil, estatísticas, progresso e reset de jornada
- `intervention/[id]`: Tela step-by-step de uma prática (suporta intervenções estáticas e práticas do plano gerado)

## Gamificação
- `data/gamification.ts`: 10 níveis (Iniciante → Pleno), tabela de XP por ação, 15 badges com condições
- `context/GamificationContext.tsx`: estado em AsyncStorage, deviceId gerado na primeira abertura, calcula streaks e badges automaticamente
- `components/DailyChallenge.tsx`: card com 3 estados (desafio → check-in → concluído), rotaciona as 3 práticas por dia da semana (weekday % 3)
- `components/XPBar.tsx`: barra de progresso com nível atual e título
- `components/BadgeGrid.tsx`: grade de 15 conquistas (coloridas = desbloqueadas, cinza = bloqueadas)
- `app/coach/index.tsx`: tela de chat com Claude Haiku, histórico persistido, +2 XP por mensagem
- `hooks/useNotifications.ts`: agendamento de notificação diária às 9h (nativa)
- AsyncStorage key: `@meueu_gamification_v1`

## API Endpoints
- `POST /api/plan/generate` — Gera plano personalizado via Claude Haiku
  - Body: `{ currentAdjectives: string[], futureAdjectives: string[] }`
  - Response: `{ success: true, plan: { sintese, fraseIntencao, praticas[] } }`
- `POST /api/daily/challenge` — Gera ação concreta do dia via IA
  - Body: `{ deviceId, date, practice? }`
  - Response: `{ alreadyCheckedIn, aiAction, practiceIndex, date }`
- `POST /api/daily/checkin` — Registra check-in diário, calcula XP, gera tip via IA
  - Body: `{ deviceId, date, practiceIndex, practiceName, completed, rating?, note? }`
  - Response: `{ xpEarned, aiTip, streakDays, alreadyDone }`
- `GET /api/daily/history?deviceId=xxx` — Histórico de check-ins
- `POST /api/coach/message` — Envia mensagem ao coach IA, retorna resposta + XP
  - Body: `{ deviceId, message, history? }`
  - Response: `{ response, xpEarned: 2 }`
- `GET /api/coach/history?deviceId=xxx` — Histórico de mensagens do coach

## Teste Big Five de Personalidade
- `data/big5.ts`: 120 itens em pt-BR, 5 dimensões × 6 facetas × 4 itens cada. Funções: `scoreAnswers()`, `qualitativeLevel()`, `buildBig5PromptBlock()`, `getPageItems(page)`
- `components/RadarChart.tsx`: gráfico radar SVG nativo (react-native-svg), 5 eixos, suporta dados atuais + anteriores em sobreposição
- `components/AssessmentEntry.tsx`: widget na tab Perfil — convite (sem dados) ou mini radar + pontuações (com dados, reavaliação em 28 dias)
- `app/assessment/index.tsx`: questionário paginado (10 itens/página × 12 páginas), escala Likert 1–5, salva resultado no AsyncStorage
- `app/assessment/result.tsx`: resultado com 2 abas — "Visão geral" (radar + interpretação IA + cards por dimensão) e "30 Facetas" (barras por dimensão)
- `hooks/usePlanGeneration.ts`: wrapper do endpoint `/api/plan/generate` que carrega automaticamente Big5 do AsyncStorage e envia junto
- `POST /api/assessment/interpret`: interpretação textual personalizada via Claude Haiku com base nas 5 dimensões + 30 facetas
- AsyncStorage key: `@meueu_big5_v1` — `{ scores: Big5Scores, completedAt: string, answers: Record<number, number> }`
- `plan.ts` retrocompatível: se `big5Scores` vier no body, adiciona bloco de perfil ao prompt do Claude

## Dados
### Adjetivos (data/adjectives.ts)
62 adjetivos em 5 categorias: Emocional, Cognitivo, Social, Comportamental, Valores
- `CURRENT_ADJECTIVES`: adjetivos do "eu atual"
- `FUTURE_ADJECTIVES`: adjetivos do "eu futuro"
- Cada categoria tem cor e ícone próprios

### Intervenções (data/interventions.ts)
10 intervenções pré-construídas com scoring por relevância de adjetivos
- Abordagens: TCC, ACT, Mindfulness, Psicologia Positiva, Terapia Narrativa, Focada em Compaixão
- `getRelevantInterventions()`: Ordena por relevância cross-referenciando adjetivos

### Plano Gerado por IA
Estrutura: `{ sintese, fraseIntencao, praticas: [{ abordagem, nome, justificativa, passos[], frequencia }] }`
- Sempre 3 práticas: TCC, ACT, Psicologia Positiva
- Salvo em AppContext e AsyncStorage

## Contexto (context/AppContext.tsx)
- `profile.currentAdjectives`: adjetivos atuais selecionados
- `profile.futureAdjectives`: adjetivos futuros selecionados
- `profile.generatedPlan`: plano gerado pela IA
- `profile.onboardingComplete`: flag de onboarding
- `profile.interventionsViewed[]`: práticas concluídas
- `profile.streakDays`: dias consecutivos de uso
- Storage key: `@meueu_profile_v2`

## Variáveis de Ambiente
- `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` — Auto-set pelo Replit AI Integration
- `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — Auto-set pelo Replit AI Integration
- `EXPO_PUBLIC_DOMAIN` — Domínio público para chamadas da API no Expo

## Tema de Cores
- Primary: `#1B6B5A` (teal escuro)
- Accent: `#E8A838` (dourado)
- Background: `#F5F8F6`
- Card: `#FFFFFF`
- Text: `#0F1F1B`

## Componentes Principais
- `CategoryPicker`: Filtro por categoria + chips de adjetivos
- `ProgressBar`: Barra de progresso do onboarding
- `StreakBadge`: Badge de sequência de dias
- `InterventionCard`: Card de intervenção (legado)
- `AdjectiveChip`: Chip individual (legado, integrado no CategoryPicker)
- `ErrorBoundary`: Boundary de erros

## Preferências do Usuário
- Todo texto em pt-BR
- Nunca usar emojis — usar @expo/vector-icons (Feather)
- paddingTop: 67 (web), insets.top (native)
- paddingBottom: 34 (web), insets.bottom (native)
- Fonte: Inter (400, 500, 600, 700)
- API calls: usar `process.env.EXPO_PUBLIC_DOMAIN` (nunca hardcode)
