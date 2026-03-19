# MeuEu — Documento de Arquitetura e Visão Técnica
**Para uso de consultor | Março 2026**

---

## 1. Visão Geral do Produto

**MeuEu** é um app de transformação pessoal em português (pt-BR) que combina psicologia baseada em evidências com IA generativa. O usuário define quem é hoje (adjetivos atuais), quem quer ser (adjetivos futuros) e recebe um plano terapêutico adaptativo gerado por Claude (Anthropic).

**Proposta de valor:** uma jornada personalizada de 30 dias por abordagem — TCC, ACT, Mindfulness, Psicologia Positiva, Terapia Narrativa, Focada em Compaixão — com check-ins diários, gamificação (XP, streaks, badges), coach de IA e avaliação de personalidade Big Five.

**URL de produção:** `https://personal-growth-navigator.replit.app/`

---

## 2. Stack Tecnológica

### Monorepo (pnpm workspaces)
```
/
├── artifacts/
│   ├── meueu/          → App mobile/web (Expo + React Native)
│   ├── api-server/     → API REST (Express + TypeScript)
│   ├── admin/          → Painel administrativo (React + Vite)
│   └── mockup-sandbox/ → Servidor de preview de componentes (dev)
└── (packages internos via workspace:*)
    ├── @workspace/db           → Schema Drizzle ORM + conexão PostgreSQL
    ├── @workspace/content      → Catálogo de intervenções e adjetivos
    ├── @workspace/api-zod      → Tipos e validações compartilhados
    └── @workspace/integrations-anthropic-ai → Cliente Claude
```

### Por artifact

| Artifact | Framework | Runtime | Porta |
|---|---|---|---|
| meueu | Expo SDK 54 + Expo Router 6 | React Native 0.81 | `$PORT` (Expo Go) |
| api-server | Express 5 + TypeScript | Node.js + tsx | `$PORT` |
| admin | React 19 + Vite | Browser | `$PORT` |

### Banco de dados
- **PostgreSQL** provisionado pelo Replit (variável `DATABASE_URL`)
- ORM: **Drizzle ORM** com `drizzle-zod` para validação
- Migrations: `pnpm --filter @workspace/db push`

### IA
- **Anthropic Claude** via proxy Replit AI Integrations
- Modelo: `claude-haiku-4-5`
- Variáveis: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY`

---

## 3. Arquitetura do App (artifacts/meueu)

### Navegação (Expo Router 6 — file-based routing)

```
app/
├── _layout.tsx              → Root layout (providers globais)
├── +not-found.tsx
├── (tabs)/
│   ├── _layout.tsx          → Tab layout (web: sidebar; native: tab bar)
│   ├── index.tsx            → Tab "Hoje" (check-in diário + desafio IA)
│   ├── journeys.tsx         → Tab "Jornadas" (catálogo 6 × 30 dias)
│   ├── coach.tsx            → Tab "Coach" (chat IA)
│   └── profile.tsx          → Tab "Meu Eu" (perfil + gamificação)
├── auth/
│   ├── login.tsx
│   └── register.tsx
├── onboarding/
│   ├── welcome.tsx          → Boas-vindas
│   ├── current.tsx          → "Quem sou hoje" (adjetivos atuais)
│   ├── traits.tsx           → Traços de personalidade (adjetivos estáveis)
│   ├── state.tsx            → Estado emocional atual
│   ├── future.tsx           → "Quem quero ser" (adjetivos futuros)
│   └── plan.tsx             → Geração do plano terapêutico (Claude)
├── assessment/
│   ├── index.tsx            → Avaliação Big Five (120 questões NEO-PI-R)
│   └── result.tsx           → Relatório de personalidade gerado por IA
├── journeys/
│   └── [id].tsx             → Detalhes + progresso de uma jornada
├── intervention/
│   └── [id].tsx             → Exercício terapêutico detalhado
└── coach/
    └── index.tsx            → Chat coach (idêntico à tab, rota alternativa)
