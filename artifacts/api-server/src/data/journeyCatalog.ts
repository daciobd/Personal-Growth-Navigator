// artifacts/api-server/src/data/journeyCatalog.ts
//
// Catálogo completo de jornadas temáticas de 30 dias.
// Estrutura: 3 fases × 10 dias, cada dia com 1 prática principal.
// A IA usa os metadados de cada dia para gerar a proposição de ação específica.

export type JourneyPhase = {
  number: 1 | 2 | 3;
  title: string;
  description: string;
  focus: string;         // Foco clínico desta fase
  approach: string;      // Abordagem terapêutica predominante
};

export type JourneyDay = {
  day: number;           // 1-30
  phase: 1 | 2 | 3;
  practiceKey: string;   // Identificador único
  title: string;         // Nome da prática
  description: string;   // O que fazer (base para a IA gerar ação do dia)
  technique: string;     // Técnica terapêutica específica
  duration: string;      // Tempo estimado
  approach: string;      // TCC / ACT / CFT / etc.
};

export type Journey = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;          // Feather icon
  targetDimension: string; // Qual dimensão Big Five mais se beneficia
  phases: JourneyPhase[];
  days: JourneyDay[];
};

// ══════════════════════════════════════════════════════════
// JORNADA 1 — ANSIEDADE E REGULAÇÃO EMOCIONAL
// ══════════════════════════════════════════════════════════
const anxietyJourney: Journey = {
  id: "anxiety-30",
  title: "Navegando a Ansiedade",
  subtitle: "30 dias de regulação emocional",
  description: "Uma jornada estruturada para compreender, aceitar e regular a ansiedade usando TCC, ACT e Mindfulness.",
  color: "#3A5A8C",
  icon: "wind",
  targetDimension: "N",
  phases: [
    { number: 1, title: "Conhecer", description: "Entender os padrões da sua ansiedade", focus: "Psicoeducação e consciência", approach: "TCC" },
    { number: 2, title: "Aceitar", description: "Mudar sua relação com a ansiedade", focus: "Desfusão e aceitação", approach: "ACT" },
    { number: 3, title: "Regular", description: "Ferramentas de regulação no dia a dia", focus: "Habilidades de coping", approach: "DBT/Mindfulness" },
  ],
  days: [
    // Fase 1 — Conhecer (TCC)
    { day:1,  phase:1, practiceKey:"anx-p1-d1",  title:"Mapa da ansiedade",        description:"Faça um registro das 3 situações que mais geraram ansiedade esta semana. Anote: situação → pensamento → emoção → comportamento.",    technique:"Registro ABC",           duration:"15 min", approach:"TCC" },
    { day:2,  phase:1, practiceKey:"anx-p1-d2",  title:"Termômetro emocional",     description:"A cada 2 horas, pare 30 segundos e avalie sua ansiedade de 0-10. Anote o que estava acontecendo em cada medição.",                        technique:"Monitoramento de humor", duration:"Ao longo do dia", approach:"TCC" },
    { day:3,  phase:1, practiceKey:"anx-p1-d3",  title:"Pensamentos automáticos",  description:"Identifique 3 pensamentos automáticos negativos que apareceram hoje. Para cada um: qual é a evidência a favor e contra?",                   technique:"Questionamento socrático",duration:"20 min", approach:"TCC" },
    { day:4,  phase:1, practiceKey:"anx-p1-d4",  title:"Corpo e ansiedade",         description:"Faça um escaneamento corporal. Onde no seu corpo você sente a ansiedade? Descreva com detalhes: peso, calor, tensão, localização.",         technique:"Body scan",              duration:"15 min", approach:"Mindfulness" },
    { day:5,  phase:1, practiceKey:"anx-p1-d5",  title:"Gatilhos",                 description:"Liste seus 5 principais gatilhos de ansiedade. Para cada um, escreva: o que torna essa situação ameaçadora para você?",                       technique:"Análise funcional",      duration:"20 min", approach:"TCC" },
    { day:6,  phase:1, practiceKey:"anx-p1-d6",  title:"Respiração 4-7-8",         description:"Pratique a respiração 4-7-8: inspire por 4 segundos, segure 7, expire 8. Faça 4 ciclos, 3 vezes ao dia.",                                   technique:"Regulação autonômica",   duration:"5 min × 3", approach:"DBT" },
    { day:7,  phase:1, practiceKey:"anx-p1-d7",  title:"Revisão da semana",        description:"Revise o que descobriu sobre sua ansiedade esta semana. Qual foi o insight mais importante? O que quer explorar na próxima fase?",             technique:"Reflexão integrativa",   duration:"20 min", approach:"TCC" },
    { day:8,  phase:1, practiceKey:"anx-p1-d8",  title:"Catastrofização",          description:"Identifique um pensamento catastrófico recente. Responda: qual é o pior cenário real? Qual a probabilidade? O que faria se acontecesse?",      technique:"Descatastrofização",     duration:"15 min", approach:"TCC" },
    { day:9,  phase:1, practiceKey:"anx-p1-d9",  title:"Âncoras de segurança",     description:"Identifique 3 'âncoras' — pessoas, lugares ou objetos que te fazem sentir seguro. Como pode acessá-las mais ativamente?",                    technique:"Recursos de segurança",  duration:"15 min", approach:"CFT" },
    { day:10, phase:1, practiceKey:"anx-p1-d10", title:"Carta para sua ansiedade", description:"Escreva uma carta curta para sua ansiedade. Não para expulsá-la — para entendê-la. O que ela está tentando te proteger?",                    technique:"Externalização",         duration:"20 min", approach:"Narrativa" },
    // Fase 2 — Aceitar (ACT)
    { day:11, phase:2, practiceKey:"anx-p2-d1",  title:"Desfusão cognitiva",       description:"Escolha um pensamento ansioso. Repita em voz alta muito devagar por 60 segundos. Observe: o pensamento muda? Você se distancia dele?",        technique:"Defusion",               duration:"10 min", approach:"ACT" },
    { day:12, phase:2, practiceKey:"anx-p2-d2",  title:"Eu como contexto",         description:"Sente-se confortável. Observe seus pensamentos como nuvens passando. Você é o céu, não as nuvens. Pratique por 10 minutos.",                   technique:"Self-as-context",        duration:"15 min", approach:"ACT" },
    { day:13, phase:2, practiceKey:"anx-p2-d3",  title:"Valores sob a ansiedade",  description:"O que a ansiedade está 'protegendo' que você valoriza? Liste 3 valores que se escondem por trás das suas principais preocupações.",            technique:"Values clarification",   duration:"20 min", approach:"ACT" },
    { day:14, phase:2, practiceKey:"anx-p2-d4",  title:"Exposição suave",          description:"Escolha um gatilho pequeno (2-3/10 de dificuldade). Exponha-se por 5 minutos sem evitar. Observe a ansiedade sem tentar controlá-la.",         technique:"Exposição graduada",     duration:"20 min", approach:"TCC" },
    { day:15, phase:2, practiceKey:"anx-p2-d5",  title:"Ação comprometida",        description:"Identifique uma ação que você evita por ansiedade mas que está alinhada com um valor seu. Dê um pequeno passo hoje.",                          technique:"Committed action",       duration:"Variável", approach:"ACT" },
    { day:16, phase:2, practiceKey:"anx-p2-d6",  title:"Mindfulness da ansiedade", description:"Quando a ansiedade surgir, pratique: nomear ('estou sentindo ansiedade'), localizar no corpo, respirar com ela sem tentar mudá-la.",          technique:"Mindful acceptance",     duration:"10 min", approach:"Mindfulness" },
    { day:17, phase:2, practiceKey:"anx-p2-d7",  title:"Metáfora do passageiro",   description:"Visualize a ansiedade como um passageiro barulhento no ônibus que você dirige. Ele pode falar, mas você escolhe a direção.",                   technique:"Metáfora ACT",           duration:"15 min", approach:"ACT" },
    { day:18, phase:2, practiceKey:"anx-p2-d8",  title:"Compaixão pela ansiedade", description:"Coloque a mão no coração. Diga para si mesmo: 'Isso é difícil. Muitas pessoas sentem isso. Que eu possa ser gentil comigo mesmo neste momento.'",technique:"Self-compassion",       duration:"10 min", approach:"CFT" },
    { day:19, phase:2, practiceKey:"anx-p2-d9",  title:"Expansão de zona de conforto", description:"Faça algo pequeno que normalmente evitaria por ansiedade social. Qualquer coisa — pedir informação, iniciar conversa.",                  technique:"Exposição comportamental",duration:"Variável", approach:"TCC" },
    { day:20, phase:2, practiceKey:"anx-p2-d10", title:"Revisão da fase 2",        description:"Reflita: qual técnica de aceitação funcionou melhor para você? O que mudou na sua relação com a ansiedade nestas 2 semanas?",                  technique:"Reflexão integrativa",   duration:"20 min", approach:"ACT" },
    // Fase 3 — Regular (DBT/Mindfulness)
    { day:21, phase:3, practiceKey:"anx-p3-d1",  title:"TIPP para crise",          description:"Aprenda TIPP: Temperature (água fria no rosto), Intense exercise (1 min), Paced breathing (expiração longa), Progressive relaxation.",        technique:"DBT TIPP skill",         duration:"10 min", approach:"DBT" },
    { day:22, phase:3, practiceKey:"anx-p3-d2",  title:"Relaxamento muscular progressivo", description:"Contraia e relaxe cada grupo muscular por 5 segundos, dos pés à cabeça. Complete o ciclo completo.",                                technique:"PMR",                    duration:"20 min", approach:"Relaxamento" },
    { day:23, phase:3, practiceKey:"anx-p3-d3",  title:"Reavaliação cognitiva",    description:"Pegue um pensamento ansioso. Reescreva-o em perspectiva: 'Estou tendo o pensamento de que...' e então '...e isso não é um fato.'",             technique:"Cognitive reappraisal",  duration:"15 min", approach:"TCC" },
    { day:24, phase:3, practiceKey:"anx-p3-d4",  title:"Higiene do sono",          description:"Implemente 3 práticas de higiene do sono esta noite: sem telas 1h antes, temperatura amena, 5 min de respiração antes de dormir.",            technique:"Sleep hygiene",          duration:"Noite toda", approach:"Comportamental" },
    { day:25, phase:3, practiceKey:"anx-p3-d5",  title:"Rede de suporte",          description:"Identifique 2 pessoas com quem pode compartilhar quando a ansiedade aumentar. Como você pediria apoio? Pratique mentalmente.",                  technique:"Social support",         duration:"20 min", approach:"Interpessoal" },
    { day:26, phase:3, practiceKey:"anx-p3-d6",  title:"Plano de crise pessoal",   description:"Crie um cartão de crise: 3 sinais de alerta + 3 estratégias que funcionam para você + 1 pessoa para contatar.",                               technique:"Safety planning",        duration:"20 min", approach:"DBT" },
    { day:27, phase:3, practiceKey:"anx-p3-d7",  title:"Prática de gratidão direcionada", description:"Liste 3 coisas que conseguiu APESAR da ansiedade esta semana. Reconheça sua resiliência.",                                          technique:"Gratitude + self-efficacy",duration:"10 min", approach:"Psicologia Positiva" },
    { day:28, phase:3, practiceKey:"anx-p3-d8",  title:"Movimento como regulação", description:"30 minutos de qualquer movimento físico consciente — não como punição, mas como regulação do sistema nervoso.",                                technique:"Exercise as regulation", duration:"30 min", approach:"Comportamental" },
    { day:29, phase:3, practiceKey:"anx-p3-d9",  title:"Carta para o eu futuro",   description:"Escreva uma carta para você daqui a 6 meses, descrevendo como sua relação com a ansiedade mudou nesta jornada.",                              technique:"Future self letter",     duration:"20 min", approach:"Narrativa" },
    { day:30, phase:3, practiceKey:"anx-p3-d10", title:"Celebração e integração",  description:"Você completou 30 dias. Revise os 3 maiores aprendizados. Qual prática vai continuar? Como vai honrar esse compromisso com você mesmo?",       technique:"Integração",             duration:"30 min", approach:"Integrativo" },
  ],
};

