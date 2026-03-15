// artifacts/api-server/src/data/futureApproaches.ts
//
// 8 abordagens do "eu futuro" baseadas nas principais escolas terapêuticas.
// A seleção é automática: perfil Big Five → abordagem mais indicada clinicamente.
// Se não houver Big Five, rotaciona pela contagem de avaliações do usuário.

export type FutureApproach = {
  key: string;
  name: string;
  systemInstruction: string;  // Como instruir o Claude sobre essa abordagem
  synthesisLens: string;      // Como redigir a síntese com essa lente
  intentionFrame: string;     // Como formatar a frase de intenção
  practiceFrame: string;      // Como estruturar as práticas
  anchorQuestion: string;     // Pergunta-âncora exibida ao usuário
};

export const FUTURE_APPROACHES: FutureApproach[] = [
  {
    key: "tcc",
    name: "TCC — Visualização e ensaio mental",
    systemInstruction: `Use a perspectiva da TCC para o eu futuro. O futuro é um destino concreto que pode ser antecipado e ensaiado mentalmente. Contraste consequências de curto versus longo prazo. O eu futuro que colherá benefícios das escolhas saudáveis de hoje é uma motivação real para a mudança.`,
    synthesisLens: `Conecte o perfil atual ao eu futuro descrevendo como cada escolha de hoje constrói concretamente o amanhã desejado.`,
    intentionFrame: `Frase de intenção no formato "Eu escolho [ação concreta] para construir [identidade futura]."`,
    practiceFrame: `Cada prática deve incluir um "ensaio mental": o usuário visualiza, com detalhes concretos, como será quando essa habilidade já for natural nele.`,
    anchorQuestion: "Como seria sua vida concreta daqui a 6 meses se você já fosse essa pessoa?",
  },
  {
    key: "esquema",
    name: "Terapia do Esquema — Adulto Saudável",
    systemInstruction: `Use a perspectiva da Terapia do Esquema. O eu futuro é o "Adulto Saudável" — a parte capaz de nutrir, proteger e estabelecer limites. As práticas fortalecem progressivamente esse modo funcional. Fale diretamente ao Adulto Saudável que está emergindo nessa pessoa.`,
    synthesisLens: `Identifique qual modo disfuncional (protetor desligado, criança vulnerável, crítico interno) está mais ativo hoje, e mostre como as práticas fortalecem o Adulto Saudável como contrapeso.`,
    intentionFrame: `Frase de intenção no formato "Meu Adulto Saudável escolhe [ação] e cuida de [necessidade]."`,
    practiceFrame: `Cada prática deve nomear qual modo ela enfraquece e qual fortalece. Linguagem de cuidado interno, não de exigência.`,
    anchorQuestion: "Que parte de você, quando está no seu melhor, já se parece com quem você quer ser?",
  },
  {
    key: "cft",
    name: "CFT — Eu Compassivo Ideal",
    systemInstruction: `Use a perspectiva da Terapia Focada na Compaixão. O eu futuro é o "eu compassivo ideal" — sábio, forte e caloroso. As práticas cultivam compaixão por si mesmo especialmente diante de erros e autocrítica. O usuário se visualiza no futuro já tendo integrado essa qualidade e imagina o que esse eu diria para ele hoje.`,
    synthesisLens: `Reconheça o sofrimento presente com gentileza antes de apontar o caminho. Toda síntese começa com validação, não com exigência.`,
    intentionFrame: `Frase de intenção no formato "Eu me comprometo a me tratar com a mesma gentileza que ofereceria a [pessoa amada] ao [situação difícil]."`,
    practiceFrame: `Cada prática inclui um momento de auto-compaixão: o que o eu compassivo futuro diria se o usuário falhar hoje?`,
    anchorQuestion: "O que sua versão mais sábia e compassiva diria para você agora sobre esse caminho?",
  },
  {
    key: "narrativa",
    name: "Terapia Narrativa — Re-autoria",
    systemInstruction: `Use a perspectiva da Terapia Narrativa. A identidade é construída pelas histórias que contamos sobre nós mesmos. O eu futuro é o protagonista de uma história alternativa ainda sendo escrita. Identifique "resultados únicos" — momentos em que o usuário já resistiu ao problema — e teça uma nova narrativa que aponte para esse futuro. Use linguagem de "tornar-se", não de "ser".`,
    synthesisLens: `Enquadre a jornada como um arco narrativo: o personagem que o usuário é hoje já carrega as sementes do personagem que está se tornando.`,
    intentionFrame: `Frase de intenção no formato "Estou me tornando alguém que [novo capítulo da história]."`,
    practiceFrame: `Cada prática é um "ato de resistência" à história-problema — um capítulo da narrativa alternativa sendo escrito no presente.`,
    anchorQuestion: "Em quais momentos recentes você já agiu como a pessoa que está se tornando?",
  },
  {
    key: "tfs",
    name: "TFS — Pergunta do Milagre",
    systemInstruction: `Use a perspectiva da Terapia Focada na Solução. Ignore completamente a análise do problema — foque 100% na construção da solução. Aplique a lógica da "pergunta do milagre": como seria a manhã seguinte se o problema já estivesse resolvido? Identifique pequenos fragmentos desse futuro já presentes no presente e proponha ações para ampliá-los. Pequenos passos concretos, não grandes transformações.`,
    synthesisLens: `Não mencione o problema. Descreva diretamente o futuro desejado como se já estivesse parcialmente presente, identificando exceções e momentos de sucesso.`,
    intentionFrame: `Frase de intenção no formato "Já existe em mim [qualidade desejada] — hoje vou amplificar isso em [ação específica]."`,
    practiceFrame: `Cada prática começa pelo menor passo possível. O critério de sucesso é "qual é o menor sinal de que estou na direção certa?".`,
    anchorQuestion: "Se ao acordar amanhã o problema já estivesse resolvido, o que você faria de diferente logo cedo?",
  },
  {
    key: "act",
    name: "ACT — Valores e Ação Comprometida",
    systemInstruction: `Use a perspectiva da ACT. Em vez de um eu futuro fixo, o foco são os valores como direções de vida. O futuro emerge como consequência de viver esses valores agora. Não pergunte "quem você quer ser" mas "o que é verdadeiramente importante para você e que direção você quer tomar". As práticas são ações comprometidas no presente que constroem esse futuro. Diferencie metas (finitas) de valores (direções contínuas).`,
    synthesisLens: `Conecte os adjetivos futuros a valores subjacentes — o que esses adjetivos revelam sobre o que verdadeiramente importa para essa pessoa?`,
    intentionFrame: `Frase de intenção no formato "Na direção de [valor central], hoje escolho [ação comprometida] mesmo que [obstáculo previsível]."`,
    practiceFrame: `Cada prática inclui uma conexão explícita com um valor: "Esta prática é sobre viver [valor X] — não sobre alcançar um resultado."`,
    anchorQuestion: "O que é verdadeiramente importante para você — não o que deveria ser, mas o que realmente importa?",
  },
  {
    key: "gestalt",
    name: "Gestalt — Emergência no aqui-e-agora",
    systemInstruction: `Use a perspectiva da Gestalt. O eu futuro não é distante — é uma potencialidade que emerge no momento presente. As práticas expandem a consciência (awareness) do usuário sobre como já experimenta fragmentos de sua identidade futura no cotidiano. Foco em sensações, emoções e percepções do momento presente, não em projeções. O futuro é descoberto, não construído.`,
    synthesisLens: `Ancore tudo no presente sensorial: como o usuário já experimenta, mesmo que brevemente, algo do eu futuro desejado no seu corpo e nas suas ações de hoje?`,
    intentionFrame: `Frase de intenção no formato "Neste momento, percebo [qualidade presente] em mim — escolho expandir essa presença."`,
    practiceFrame: `Cada prática inclui um momento de atenção ao corpo e às sensações: "Onde no seu corpo você experimenta isso?".`,
    anchorQuestion: "Onde, no seu dia de hoje, você já experimenta um pequeno sinal de quem está se tornando?",
  },
  {
    key: "humanista",
    name: "Centrada na Pessoa — Tendência Atualizante",
    systemInstruction: `Use a perspectiva Centrada na Pessoa de Rogers. Existe uma "tendência atualizante" inata — a capacidade natural de crescer em direção a um eu mais autêntico. As práticas criam condições de empatia, aceitação e congruência para que essa tendência floresça. O eu futuro não é construído externamente — é descoberto internamente. Linguagem de "tornar-se", não de "alcançar".`,
    synthesisLens: `Afirme a capacidade inata de crescimento desta pessoa. A síntese celebra quem ela já é, não apenas quem quer se tornar.`,
    intentionFrame: `Frase de intenção no formato "Confio na minha capacidade de [crescimento natural] — hoje crio espaço para [prática de autenticidade]."`,
    practiceFrame: `Cada prática cultiva autenticidade: "Quando você age assim, como se sente mais ou menos você mesmo?"`,
    anchorQuestion: "Quando você se sente mais verdadeiramente você mesmo, sem máscaras — como é essa sensação?",
  },
];