```

### Navegação adaptativa por plataforma

| Plataforma | Condição | Navegação |
|---|---|---|
| iOS / Android (nativo) | `Platform.OS !== "web"` | Tab bar nativa na base |
| Web mobile (< 768px) | `Platform.OS === "web"` | Botão "M" + drawer lateral |
| Web desktop (≥ 768px) | `Platform.OS === "web"` | Sidebar fixa à esquerda |

O componente `WebSidebar` renderiza apenas em `Platform.OS === "web"` e é montado no `_layout.tsx` raiz.

### Contexts (estado global)

| Context | Responsabilidade | Storage |
|---|---|---|
| `AuthContext` | JWT tokens, login/logout, `isLoggedIn` | SecureStore |
| `AppContext` | Perfil do usuário, plano terapêutico, onboarding | AsyncStorage |
| `GamificationContext` | XP, streak, badges, deviceId | AsyncStorage + API |
| `SidebarContext` | Estado do sidebar web (`isOpen`, `isWide`) | Memória |

**Chaves SecureStore** (sem `@`):
- `meueu_access_token`
- `meueu_refresh_token`
- `meueu_auth_user`

**Chaves AsyncStorage**:
- `@meueu_profile_v2` — perfil completo
- `@meueu_plan` — plano terapêutico gerado
- `@meueu_future_adjectives`, `@meueu_current_adjectives`
- `@meueu_trait_adjectives`, `@meueu_state_adjectives`
- `@meueu_device_id`, `@meueu_current_approach`, `@meueu_assessments`

### Componentes principais

| Componente | Função |
|---|---|
| `WebSidebar` | Navegação lateral no web |
| `UnifiedCheckin` | Check-in diário (nota 1-5, nota de texto, XP) |
| `DailyChallenge` | Exibe exercício do dia gerado por IA |
| `XPBar` | Barra de progresso de nível |
| `StreakBadge` | Exibe streak atual |
| `BadgeGrid` | Grade de conquistas |
| `Big5LivePreview` | Preview em tempo real do perfil Big Five |
| `RadarChart` | Gráfico radar das 5 dimensões Big Five |
| `InterventionCard` | Card de exercício terapêutico |
| `ApproachBadge` | Badge da abordagem terapêutica ativa |
| `CategoryPicker` | Seletor de adjetivos por categoria |
| `PwaHead` / `PwaHead.web` | Meta tags PWA (web only) |

---

## 4. API Server (artifacts/api-server)

### Base URL
- Desenvolvimento: `https://<REPLIT_DEV_DOMAIN>/api`
- Produção: `https://personal-growth-navigator.replit.app/api`

> **Regra importante:** No app Expo, sempre usar `getApiUrl()` de `@/utils/api`. Nunca referenciar `EXPO_PUBLIC_DOMAIN` diretamente.

### Rotas

#### Auth (`/api/auth`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/register` | Cria conta (email, senha, nome) |
| POST | `/login` | Login → access token (15min) + refresh token (30 dias) |
| POST | `/refresh` | Renova access token via refresh token |
| POST | `/logout` | Invalida refresh token |
| POST | `/migrate` | Migra dados anônimos (deviceId) para conta criada |

**JWT:** `JWT_SECRET` via env. Access token: 15 min. Refresh: 30 dias, armazenado em `refresh_tokens` table.

#### Plano Terapêutico (`/api/plan`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/plan/generate` | Gera plano via Claude com adjetivos + Big Five |

**Input do prompt:**
- `traitAdjectives` — traços estáveis (→ estimativa Big Five)
- `stateAdjectives` — estado emocional atual (contexto volátil)
- `futureAdjectives` — quem o usuário quer ser
- `big5Scores` — scores opcionais de avaliação completa
- `assessmentNumber` — número da avaliação (ajusta profundidade)