// ══════════════════════════════════════════════════════════
// JORNADA 2 — AUTODISCIPLINA E FOCO
// ══════════════════════════════════════════════════════════
const disciplineJourney: Journey = {
  id: "discipline-30",
  title: "Construindo Disciplina",
  subtitle: "30 dias de foco e consistência",
  description: "Desenvolva autodisciplina real através de hábitos pequenos, sistemas de responsabilização e a psicologia da motivação.",
  color: "#0F6E56",
  icon: "target",
  targetDimension: "C",
  phases: [
    { number: 1, title: "Estruturar", description: "Criar sistemas de suporte à disciplina", focus: "Design comportamental", approach: "TCC" },
    { number: 2, title: "Fortalecer", description: "Desenvolver o músculo da consistência", focus: "Motivação intrínseca", approach: "ACT" },
    { number: 3, title: "Sustentar", description: "Manter a disciplina sob pressão", focus: "Resiliência e adaptação", approach: "Psicologia Positiva" },
  ],
  days: [
    { day:1,  phase:1, practiceKey:"dis-p1-d1",  title:"Auditoria de tempo",        description:"Registre como gastou seu tempo hoje em blocos de 30 min. Sem julgamento — apenas observação honesta.",                                     technique:"Time audit",             duration:"Todo o dia", approach:"Comportamental" },
    { day:2,  phase:1, practiceKey:"dis-p1-d2",  title:"Uma tarefa mais importante", description:"Identifique a tarefa que, se feita hoje, tornaria o dia um sucesso. Faça ela PRIMEIRO, antes de qualquer outra coisa.",                   technique:"MIT (Most Important Task)",duration:"Variável", approach:"Produtividade" },
    { day:3,  phase:1, practiceKey:"dis-p1-d3",  title:"Ambiente de foco",           description:"Remova 3 distrações físicas do seu espaço de trabalho. Deixe apenas o que a tarefa atual exige.",                                         technique:"Environment design",     duration:"15 min", approach:"Comportamental" },
    { day:4,  phase:1, practiceKey:"dis-p1-d4",  title:"Pomodoro simples",           description:"Trabalhe 25 minutos sem interrupções, depois pause 5 minutos. Repita 4 vezes. Anote quantas vezes se distraiu.",                          technique:"Pomodoro",               duration:"2 horas", approach:"Comportamental" },
    { day:5,  phase:1, practiceKey:"dis-p1-d5",  title:"Ritual de início",           description:"Crie um ritual de 5 minutos que sinaliza 'é hora de focar': mesma música, mesmo café, mesma postura. Pratique hoje.",                    technique:"Habit stacking",         duration:"5 min", approach:"Comportamental" },
    { day:6,  phase:1, practiceKey:"dis-p1-d6",  title:"Obstáculos antecipados",     description:"Liste os 3 maiores obstáculos à sua disciplina. Para cada um: qual é a ação preventiva específica?",                                     technique:"Implementation intentions",duration:"20 min", approach:"TCC" },
    { day:7,  phase:1, practiceKey:"dis-p1-d7",  title:"Sistema de recompensas",     description:"Defina uma recompensa pequena e imediata para após completar sua tarefa mais importante. Qual recompensa faz sentido para você?",          technique:"Behavioral reinforcement",duration:"10 min", approach:"Comportamental" },
    { day:8,  phase:1, practiceKey:"dis-p1-d8",  title:"Plano semanal",              description:"Planeje a semana com no máximo 3 prioridades por dia. Use blocos de tempo específicos, não listas abertas.",                              technique:"Time blocking",          duration:"30 min", approach:"Produtividade" },
    { day:9,  phase:1, practiceKey:"dis-p1-d9",  title:"Gestão de energia",          description:"Observe em quais horários sua energia e foco são maiores. Planeje suas tarefas mais difíceis para esses momentos.",                        technique:"Energy management",      duration:"Todo o dia", approach:"Comportamental" },
    { day:10, phase:1, practiceKey:"dis-p1-d10", title:"Revisão da semana",          description:"O que funcionou? O que não funcionou? Qual sistema quer manter na próxima fase? Seja específico.",                                        technique:"Weekly review",          duration:"30 min", approach:"TCC" },
    { day:11, phase:2, practiceKey:"dis-p2-d1",  title:"Valores por trás das metas", description:"Para cada meta importante, pergunte 'por quê?' cinco vezes até chegar ao valor central. Isso é motivação real.",                         technique:"5 Whys + Values",        duration:"20 min", approach:"ACT" },
    { day:12, phase:2, practiceKey:"dis-p2-d2",  title:"Fluxo intencional",          description:"Identifique uma atividade onde você entra em estado de fluxo. Como pode criar mais condições para isso acontecer hoje?",                  technique:"Flow state",             duration:"Variável", approach:"Psicologia Positiva" },
    { day:13, phase:2, practiceKey:"dis-p2-d3",  title:"Autodialogo construtivo",    description:"Substitua 'tenho que...' por 'escolho...' em todas as suas tarefas hoje. Observe como muda a sensação.",                                 technique:"Language reframe",       duration:"Todo o dia", approach:"ACT" },
    { day:14, phase:2, practiceKey:"dis-p2-d4",  title:"Exposição à desconforto",    description:"Faça uma tarefa difícil que você tem evitado. Fique com o desconforto por 15 minutos sem ceder ao impulso de parar.",                    technique:"Distress tolerance",     duration:"15+ min", approach:"DBT" },
    { day:15, phase:2, practiceKey:"dis-p2-d5",  title:"Celebração pequena",         description:"Celebre uma conquista recente, por menor que seja. Diga em voz alta: 'Fiz isso e isso importa.' Internalizar o sucesso é uma habilidade.", technique:"Self-acknowledgment",    duration:"5 min", approach:"Psicologia Positiva" },
    { day:16, phase:2, practiceKey:"dis-p2-d6",  title:"Identidade disciplinada",    description:"Escreva 3 frases sobre quem você está se tornando — não o que quer alcançar, mas quem está se tornando. 'Sou alguém que...'",            technique:"Identity-based habits",  duration:"15 min", approach:"Narrativa" },
    { day:17, phase:2, practiceKey:"dis-p2-d7",  title:"Accountability parceiro",    description:"Compartilhe sua meta de hoje com alguém e informe o resultado ao final do dia. A responsabilização social amplifica consistência.",        technique:"Social accountability",  duration:"2 min × 2", approach:"Comportamental" },
    { day:18, phase:2, practiceKey:"dis-p2-d8",  title:"Descanso estratégico",       description:"Programe um descanso REAL de 30 minutos — sem culpa, sem produtividade. Descanso intencional aumenta disciplina sustentável.",             technique:"Strategic rest",         duration:"30 min", approach:"Comportamental" },
    { day:19, phase:2, practiceKey:"dis-p2-d9",  title:"Progresso visível",          description:"Crie um rastreador visual da sua jornada — pode ser simples como marcar um X em um calendário. Veja seus dias de consistência.",           technique:"Habit tracking",         duration:"10 min", approach:"Comportamental" },
    { day:20, phase:2, practiceKey:"dis-p2-d10", title:"Revisão da fase 2",          description:"Como sua motivação mudou? O que descobriu sobre seus valores e sobre o tipo de pessoa que está se tornando?",                               technique:"Revisão integrativa",    duration:"20 min", approach:"ACT" },
    { day:21, phase:3, practiceKey:"dis-p3-d1",  title:"Surf do impulso",            description:"Quando sentir vontade de procrastinar, não ceda nem lute — observe o impulso por 90 segundos. Ele passa.",                                technique:"Urge surfing",           duration:"90 seg", approach:"DBT" },
    { day:22, phase:3, practiceKey:"dis-p3-d2",  title:"Recuperação rápida",         description:"Quando 'quebrar' a disciplina, o objetivo é minimizar o intervalo entre a falha e o retorno. Volte em 5 minutos, não amanhã.",            technique:"Recovery protocol",      duration:"5 min", approach:"Comportamental" },
    { day:23, phase:3, practiceKey:"dis-p3-d3",  title:"Gestão de energia emocional",description:"Identifique quais emoções drenam mais sua energia e disciplina. Qual é a estratégia específica para cada uma?",                           technique:"Emotion regulation",     duration:"20 min", approach:"DBT" },
    { day:24, phase:3, practiceKey:"dis-p3-d4",  title:"Revisão de sistema",         description:"Seu sistema de produtividade ainda serve para você? O que mudou? Adapte — sistemas rígidos quebram, sistemas flexíveis duram.",            technique:"System review",          duration:"30 min", approach:"Adaptativo" },
    { day:25, phase:3, practiceKey:"dis-p3-d5",  title:"Forças de caráter",          description:"Identifique 2 forças de caráter suas (VIA Character Strengths). Como pode usar essas forças para sustentar sua disciplina?",              technique:"Character strengths",    duration:"20 min", approach:"Psicologia Positiva" },
    { day:26, phase:3, practiceKey:"dis-p3-d6",  title:"Intenção de implementação",  description:"Para a próxima semana, defina: 'Quando [situação], eu vou [ação específica], em [local/horário].' Pesquisa mostra que isso triplica adesão.",technique:"If-then planning",      duration:"15 min", approach:"TCC" },
    { day:27, phase:3, practiceKey:"dis-p3-d7",  title:"Sustentabilidade",           description:"Qual é o ritmo de trabalho que você consegue manter por meses sem se esgotar? Projete um sistema sustentável, não máximo.",               technique:"Sustainability design",  duration:"20 min", approach:"Comportamental" },
    { day:28, phase:3, practiceKey:"dis-p3-d8",  title:"Gratidão pela consistência", description:"Liste 5 coisas que se tornaram possíveis graças à sua consistência nesta jornada. Reconheça o impacto real no sua vida.",                  technique:"Gratitude",              duration:"10 min", approach:"Psicologia Positiva" },
    { day:29, phase:3, practiceKey:"dis-p3-d9",  title:"Sistema para o próximo mês", description:"Desenhe seu sistema de disciplina para os próximos 30 dias. O que mantém, o que adapta, o que descarta?",                                 technique:"System design",          duration:"30 min", approach:"Comportamental" },
    { day:30, phase:3, practiceKey:"dis-p3-d10", title:"Celebração dos 30 dias",     description:"Você completou 30 dias. Celebre intencionalmente — não apenas siga em frente. Reconheça quem você se tornou neste processo.",              technique:"Integração",             duration:"30 min", approach:"Integrativo" },
  ],
};