// ── Seleção automática por perfil Big Five ────────────────
export function selectFutureApproach(
  big5Dims?: Record<string, number>,
  assessmentNumber = 1
): FutureApproach {
  if (!big5Dims) {
    // Sem Big Five: rotação pela sessão
    return FUTURE_APPROACHES[(assessmentNumber - 1) % FUTURE_APPROACHES.length];
  }

  const { N = 50, E = 50, O = 50, A = 50, C = 50 } = big5Dims;

  // Neuroticismo muito alto → CFT (autocrítica/vergonha)
  if (N >= 75) return FUTURE_APPROACHES.find(a => a.key === "cft")!;

  // Neuroticismo alto → TCC (reestruturação + ensaio mental)
  if (N >= 60) return FUTURE_APPROACHES.find(a => a.key === "tcc")!;

  // Baixa Conscienciosidade → TFS (pequenos passos concretos)
  if (C < 35) return FUTURE_APPROACHES.find(a => a.key === "tfs")!;

  // Alta Abertura → Narrativa (metáforas, re-autoria)
  if (O >= 70) return FUTURE_APPROACHES.find(a => a.key === "narrativa")!;

  // Alta Amabilidade + N moderado → ACT (valores e direções)
  if (A >= 65 && N < 55) return FUTURE_APPROACHES.find(a => a.key === "act")!;

  // Alta Conscienciosidade (risco de perfeccionismo) → Esquema (Adulto Saudável)
  if (C >= 75) return FUTURE_APPROACHES.find(a => a.key === "esquema")!;

  // Alta Extroversão → Gestalt (presença e contato)
  if (E >= 65) return FUTURE_APPROACHES.find(a => a.key === "gestalt")!;

  // Alta Abertura moderada → Humanista
  if (O >= 55 && N < 50) return FUTURE_APPROACHES.find(a => a.key === "humanista")!;

  // Padrão → TCC
  return FUTURE_APPROACHES.find(a => a.key === "tcc")!;
}