**Output:** síntese narrativa, frase de intenção, lista de práticas com abordagem terapêutica, justificativa, passos.

#### Check-ins Diários (`/api/daily`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/daily/challenge` | Gera desafio do dia via Claude (com motor adaptativo) |
| POST | `/daily/checkin` | Registra check-in (nota, texto, XP calculado) |
| GET | `/daily/history` | Histórico de check-ins por deviceId |
| GET | `/daily/today` | Check-in de hoje |

**Cálculo de XP por check-in:**
- Base: 5 XP
- Completo: +20 XP
- Nota 5: +15 XP / Nota 4: +10 XP
- Streak bonus: +5 XP/dia (máx. 50 XP)

#### Coach IA (`/api/coach`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/coach/message` | Envia mensagem → resposta do Claude (streaming parcial) |
| GET | `/coach/history` | Histórico de mensagens por deviceId |

**System prompt do coach:** persona "Eu", coach terapêutico empático em pt-BR. Usa TCC, ACT, Mindfulness, Psicologia Positiva. Respostas curtas (3-4 frases). Não substitui terapeuta.

#### Assessment Big Five (`/api/assessment`)
| Método | Rota | Descrição |
|---|---|---|
| POST | `/assessment/interpret` | Claude gera relatório narrativo dos scores Big Five |

#### Jornadas (`/api/journeys`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/journeys` | Lista jornadas do usuário (por deviceId) |
| POST | `/journeys/start` | Inicia uma jornada |
| POST | `/journeys/checkin` | Registra check-in de jornada |
| GET | `/journeys/:id/progress` | Progresso da jornada |

#### Admin (`/api/admin`)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/admin/users` | Lista usuários |
| GET | `/admin/logs` | Logs de planos gerados |
| GET | `/admin/assessment-reports` | Relatórios Big Five |

#### Utilitários
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Health check do servidor |

---

## 5. Motor Adaptativo (Adaptive Engine)

Arquivo: `artifacts/api-server/src/adaptiveEngine.ts`

Analisa os últimos check-ins e retorna um de **7 sinais** que modifica o prompt do Claude para ajustar a dificuldade do desafio diário:

| Sinal | Condição | Ação |
|---|---|---|
| `neutral` | Padrão | Sem ajuste |
| `subtle_adjust` | Nota baixa ontem | Ajuste sutil |
| `simplify` | 2 dias com notas baixas | Versão de 2 minutos |
| `approach_change` | 3 dias com notas baixas | Muda abordagem terapêutica |
| `add_challenge` | 3 dias com notas altas | Nível extra de dificuldade |
| `integration_ready` | 5 dias consecutivos altos | Integração no mundo real |
| `checkin_missing` | Sem check-in há 3+ dias | Acolhida de retorno |

---

## 6. Banco de Dados — Schema (Drizzle ORM)

### Tabelas

#### `users`
```
id            serial PK
email         text UNIQUE NOT NULL
name          text NOT NULL
password_hash text NOT NULL
device_id     text (link com dados anônimos)
is_therapist  boolean DEFAULT false
is_admin      boolean DEFAULT false
created_at    timestamp
```

#### `refresh_tokens`
```
id         serial PK
user_id    serial FK → users.id
token      text UNIQUE NOT NULL
expires_at timestamp NOT NULL
created_at timestamp
```

#### `daily_checkins`
```
id             serial PK
device_id      text NOT NULL
date           text NOT NULL (YYYY-MM-DD)
practice_index integer
practice_name  text
ai_action      text
completed      boolean DEFAULT false
rating         integer (1-5)
note           text
ai_tip         text
xp_earned      integer DEFAULT 0
streak_days    integer DEFAULT 1
created_at     timestamp
```

#### `coach_messages`
```
id         serial PK
device_id  text NOT NULL
role       text NOT NULL (user | assistant)
content    text NOT NULL
xp_earned  integer DEFAULT 0
created_at timestamp
```