// ══════════════════════════════════════════════════════════
// JORNADA 3 — AUTOESTIMA E AUTOCRÍTICA
// ══════════════════════════════════════════════════════════
const selfEsteemJourney: Journey = {
  id: "selfesteem-30",
  title: "Cultivando Autoestima",
  subtitle: "30 dias de autocompaixão e presença",
  description: "Transforme a autocrítica em orientação construtiva e construa uma autoestima estável baseada em valores, não em desempenho.",
  color: "#C4622D",
  icon: "heart",
  targetDimension: "N",
  phases: [
    { number: 1, title: "Reconhecer", description: "Identificar padrões de autocrítica", focus: "Consciência dos padrões", approach: "TCC" },
    { number: 2, title: "Transformar", description: "Desenvolver voz interior compassiva", focus: "Autocompaixão", approach: "CFT" },
    { number: 3, title: "Incorporar", description: "Viver a partir de um eu mais sólido", focus: "Identidade e valores", approach: "ACT" },
  ],
  days: [
    { day:1,  phase:1, practiceKey:"se-p1-d1",   title:"Voz do crítico interno",    description:"Ouça seu crítico interno por um dia. Anote 3 críticas que fez a si mesmo. Que tom usou? Você usaria esse tom com um amigo?",                technique:"Inner critic awareness", duration:"Todo o dia", approach:"CFT" },
    { day:2,  phase:1, practiceKey:"se-p1-d2",   title:"Origem da autocrítica",     description:"De onde vem seu crítico interno? Que pessoa ou experiência moldou essa voz? Escreva sobre isso com curiosidade, não com julgamento.",        technique:"Schema exploration",     duration:"20 min", approach:"Esquema" },
    { day:3,  phase:1, practiceKey:"se-p1-d3",   title:"Padrão de evitação",        description:"Quais situações você evita por medo de se sentir inadequado? Liste 3 e o pensamento por trás de cada evitação.",                            technique:"Avoidance mapping",      duration:"20 min", approach:"TCC" },
    { day:4,  phase:1, practiceKey:"se-p1-d4",   title:"Qualidades ignoradas",      description:"Peça a 2 pessoas próximas que listem 3 qualidades que veem em você. Receba sem minimizar ou negar. Como você filtra o positivo?",            technique:"Positive data log",      duration:"Variável", approach:"TCC" },
    { day:5,  phase:1, practiceKey:"se-p1-d5",   title:"Padrão de comparação",      description:"Observe quando você se compara com outros hoje. Com quem compara? Em quê? Para cima ou para baixo? O que isso revela?",                    technique:"Comparison awareness",   duration:"Todo o dia", approach:"TCC" },
    { day:6,  phase:1, practiceKey:"se-p1-d6",   title:"Vergonha vs. culpa",        description:"Vergonha: 'Sou ruim'. Culpa: 'Fiz algo ruim'. Identifique um momento recente de vergonha e reescreva como culpa corrigível.",                technique:"Shame resilience",       duration:"20 min", approach:"CFT" },
    { day:7,  phase:1, practiceKey:"se-p1-d7",   title:"Revisão composta",          description:"O que aprendeu sobre seus padrões de autocrítica? Qual é a crítica mais frequente e mais dolorosa?",                                        technique:"Pattern review",         duration:"20 min", approach:"TCC" },
    { day:8,  phase:1, practiceKey:"se-p1-d8",   title:"Custo da autocrítica",      description:"Como a autocrítica te impediu? Liste 3 situações onde ela limitou sua vida. Reconhecer o custo motiva a mudança.",                          technique:"Functional analysis",    duration:"20 min", approach:"ACT" },
    { day:9,  phase:1, practiceKey:"se-p1-d9",   title:"Eu nos melhores momentos",  description:"Descreva 3 momentos em que você se sentiu genuinamente bem consigo mesmo. O que estava presente nesses momentos?",                          technique:"Best-self reflection",   duration:"20 min", approach:"Psicologia Positiva" },
    { day:10, phase:1, practiceKey:"se-p1-d10",  title:"Preparação para fase 2",    description:"Escreva uma carta de intenção para a próxima fase: o que você quer cultivar? Que tipo de relação quer ter com você mesmo?",                 technique:"Intention setting",      duration:"20 min", approach:"CFT" },
    { day:11, phase:2, practiceKey:"se-p2-d1",   title:"Voz compassiva",            description:"Quando o crítico falar, responda com a voz de um amigo sábio. Escreva o diálogo: crítico vs. amigo compassivo.",                            technique:"Compassionate mind",     duration:"15 min", approach:"CFT" },
    { day:12, phase:2, practiceKey:"se-p2-d2",   title:"Mão no coração",            description:"Coloque a mão no coração. Diga: 'Este é um momento de sofrimento. Sofrimento faz parte da vida. Que eu seja gentil comigo agora.'",          technique:"Self-compassion break",  duration:"10 min", approach:"CFT" },
    { day:13, phase:2, practiceKey:"se-p2-d3",   title:"Humanidade compartilhada",  description:"Pense em algo que te envergonha. Escreva: quantas outras pessoas no mundo lutam com isso? Você não está sozinho.",                          technique:"Common humanity",        duration:"15 min", approach:"CFT" },
    { day:14, phase:2, practiceKey:"se-p2-d4",   title:"Carta para a criança",      description:"Escreva uma carta para você aos 10 anos, com a gentileza que essa criança merecia e que talvez não tenha recebido.",                        technique:"Inner child work",       duration:"20 min", approach:"Esquema" },
    { day:15, phase:2, practiceKey:"se-p2-d5",   title:"Perfeccionismo adaptativo", description:"Diferencie padrões altos saudáveis de perfeccionismo rígido. Onde na sua vida o perfeccionismo está custando mais do que dando?",           technique:"Perfectionism work",     duration:"20 min", approach:"TCC" },
    { day:16, phase:2, practiceKey:"se-p2-d6",   title:"Afirmações baseadas em ações", description:"Crie 3 afirmações baseadas em evidências reais (não vagas): 'Sou alguém que [ação concreta que faço].' Muito mais eficaz.",             technique:"Evidence-based affirmations",duration:"15 min", approach:"TCC" },
    { day:17, phase:2, practiceKey:"se-p2-d7",   title:"Autocompaixão em falhas",   description:"Relembre um erro recente. Aplique as 3 componentes: mindfulness ('isso dói'), humanidade ('todos falham'), gentileza ('posso ser gentil').", technique:"Self-compassion 3 components",duration:"20 min", approach:"CFT" },
    { day:18, phase:2, practiceKey:"se-p2-d8",   title:"Reconhecer esforço",        description:"No fim do dia, reconheça 3 esforços — não resultados, mas esforços. 'Tentei, mesmo sendo difícil.' O esforço merece reconhecimento.",       technique:"Effort recognition",     duration:"5 min", approach:"Psicologia Positiva" },
    { day:19, phase:2, practiceKey:"se-p2-d9",   title:"Limites como autocuidado",  description:"Identifique uma situação onde ceder prejudica você. Como estabelecer um limite gentil mas firme? Pratique a frase.",                        technique:"Assertiveness",          duration:"15 min", approach:"TCC" },
    { day:20, phase:2, practiceKey:"se-p2-d10",  title:"Revisão da fase 2",         description:"Como mudou sua voz interior nestas 2 semanas? Qual prática de autocompaixão quer carregar para sempre?",                                    technique:"Revisão integrativa",    duration:"20 min", approach:"CFT" },
    { day:21, phase:3, practiceKey:"se-p3-d1",   title:"Valores como âncora",       description:"Liste seus 5 valores mais importantes. Sua autoestima atual está baseada em valores ou em desempenho? Como mudar essa base?",                technique:"Values-based self-esteem",duration:"20 min", approach:"ACT" },
    { day:22, phase:3, practiceKey:"se-p3-d2",   title:"Ação apesar do medo",       description:"Faça uma ação alinhada com seus valores que você evitaria por insegurança. Pequena, mas real.",                                             technique:"Values-based action",    duration:"Variável", approach:"ACT" },
    { day:23, phase:3, practiceKey:"se-p3-d3",   title:"Narrativa de crescimento",  description:"Reescreva uma história de 'fracasso' como uma história de aprendizado. O mesmo evento, narrativa diferente.",                              technique:"Growth narrative",       duration:"20 min", approach:"Narrativa" },
    { day:24, phase:3, practiceKey:"se-p3-d4",   title:"Presença plena em ação",    description:"Faça uma atividade que você gosta completamente presente — sem julgamento do próprio desempenho. Apenas ser.",                              technique:"Mindful engagement",     duration:"30 min", approach:"Mindfulness" },
    { day:25, phase:3, practiceKey:"se-p3-d5",   title:"Comunidade e pertencimento", description:"Identifique onde você se sente genuinamente aceito. Como pode cultivar mais esse sentimento de pertencimento?",                            technique:"Connection",             duration:"Variável", approach:"Interpessoal" },
    { day:26, phase:3, practiceKey:"se-p3-d6",   title:"Cuidado com o corpo",       description:"Faça algo gentil com seu corpo hoje — não como punição ou obrigação, mas como ato de cuidado. Movimento, toque, descanso.",                technique:"Body kindness",          duration:"Variável", approach:"CFT" },
    { day:27, phase:3, practiceKey:"se-p3-d7",   title:"Contribuição como sentido", description:"Identifique como você contribui com a vida de outros. Autoestima sólida vem da consciência do próprio impacto positivo.",                  technique:"Contribution awareness", duration:"15 min", approach:"Psicologia Positiva" },
    { day:28, phase:3, practiceKey:"se-p3-d8",   title:"Resiliência documentada",   description:"Liste 5 momentos difíceis pelos quais passou e superou. Você tem mais resiliência do que sua autocrítica admite.",                          technique:"Resilience mapping",     duration:"20 min", approach:"Psicologia Positiva" },
    { day:29, phase:3, practiceKey:"se-p3-d9",   title:"Manutenção da autoestima",  description:"Quais práticas desta jornada quer incorporar permanentemente? Crie um ritual semanal de autocompaixão.",                                   technique:"Maintenance planning",   duration:"20 min", approach:"CFT" },
    { day:30, phase:3, practiceKey:"se-p3-d10",  title:"Carta para você mesmo",     description:"Escreva uma carta de você do dia 30 para você do dia 1. O que aprendeu? Quem você se tornou? O que quer dizer a essa pessoa?",             technique:"Integração",             duration:"30 min", approach:"Integrativo" },
  ],
};

// ══════════════════════════════════════════════════════════
// JORNADA 4 — RELACIONAMENTOS E CONEXÃO
// ══════════════════════════════════════════════════════════
const relationshipsJourney: Journey = {
  id: "relationships-30",
  title: "Conexões Verdadeiras",
  subtitle: "30 dias de relacionamentos mais profundos",
  description: "Desenvolva habilidades de comunicação, vínculo emocional e presença nas relações mais importantes da sua vida.",
  color: "#854F0B",
  icon: "users",
  targetDimension: "A",
  phases: [
    { number: 1, title: "Mapear", description: "Entender seus padrões relacionais", focus: "Apego e padrões", approach: "Psicodinâmica" },
    { number: 2, title: "Praticar", description: "Habilidades de conexão", focus: "Comunicação e empatia", approach: "TIP" },
    { number: 3, title: "Aprofundar", description: "Cultivar vínculos genuínos", focus: "Vulnerabilidade e intimidade", approach: "Humanista" },
  ],
  days: [
    { day:1,  phase:1, practiceKey:"rel-p1-d1",  title:"Mapa relacional",           description:"Desenhe seus 7 relacionamentos mais importantes. Para cada um: como você se sente nessa relação? O que ela nutre em você?",                technique:"Relational mapping",     duration:"20 min", approach:"Interpessoal" },
    { day:2,  phase:1, practiceKey:"rel-p1-d2",  title:"Padrão de apego",           description:"Como você tipicamente age quando alguém se aproxima? Quando se afasta? Você tende à evitação, à ansiedade ou ao apego seguro?",             technique:"Attachment patterns",    duration:"20 min", approach:"Psicodinâmica" },
    { day:3,  phase:1, practiceKey:"rel-p1-d3",  title:"Escuta ativa",              description:"Em uma conversa hoje, pratique escuta ativa total: sem pensar na resposta, sem checar o celular. Apenas ouça e reflita de volta.",           technique:"Active listening",       duration:"Variável", approach:"Humanista" },
    { day:4,  phase:1, practiceKey:"rel-p1-d4",  title:"Necessidades não ditas",    description:"Identifique uma necessidade que não comunica nas relações. Por que não comunica? O que teme que aconteça se comunicar?",                   technique:"Needs awareness",        duration:"20 min", approach:"Esquema" },
    { day:5,  phase:1, practiceKey:"rel-p1-d5",  title:"Gratidão relacional",       description:"Expresse gratidão genuína a uma pessoa próxima — não 'obrigado' automático, mas algo específico que aprecia nela.",                        technique:"Gratitude expression",   duration:"5 min", approach:"Psicologia Positiva" },
    { day:6,  phase:1, practiceKey:"rel-p1-d6",  title:"Conflito e reparo",         description:"Pense em um conflito recente. O que sua parte nele foi? O que poderia ter feito diferente? Conflito e reparo fortalecem vínculos.",          technique:"Conflict repair",        duration:"20 min", approach:"TIP" },
    { day:7,  phase:1, practiceKey:"rel-p1-d7",  title:"Conexão vs. performance",   description:"Em suas relações, você busca conexão genuína ou aprovação/performance? Onde a diferença é mais clara?",                                   technique:"Authenticity check",     duration:"15 min", approach:"Humanista" },
    { day:8,  phase:1, practiceKey:"rel-p1-d8",  title:"Empatia radical",           description:"Escolha alguém com quem tem atrito. Passe 10 minutos imaginando genuinamente o mundo pela perspectiva dessa pessoa.",                      technique:"Perspective taking",     duration:"10 min", approach:"CFT" },
    { day:9,  phase:1, practiceKey:"rel-p1-d9",  title:"Presença em relação",       description:"Seja completamente presente em uma interação hoje — sem multitarefa, sem celular. Apenas essa pessoa.",                                    technique:"Mindful presence",       duration:"Variável", approach:"Mindfulness" },
    { day:10, phase:1, practiceKey:"rel-p1-d10", title:"Revisão de padrões",        description:"Que padrão relacional quer mudar mais urgentemente? Qual é o custo de não mudar?",                                                         technique:"Pattern review",         duration:"20 min", approach:"TCC" },
    { day:11, phase:2, practiceKey:"rel-p2-d1",  title:"Comunicação assertiva",     description:"Use o formato: 'Quando [situação], sinto [emoção], porque preciso de [necessidade]. Você poderia [pedido específico]?'",                    technique:"Nonviolent Communication",duration:"15 min", approach:"TIP" },
    { day:12, phase:2, practiceKey:"rel-p2-d2",  title:"Reparação de vínculo",      description:"Identifique uma relação que precisa de reparo. Dê um pequeno passo hoje — uma mensagem, uma ligação, um pedido de desculpas.",             technique:"Relationship repair",    duration:"Variável", approach:"TIP" },
    { day:13, phase:2, practiceKey:"rel-p2-d3",  title:"Receber cuidado",           description:"Permita que alguém cuide de você hoje sem minimizar ou recusar. Receber cuidado é também uma habilidade relacional.",                     technique:"Receiving care",         duration:"Variável", approach:"Esquema" },
    { day:14, phase:2, practiceKey:"rel-p2-d4",  title:"Limites com amor",          description:"Estabeleça um limite em uma relação de forma gentil mas clara. Limites não afastam — eles permitem conexão mais honesta.",                 technique:"Boundaries",             duration:"Variável", approach:"TCC" },
    { day:15, phase:2, practiceKey:"rel-p2-d5",  title:"Amor em ação",              description:"Faça algo concreto para demonstrar amor/cuidado por alguém importante — no idioma de amor dessa pessoa, não no seu.",                      technique:"Love languages",         duration:"Variável", approach:"Interpessoal" },
    { day:16, phase:2, practiceKey:"rel-p2-d6",  title:"Curiosidade pelo outro",    description:"Em uma conversa, faça apenas perguntas (sem dar opiniões) por 15 minutos. Genuína curiosidade transforma relações.",                       technique:"Curious inquiry",        duration:"15 min", approach:"Humanista" },
    { day:17, phase:2, practiceKey:"rel-p2-d7",  title:"Perdão (para você)",        description:"O perdão não é para o outro — é para você. Identifique algo para perdoar e escreva sobre como carregar essa mágoa te custa.",              technique:"Forgiveness work",       duration:"20 min", approach:"Psicologia Positiva" },
    { day:18, phase:2, practiceKey:"rel-p2-d8",  title:"Vulnerabilidade pequena",   description:"Compartilhe algo verdadeiro que normalmente não compartilharia com uma pessoa de confiança. Vulnerabilidade cria intimidade.",             technique:"Vulnerability",          duration:"Variável", approach:"Humanista" },
    { day:19, phase:2, practiceKey:"rel-p2-d9",  title:"Rituals relacionais",       description:"Crie um ritual com alguém importante — pode ser simples: café semanal, caminhada, mensagem de bom dia. Rituais constroem vínculo.",        technique:"Relationship rituals",   duration:"Variável", approach:"Interpessoal" },
    { day:20, phase:2, practiceKey:"rel-p2-d10", title:"Revisão da fase 2",         description:"Em que relação sentiu mais crescimento nestas 2 semanas? O que mudou na sua forma de se conectar?",                                        technique:"Revisão integrativa",    duration:"20 min", approach:"Interpessoal" },
    { day:21, phase:3, practiceKey:"rel-p3-d1",  title:"Intimidade autêntica",      description:"Com uma pessoa próxima, compartilhe algo sobre você que raramente fala. Pergunte algo que genuinamente quer saber sobre ela.",              technique:"Intimacy building",      duration:"Variável", approach:"Humanista" },
    { day:22, phase:3, practiceKey:"rel-p3-d2",  title:"Solitude saudável",         description:"Passe 30 minutos de forma completamente solitária e intencional. Conexão saudável precisa de solitude saudável.",                          technique:"Healthy solitude",       duration:"30 min", approach:"Humanista" },
    { day:23, phase:3, practiceKey:"rel-p3-d3",  title:"Sua contribuição às relações",description:"Como você enriquece a vida das pessoas próximas? Que tipo de presença você é na vida delas?",                                           technique:"Contribution mapping",   duration:"15 min", approach:"Psicologia Positiva" },
    { day:24, phase:3, practiceKey:"rel-p3-d4",  title:"Comunidade mais ampla",     description:"Além dos íntimos, onde você pertence? Grupo, causa, comunidade. Como pode cultivar mais esse senso de pertencimento coletivo?",            technique:"Community connection",   duration:"Variável", approach:"Interpessoal" },
    { day:25, phase:3, practiceKey:"rel-p3-d5",  title:"Modelo relacional futuro",  description:"Descreva o tipo de relacionamentos que quer ter em 2 anos. O que precisa cultivar em você para que isso seja possível?",                   technique:"Relational vision",      duration:"20 min", approach:"ACT" },
    { day:26, phase:3, practiceKey:"rel-p3-d6",  title:"Agradecimento profundo",    description:"Escreva uma carta de gratidão detalhada para alguém que impactou sua vida. Se possível, leia para essa pessoa.",                          technique:"Gratitude letter",       duration:"30 min", approach:"Psicologia Positiva" },
    { day:27, phase:3, practiceKey:"rel-p3-d7",  title:"Conflito como intimidade",  description:"Conflito saudável aprofunda relações. Identifique um desentendimento que pode ser oportunidade de maior honestidade.",                    technique:"Productive conflict",    duration:"Variável", approach:"TIP" },
    { day:28, phase:3, practiceKey:"rel-p3-d8",  title:"Presença como presente",    description:"O presente mais valioso que você pode dar a alguém é sua atenção plena. Pratique isso em uma interação importante hoje.",                  technique:"Presence gift",          duration:"Variável", approach:"Mindfulness" },
    { day:29, phase:3, practiceKey:"rel-p3-d9",  title:"Plano relacional",          description:"Identifique 3 intenções relacionais para o próximo mês. Específicas, acionáveis, baseadas no que aprendeu.",                              technique:"Relational intentions",  duration:"20 min", approach:"Interpessoal" },
    { day:30, phase:3, practiceKey:"rel-p3-d10", title:"Celebração das conexões",   description:"Celebre as relações que enriqueceram esta jornada. Talvez compartilhe com alguém o que esta jornada significou para você.",               technique:"Integração",             duration:"30 min", approach:"Integrativo" },
  ],
};