#### `plan_logs`
```
id                  serial PK
session_id          text
current_adjectives  jsonb (string[])
future_adjectives   jsonb (string[])
sintese             text
frase_intencao      text
praticas            jsonb (array)
created_at          timestamp
```

#### `user_journeys`
```
id                 serial PK
device_id          text NOT NULL
journey_id         text NOT NULL (ex: "anxiety-30")
phase              integer DEFAULT 1 (1, 2 ou 3)
current_day        integer DEFAULT 1 (1-30)
status             text DEFAULT "active" (active | paused | completed)
started_at         timestamp
completed_at       timestamp
last_practice_date date
completed_days     integer DEFAULT 0
```

#### `journey_checkins`
```
id            serial PK
device_id     text NOT NULL
journey_id    text NOT NULL
day           integer NOT NULL
phase         integer NOT NULL
practice_key  text NOT NULL
completed     boolean NOT NULL
note          integer (1-5)
comment       text
checkin_date  date NOT NULL
created_at    timestamp
```

---

## 7. Catálogo de Conteúdo (@workspace/content)

### Intervenções Terapêuticas
Arquivo: `content/src/interventions.ts`

6 abordagens × múltiplas intervenções. Cada intervenção:
```typescript
{
  id: string           // ex: "tcc-pensamento-automatico"
  therapy: Therapy     // TCC | ACT | Mindfulness | Psicologia Positiva | Terapia Narrativa | Focada em Compaixão
  title: string
  description: string
  steps: string[]      // passo a passo
  duration: string     // ex: "10 min"
  fromAdjectives: string[]  // gatilhos de entrada
  toAdjectives: string[]    // destino de transformação
  icon: string         // ícone Feather
}
```

### Adjetivos
Arquivo: `content/src/adjectives.ts`

5 categorias de adjetivos com cores e ícones:

| Categoria | Ícone | Cor principal |
|---|---|---|
| Emocional | heart | Vermelho |
| Cognitivo | cpu | Azul |
| Social | users | Verde |
| Comportamental | activity | Laranja |
| Valores | star | Roxo |

**Adjetivos atuais** (~60 itens): ansioso, tenso, triste, irritável, pessimista, autocrítico, tímido, procrastinador, etc.

**Adjetivos futuros** (~60 itens): calmo, confiante, alegre, resiliente, otimista, autêntico, empático, disciplinado, etc.

### Jornadas (catálogo em código, progresso no banco)
6 jornadas de 30 dias × 3 fases:
- Ansiedade → Calma (`anxiety-30`)
- Autoestima → Confiança
- Foco → Produtividade
- Relacionamentos → Conexão
- Propósito → Direção
- Estresse → Equilíbrio

---

## 8. Avaliação Big Five (NEO-PI-R)

### Estrutura
- 120 questões (6 facetas × 5 dimensões × 4 questões)
- Escala Likert 1-5
- Resultado: scores 0-100 por dimensão e faceta

### 5 Dimensões (OCEAN)
| Sigla | Nome PT | Facetas |
|---|---|---|
| O | Abertura à Experiência | Fantasia, Estética, Sentimentos, Variedade, Intelecto, Valores |
| C | Conscienciosidade | Competência, Ordem, Dever, Realizações, Autodisciplina, Deliberação |
| E | Extroversão | Cordialidade, Gregarismo, Assertividade, Atividade, Emoções, Emocionalidade Positiva |
| A | Amabilidade | Confiança, Franqueza, Altruísmo, Complacência, Modéstia, Sensibilidade |
| N | Neuroticismo | Ansiedade, Hostilidade, Tristeza, Autoconsciência, Impulsividade, Vulnerabilidade |

### Integração com plano terapêutico
Os scores Big Five alimentam o prompt de geração de plano, onde:
- `traitAdjectives` → estimativa Big Five por palavra-chave
- `big5Scores` (avaliação completa) → análise de facetas profundas
- Claude diferencia traços estáveis (personalidade) de estado atual (contexto emocional)

---

## 9. Gamificação

### Módulo: `GamificationContext`
```typescript
// Exports
deviceId        // ID anônimo do dispositivo (UUID persistido)
totalXP         // XP acumulado total
streak          // Streak atual em dias
maxStreak       // Maior streak histórico
currentLevel    // Nível atual (calculado por XP)
earnedBadges    // Badges conquistados
addXP(amount)   // Adiciona XP manualmente
recordCheckin() // Registra check-in (XP automático)
recordCoachMessage() // Registra mensagem ao coach (XP)
isLoading       // Estado de carregamento inicial
```

### Fontes de XP
| Ação | XP |
|---|---|
| Check-in base | 5 XP |
| Check-in completo | +20 XP |
| Nota 5 no check-in | +15 XP |
| Nota 4 no check-in | +10 XP |
| Streak diário | +5 XP/dia (máx. 50 XP) |
| Mensagem ao coach | XP variável |

---

## 10. Painel Administrativo (artifacts/admin)

Stack: React 19 + Vite + Radix UI + TanStack Query + React Hook Form

### Páginas
| Página | Rota | Função |
|---|---|---|
| Dashboard | `/` | Métricas gerais do app |
| Usuários | `/users` | Lista e busca de usuários |
| Logs | `/logs` | Logs de planos gerados (adjetivos + síntese) |
| Biblioteca | `/library` | Catálogo de intervenções |
| Adjectives | `/adjectives` | Gerenciamento de adjetivos |
| Simulator | `/simulator` | Simula geração de plano |
| Relatório | `/relatorio` | Relatórios de avaliação Big Five |

---

## 11. Servidor de Produção (serve.js)

Arquivo: `artifacts/meueu/server/serve.js`

Servidor Node.js puro (sem dependências externas) que serve o build estático.

### Roteamento de produção

| Rota | Comportamento |
|---|---|
| `GET /` (sem header expo-platform) | App Expo web (dist-web/index.html) + SPA fallback |
| `GET /` com header `expo-platform: ios` | Manifesto Expo nativo iOS (static-build/ios/manifest.json) |
| `GET /` com header `expo-platform: android` | Manifesto Expo nativo Android |
| `GET /manifest` com expo-platform | Manifesto nativo correspondente |
| `GET /landing` | Landing page HTML branding |
| `GET /app/*` | 301 redirect → `/` (compatibilidade legado) |
| `GET /sw.js` | Service worker (headers no-cache) |
| `GET /_expo/*`, `/assets/*`, `/favicon.ico` | Arquivos estáticos do build web |

### Build de produção

```bash
# Gera dist-web/ (app web) + static-build/ (nativo iOS/Android)
pnpm --filter @workspace/meueu run build

# Somente web (mais rápido, sem Metro nativo)
cd artifacts/meueu && pnpm exec expo export --platform web --output-dir dist-web
```

O `build.js` completo:
1. Inicia Metro Bundler (`expo start --no-dev --minify`)
2. Baixa bundles iOS e Android via HTTP do Metro
3. Baixa manifestos iOS e Android
4. Extrai e copia assets
5. Atualiza URLs dos bundles com domínio de produção
6. Executa `expo export --platform web` → `dist-web/`

---

## 12. Variáveis de Ambiente

| Variável | Onde usada | Descrição |
|---|---|---|
| `DATABASE_URL` | api-server, db | Connection string PostgreSQL |
| `JWT_SECRET` | api-server | Segredo para assinar JWTs |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | api-server | Proxy Anthropic via Replit |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | api-server | Chave do proxy Anthropic |
| `EXPO_PUBLIC_DOMAIN` | meueu (build) | Domínio público do app |
| `REPLIT_DEV_DOMAIN` | meueu (dev) | Domínio de dev Replit |
| `REPLIT_INTERNAL_APP_DOMAIN` | meueu (prod) | Domínio interno de produção |
| `REPL_ID` / `EXPO_PUBLIC_REPL_ID` | meueu | ID do Repl |
| `PORT` | todos | Porta do servidor (Replit injeta) |
| `BASE_PATH` | serve.js | Prefixo de rota (opcional) |