// ══════════════════════════════════════════════════════════
// JORNADA 5 — PROPÓSITO E VALORES DE VIDA
// ══════════════════════════════════════════════════════════
const purposeJourney: Journey = {
  id: "purpose-30",
  title: "Encontrando Propósito",
  subtitle: "30 dias de valores e sentido de vida",
  description: "Descubra o que verdadeiramente importa para você e alinhe suas ações cotidianas com uma direção de vida significativa.",
  color: "#1B6B5A",
  icon: "compass",
  targetDimension: "O",
  phases: [
    { number: 1, title: "Explorar", description: "Descobrir o que verdadeiramente importa", focus: "Clarificação de valores", approach: "ACT" },
    { number: 2, title: "Alinhar", description: "Aproximar vida e valores", focus: "Ação comprometida", approach: "ACT" },
    { number: 3, title: "Encarnar", description: "Viver a partir do propósito", focus: "Integração", approach: "Humanista" },
  ],
  days: [
    { day:1,  phase:1, practiceKey:"pur-p1-d1",  title:"Valores centrais",          description:"Dos 10 valores abaixo, escolha 3: liberdade, família, crescimento, contribuição, autenticidade, criatividade, saúde, aventura, justiça, amor. Por quê esses 3?", technique:"Values clarification", duration:"20 min", approach:"ACT" },
    { day:2,  phase:1, practiceKey:"pur-p1-d2",  title:"Epitáfio intencional",      description:"Se você morresse hoje, o que gostaria que estivesse escrito sobre quem você foi? Que vida quer ter vivido?",                                technique:"Obituary exercise",     duration:"20 min", approach:"ACT" },
    { day:3,  phase:1, practiceKey:"pur-p1-d3",  title:"Pico de flow",              description:"Quando você perde a noção do tempo? Em que atividades está completamente absorto? Esses momentos apontam para vocação e propósito.",        technique:"Flow mapping",          duration:"15 min", approach:"Psicologia Positiva" },
    { day:4,  phase:1, practiceKey:"pur-p1-d4",  title:"Vida em 10 anos",           description:"Escreva uma carta vinda do seu eu de 10 anos no futuro, descrevendo como você está vivendo. Não o ideal vago — o concreto que quer.",       technique:"Future self letter",    duration:"25 min", approach:"ACT" },
    { day:5,  phase:1, practiceKey:"pur-p1-d5",  title:"O que me energiza",         description:"Liste 10 atividades, pessoas ou projetos que te energizam vs. 10 que drenam. O que os energizantes têm em comum?",                        technique:"Energy audit",          duration:"20 min", approach:"Psicologia Positiva" },
    { day:6,  phase:1, practiceKey:"pur-p1-d6",  title:"Legado",                    description:"Qual contribuição quer deixar no mundo — não precisa ser grandiosa. Para as pessoas próximas, para uma causa, para um campo de trabalho.",   technique:"Legacy reflection",     duration:"20 min", approach:"Humanista" },
    { day:7,  phase:1, practiceKey:"pur-p1-d7",  title:"Valores em conflito",       description:"Identifique 2 valores que às vezes entram em conflito na sua vida (ex: família vs. crescimento profissional). Como navegar esse conflito?",  technique:"Values conflict",       duration:"20 min", approach:"ACT" },
    { day:8,  phase:1, practiceKey:"pur-p1-d8",  title:"Ikigai",                    description:"Explore o conceito japonês de ikigai: o que você ama + o que você faz bem + o que o mundo precisa + pelo que seria pago. Onde convergem?",   technique:"Ikigai",                duration:"30 min", approach:"Integrativo" },
    { day:9,  phase:1, practiceKey:"pur-p1-d9",  title:"Obstáculos ao propósito",   description:"O que impede você de viver mais alinhado ao seu propósito hoje? Quais são os obstáculos reais vs. os percebidos?",                         technique:"Obstacle mapping",      duration:"20 min", approach:"TCC" },
    { day:10, phase:1, practiceKey:"pur-p1-d10", title:"Manifesto de valores",      description:"Escreva um manifesto pessoal de 5-7 frases: quem você é, o que valoriza, como quer viver. Este é seu norte.",                              technique:"Personal manifesto",    duration:"30 min", approach:"Narrativa" },
    { day:11, phase:2, practiceKey:"pur-p2-d1",  title:"Vida atual vs. valores",    description:"Compare sua semana típica com seus valores centrais. Em quais áreas há maior alinhamento? Em quais há maior lacuna?",                       technique:"Values gap analysis",   duration:"25 min", approach:"ACT" },
    { day:12, phase:2, practiceKey:"pur-p2-d2",  title:"Uma ação de valor",         description:"Identifique uma ação pequena que pode fazer HOJE que está alinhada com seu valor mais importante. Faça agora.",                             technique:"Values-based action",   duration:"Variável", approach:"ACT" },
    { day:13, phase:2, practiceKey:"pur-p2-d3",  title:"Simplificação",             description:"O que você poderia eliminar da sua vida que não está alinhado com seus valores? Comece com algo pequeno.",                                  technique:"Essentialism",          duration:"20 min", approach:"ACT" },
    { day:14, phase:2, practiceKey:"pur-p2-d4",  title:"Projeto com sentido",       description:"Identifique ou inicie um projeto que encarna seus valores. Não precisa ser grande — pode ser algo que toma 1 hora por semana.",             technique:"Meaningful project",    duration:"Variável", approach:"Psicologia Positiva" },
    { day:15, phase:2, practiceKey:"pur-p2-d5",  title:"Contribuição diária",       description:"Como pode contribuir com algo maior que você mesmo hoje? Uma ação pequena mas intencional de serviço ou contribuição.",                     technique:"Service",               duration:"Variável", approach:"Humanista" },
    { day:16, phase:2, practiceKey:"pur-p2-d6",  title:"Atenção plena no trabalho", description:"Por uma hora, trabalhe completamente presente, conectado ao sentido do que faz. Por que isso importa? Para quem?",                          technique:"Meaningful work",       duration:"1 hora", approach:"Mindfulness" },
    { day:17, phase:2, practiceKey:"pur-p2-d7",  title:"Relações de propósito",     description:"Quais pessoas em sua vida mais apoiam quem você quer se tornar? Como cultivar mais essas relações?",                                       technique:"Purposeful relationships",duration:"15 min", approach:"Interpessoal" },
    { day:18, phase:2, practiceKey:"pur-p2-d8",  title:"Medo do propósito",         description:"O que você teme que aconteça se seguir seu propósito de verdade? Esse medo é proteção ou sabotagem?",                                      technique:"Fear exploration",      duration:"20 min", approach:"ACT" },
    { day:19, phase:2, practiceKey:"pur-p2-d9",  title:"Rotina com sentido",        description:"Redesenhe sua rotina matinal para incluir 10 minutos de conexão com seu propósito: meditação, journaling, leitura alinhada.",              technique:"Purposeful routine",    duration:"10 min", approach:"Comportamental" },
    { day:20, phase:2, practiceKey:"pur-p2-d10", title:"Revisão da fase 2",         description:"Como sua vida mudou nas últimas 2 semanas? O que ficou mais alinhado com seus valores? O que ainda resiste?",                              technique:"Revisão integrativa",   duration:"20 min", approach:"ACT" },
    { day:21, phase:3, practiceKey:"pur-p3-d1",  title:"Aceitação da incerteza",    description:"Propósito não é certeza — é direção. Pratique agir na direção dos seus valores mesmo sem saber o destino exato.",                          technique:"Uncertainty tolerance", duration:"Variável", approach:"ACT" },
    { day:22, phase:3, practiceKey:"pur-p3-d2",  title:"Mindset de crescimento",    description:"Reescreva 3 crenças fixas sobre si mesmo ('não sou...' / 'nunca consigo...') como processos em desenvolvimento.",                         technique:"Growth mindset",        duration:"20 min", approach:"TCC" },
    { day:23, phase:3, practiceKey:"pur-p3-d3",  title:"Presente com sentido",      description:"Pratique encontrar sentido nos momentos cotidianos — não apenas nas grandes conquistas. O que há de significativo nesta hora comum?",       technique:"Present meaning",       duration:"Todo o dia", approach:"Mindfulness" },
    { day:24, phase:3, practiceKey:"pur-p3-d4",  title:"Adversidade como mestre",   description:"Identifique um desafio atual. O que ele está te ensinando? Como pode crescer através dele em vez de apenas sobrevivê-lo?",                 technique:"Post-traumatic growth", duration:"20 min", approach:"Psicologia Positiva" },
    { day:25, phase:3, practiceKey:"pur-p3-d5",  title:"Horizonte de 5 anos",       description:"Onde você quer estar em 5 anos em cada área: trabalho, relações, saúde, crescimento, contribuição? Que escolha de hoje apoia isso?",        technique:"Vision planning",       duration:"30 min", approach:"TCC" },
    { day:26, phase:3, practiceKey:"pur-p3-d6",  title:"Mentores e inspirações",    description:"Quem você admira e por quê? O que dessas pessoas você pode cultivar em si mesmo? Mentores revelam seu potencial não desenvolvido.",        technique:"Role model reflection", duration:"20 min", approach:"Psicologia Positiva" },
    { day:27, phase:3, practiceKey:"pur-p3-d7",  title:"Rituais de sentido",        description:"Crie um ritual semanal de reconexão com seus valores: um momento de revisão, gratidão e intenção. Simples mas consistente.",               technique:"Meaning ritual",        duration:"15 min", approach:"Integrativo" },
    { day:28, phase:3, practiceKey:"pur-p3-d8",  title:"Palavras que me guiam",     description:"Escolha 3 palavras que resumem quem você quer ser e como quer viver. Coloque-as onde possa ver. Que guiem suas escolhas.",                  technique:"Guiding words",         duration:"15 min", approach:"ACT" },
    { day:29, phase:3, practiceKey:"pur-p3-d9",  title:"Compromisso de vida",       description:"Escreva um compromisso pessoal de como vai honrar seus valores nos próximos 3 meses. Específico, verificável, autêntico.",                  technique:"Life commitment",       duration:"25 min", approach:"ACT" },
    { day:30, phase:3, practiceKey:"pur-p3-d10", title:"O próximo capítulo",        description:"Esta jornada foi o fim de um capítulo e início de outro. O que começa agora? Que pessoa está emergindo desta experiência?",                 technique:"Integração",            duration:"30 min", approach:"Narrativo" },
  ],
};