---

## 13. Fluxo Principal do Usuário

```
1. Onboarding (primeira vez)
   ├── /onboarding/welcome     → apresentação
   ├── /onboarding/current     → seleciona adjetivos atuais (estado + traços)
   ├── /onboarding/state       → estado emocional atual
   ├── /onboarding/traits      → traços de personalidade
   ├── /onboarding/future      → seleciona adjetivos futuros
   └── /onboarding/plan        → Claude gera plano → salvo em AsyncStorage

2. Uso diário
   ├── Tab "Hoje"
   │   ├── Motor adaptativo analisa últimos 7 check-ins
   │   ├── Claude gera desafio personalizado (abordagem + passos)
   │   ├── Usuário realiza e faz check-in (nota 1-5 + texto)
   │   └── XP + streak atualizados
   ├── Tab "Jornadas"
   │   ├── Escolhe jornada de 30 dias
   │   └── Pratica e registra check-in por dia
   ├── Tab "Coach"
   │   ├── Chat livre com IA terapêutica
   │   └── Histórico persistido por deviceId
   └── Tab "Meu Eu"
       ├── Perfil + XP + nível + badges
       ├── Avaliação Big Five (opcional)
       └── Login/conta (opcional — app funciona anonimamente)

3. Autenticação (opcional)
   ├── App funciona 100% anonimamente via deviceId
   ├── Cadastro migra dados anônimos → conta (POST /migrate)
   └── JWT: access token (15min) + refresh token (30 dias)
```

---

## 14. Decisões Arquiteturais Relevantes

1. **Anonimato por padrão:** O app funciona sem conta. O `deviceId` (UUID persistido em AsyncStorage) é a chave primária de todos os dados. Conta é opcional para sincronização multi-dispositivo.

2. **Dados offline-first:** Plano terapêutico e perfil ficam em AsyncStorage. A API é chamada para gerar plano e registrar check-ins, mas o app não quebra sem internet.

3. **Separação traços vs. estado:** O prompt do Claude recebe separados os adjetivos de traço (estáveis, personalidade) e de estado (voláteis, emocionais) para gerar sínteses mais precisas.

4. **Motor adaptativo no servidor:** A lógica de adaptação do desafio diário roda no api-server (não no app), facilitando ajustes sem atualizar o app.

5. **Build nativo vs. web:** O mesmo codebase Expo gera iOS/Android (via Expo Go + Metro) e web (via `expo export`). Em produção, o `serve.js` serve ambos do mesmo processo.

6. **Admin separado:** O painel admin é um app React/Vite independente, não parte do app Expo, para isolamento de permissões e simplicidade.

---

## 15. Pontos de Atenção para o Consultor

- **Custo de IA:** Cada geração de plano, check-in com dica de IA, mensagem ao coach e interpretação de Big Five faz uma chamada ao Claude. Em escala, monitorar tokens consumidos.
- **deviceId como chave:** Ao trocar de dispositivo, o usuário perde dados se não tiver conta. A migração (`/migrate`) é o caminho, mas requer cadastro.
- **Sem rate limiting:** As rotas de IA não têm rate limiting implementado. Adicionar para produção escalável.
- **JWT sem revogação imediata:** Apenas refresh tokens são revogados. Access tokens de 15 min continuam válidos até expirar.
- **Big Five:** A avaliação completa (120 questões) é opcional. O plano usa estimativa por adjetivos quando não disponível.
- **Jornadas:** O catálogo de jornadas está hardcoded no cliente. O progresso (dias, check-ins) é persistido no banco.