// ══════════════════════════════════════════════════════════
// JORNADA 6 — PROCRASTINAÇÃO E MOTIVAÇÃO
// ══════════════════════════════════════════════════════════
const procrastinationJourney: Journey = {
  id: "procrastination-30",
  title: "Além da Procrastinação",
  subtitle: "30 dias de ação e motivação real",
  description: "Entenda as raízes emocionais da procrastinação e desenvolva um sistema personalizado de motivação e ação.",
  color: "#E8A838",
  icon: "play-circle",
  targetDimension: "C",
  phases: [
    { number: 1, title: "Entender", description: "As raízes emocionais da procrastinação", focus: "Autoconhecimento", approach: "TCC" },
    { number: 2, title: "Agir", description: "Sistemas práticos de motivação", focus: "Ação comprometida", approach: "ACT" },
    { number: 3, title: "Sustentar", description: "Motivação de longo prazo", focus: "Identidade e hábitos", approach: "Comportamental" },
  ],
  days: [
    { day:1,  phase:1, practiceKey:"pro-p1-d1",  title:"Diagnóstico da procrastinação", description:"O que você procrastina mais? Lista as 5 tarefas mais adiadas. Para cada uma: qual emoção surge quando pensa em fazê-la?",           technique:"Procrastination audit", duration:"20 min", approach:"TCC" },
    { day:2,  phase:1, practiceKey:"pro-p1-d2",  title:"Medo do fracasso",           description:"A procrastinação frequentemente protege do fracasso — se não tenta, não falha. Em que área esse padrão é mais forte em você?",           technique:"Fear of failure",       duration:"20 min", approach:"TCC" },
    { day:3,  phase:1, practiceKey:"pro-p1-d3",  title:"Perfeccionismo paralisante",  description:"'Só faço quando puder fazer perfeitamente.' Identifique uma tarefa paralisada pelo perfeccionismo. Qual seria o padrão 'bom o suficiente'?",technique:"Good enough",           duration:"15 min", approach:"TCC" },
    { day:4,  phase:1, practiceKey:"pro-p1-d4",  title:"Recompensa imediata vs. futura",description:"Mapeie suas procrastinações: o que a distração oferece de imediato (prazer, alívio) vs. o que a tarefa oferece no futuro?",         technique:"Temporal discounting",  duration:"20 min", approach:"TCC" },
    { day:5,  phase:1, practiceKey:"pro-p1-d5",  title:"2 minutos agora",            description:"Escolha a tarefa mais adiada. Comprometa-se com apenas 2 minutos. Frequentemente, começar é a única barreira real.",                    technique:"2-minute rule",         duration:"2+ min", approach:"Comportamental" },
    { day:6,  phase:1, practiceKey:"pro-p1-d6",  title:"Emoções sob a procrastinação",description:"Quando sente vontade de procrastinar, pause. O que está sentindo naquele momento? Tédio, ansiedade, ressentimento, insegurança?",      technique:"Emotion identification", duration:"Todo o dia", approach:"DBT" },
    { day:7,  phase:1, practiceKey:"pro-p1-d7",  title:"Custo real",                 description:"Calcule o custo real de uma procrastinação específica: tempo perdido, oportunidades perdidas, estresse acumulado, relações afetadas.",    technique:"Cost analysis",         duration:"20 min", approach:"TCC" },
    { day:8,  phase:1, practiceKey:"pro-p1-d8",  title:"Identidade e procrastinação",description:"'Sou uma pessoa que procrastina' é identidade, não fato. Reescreva: 'Estou aprendendo a agir mesmo sentindo resistência.'",            technique:"Identity reframe",      duration:"15 min", approach:"Narrativa" },
    { day:9,  phase:1, practiceKey:"pro-p1-d9",  title:"Tarefa mais temida",         description:"Identifique a tarefa mais temida da sua semana. Quebre em 10 sub-tarefas de 5 minutos cada. Qual a menor possível para fazer agora?",    technique:"Task decomposition",    duration:"20 min", approach:"TCC" },
    { day:10, phase:1, practiceKey:"pro-p1-d10", title:"Revisão da semana",          description:"Que insight sobre as raízes da sua procrastinação foi mais revelador? O que quer explorar na fase de ação?",                            technique:"Revisão integrativa",   duration:"20 min", approach:"TCC" },
    { day:11, phase:2, practiceKey:"pro-p2-d1",  title:"Conexão com valores",        description:"Para a tarefa mais adiada, escreva: por que isso importa para mim? A qual valor central está conectado? Motivação intrínseca é mais durável.",technique:"Values motivation",    duration:"15 min", approach:"ACT" },
    { day:12, phase:2, practiceKey:"pro-p2-d2",  title:"Surf do desconforto",        description:"Quando surgir o impulso de procrastinar, não ceda nem lute — observe o desconforto por 90 segundos. Ele passa.",                       technique:"Urge surfing",          duration:"90 seg", approach:"DBT" },
    { day:13, phase:2, practiceKey:"pro-p2-d3",  title:"Contrato comportamental",    description:"Escreva um contrato consigo: 'Quando [situação específica], vou fazer [ação específica], em [horário/local específico].'",             technique:"Implementation intention",duration:"15 min", approach:"TCC" },
    { day:14, phase:2, practiceKey:"pro-p2-d4",  title:"Bloco de foco profundo",     description:"Reserve 90 minutos sem interrupções para sua tarefa mais importante. Notifique quem precisa. Feche tudo desnecessário. Comece.",        technique:"Deep work",             duration:"90 min", approach:"Comportamental" },
    { day:15, phase:2, practiceKey:"pro-p2-d5",  title:"Recompensa intencional",     description:"Defina uma recompensa específica para após completar uma tarefa importante. Não antes — só depois. E honre o acordo.",                  technique:"Contingency management",duration:"Variável", approach:"Comportamental" },
    { day:16, phase:2, practiceKey:"pro-p2-d6",  title:"Estado físico e ação",       description:"Antes de uma tarefa difícil, mude seu estado físico: 10 polichinelos, água, postura ereta, respiração. O corpo influencia a mente.",    technique:"State change",          duration:"5 min", approach:"Comportamental" },
    { day:17, phase:2, practiceKey:"pro-p2-d7",  title:"Accountability pública",     description:"Anuncie para alguém o que vai fazer hoje até que hora. Responsabilidade social aumenta follow-through em 65%.",                         technique:"Social accountability", duration:"2 min", approach:"Comportamental" },
    { day:18, phase:2, practiceKey:"pro-p2-d8",  title:"Tempo de decisão",           description:"A indecisão é uma forma de procrastinação. Escolha uma decisão pendente e tome-a em 2 minutos. Qualquer decisão é melhor que paralisia.",technique:"Decision making",       duration:"2 min", approach:"TCC" },
    { day:19, phase:2, practiceKey:"pro-p2-d9",  title:"Revisão diária noturna",     description:"Todo fim de dia, liste 3 tarefas de amanhã em ordem de prioridade. Tomar decisões à noite preserva energia matinal para ação.",         technique:"Evening planning",      duration:"5 min", approach:"Produtividade" },
    { day:20, phase:2, practiceKey:"pro-p2-d10", title:"Revisão da fase 2",          description:"Qual estratégia de ação funcionou melhor para você? O que mudou na sua relação com tarefas difíceis?",                                  technique:"Revisão integrativa",   duration:"20 min", approach:"ACT" },
    { day:21, phase:3, practiceKey:"pro-p3-d1",  title:"Sistema de hábitos",         description:"Um hábito é automático — não exige decisão. Que micro-hábito de 2 minutos pode ancorar sua rotina de produtividade?",                  technique:"Habit formation",       duration:"2 min", approach:"Comportamental" },
    { day:22, phase:3, practiceKey:"pro-p3-d2",  title:"Ambiente anti-procrastinação",description:"Redesenhe seu ambiente para tornar a ação mais fácil e a distração mais difícil. O que pode mudar hoje?",                            technique:"Environment design",    duration:"15 min", approach:"Comportamental" },
    { day:23, phase:3, practiceKey:"pro-p3-d3",  title:"Recuperação rápida",         description:"Quando procrastinar (vai acontecer), o objetivo é minimizar o intervalo até o retorno. 'Falhei 5 min' não é 'perdi o dia'.",            technique:"Recovery mindset",      duration:"Variável", approach:"TCC" },
    { day:24, phase:3, practiceKey:"pro-p3-d4",  title:"Progresso visível",          description:"Crie um sistema visual de progresso — calendário, gráfico, lista. Ver o progresso é motivação intrínseca poderosa.",                    technique:"Progress tracking",     duration:"10 min", approach:"Comportamental" },
    { day:25, phase:3, practiceKey:"pro-p3-d5",  title:"Identidade de ação",         description:"Escreva 5 vezes: 'Sou alguém que age mesmo sentindo resistência.' Identidade molda comportamento mais do que motivação momentânea.",    technique:"Identity anchoring",    duration:"5 min", approach:"Narrativa" },
    { day:26, phase:3, practiceKey:"pro-p3-d6",  title:"Projeto de paixão",          description:"Identifique um projeto que você faz sem precisar de motivação — flui naturalmente. Como pode criar mais condições para isso?",           technique:"Passion project",       duration:"Variável", approach:"Psicologia Positiva" },
    { day:27, phase:3, practiceKey:"pro-p3-d7",  title:"Energia e foco por circunstância",description:"Em que circunstâncias você naturalmente age mais? Horário, local, pessoas presentes, estado emocional. Replique essas condições.",technique:"Optimal conditions",   duration:"20 min", approach:"Comportamental" },
    { day:28, phase:3, practiceKey:"pro-p3-d8",  title:"Ação compassiva",            description:"Ser duro consigo mesmo pela procrastinação aumenta a procrastinação. Pratique se motivar com gentileza, não com crítica.",              technique:"Self-compassion + action",duration:"10 min", approach:"CFT" },
    { day:29, phase:3, practiceKey:"pro-p3-d9",  title:"Sistema para o próximo mês", description:"Desenhe seu sistema anti-procrastinação para os próximos 30 dias: rotinas, ambiente, recompensas, accountability.",                    technique:"System design",         duration:"30 min", approach:"Comportamental" },
    { day:30, phase:3, practiceKey:"pro-p3-d10", title:"Da procrastinação à ação",   description:"Você mudou sua relação com a ação. Celebre. Escreva: o que mudou em você? Que versão de você emergiu nesta jornada?",                 technique:"Integração",            duration:"30 min", approach:"Integrativo" },
  ],
};

// ── Exportações ───────────────────────────────────────────
export const JOURNEY_CATALOG: Journey[] = [
  anxietyJourney,
  disciplineJourney,
  selfEsteemJourney,
  relationshipsJourney,
  purposeJourney,
  procrastinationJourney,
];

export function getJourney(id: string): Journey | undefined {
  return JOURNEY_CATALOG.find(j => j.id === id);
}

export function getJourneyDay(journeyId: string, day: number): JourneyDay | undefined {
  const journey = getJourney(journeyId);
  return journey?.days.find(d => d.day === day);
}
