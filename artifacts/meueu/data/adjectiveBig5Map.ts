// artifacts/meueu/data/adjectiveBig5Map.ts
//
// Mapeamento de adjetivos → facetas Big Five com pesos de carga fatorial.
// Baseado em: Goldberg (1992) "The development of markers for the Big-Five
// factor structure" e Saucier (1994) "Mini-Markers".
//
// Pesos variam de -1.0 a +1.0:
//   +0.70 a +1.0  = carga forte positiva
//   +0.40 a +0.69 = carga moderada positiva
//   -0.40 a -0.69 = carga moderada negativa (traço baixo da faceta)
//   -0.70 a -1.0  = carga forte negativa
//
// Dimensões: N=Neuroticismo, E=Extroversão, O=Abertura, A=Amabilidade, C=Conscienciosidade
// Facetas: N1-N6, E1-E6, O1-O6, A1-A6, C1-C6

export type FacetKey =
  "N1"|"N2"|"N3"|"N4"|"N5"|"N6"|
  "E1"|"E2"|"E3"|"E4"|"E5"|"E6"|
  "O1"|"O2"|"O3"|"O4"|"O5"|"O6"|
  "A1"|"A2"|"A3"|"A4"|"A5"|"A6"|
  "C1"|"C2"|"C3"|"C4"|"C5"|"C6";

export type DimKey = "N"|"E"|"O"|"A"|"C";

export type AdjectiveWeight = Partial<Record<FacetKey, number>>;

export const ADJECTIVE_B5_MAP: Record<string, AdjectiveWeight> = {

  // ── ADJETIVOS NEGATIVOS (eu hoje) ─────────────────────────────────────────

  // Emocional
  "ansioso":          { N1: +0.88, N6: +0.62, N4: +0.45 },
  "tenso":            { N1: +0.82, N2: +0.48, N6: +0.55 },
  "triste":           { N3: +0.85, N6: +0.60, E6: -0.55 },
  "irritável":        { N2: +0.84, N5: +0.62, A4: -0.50 },
  "vazio":            { N3: +0.72, E6: -0.65, O3: -0.48 },
  "inseguro":         { N4: +0.82, N1: +0.65, C1: -0.58 },
  "culpado":          { N4: +0.75, N3: +0.62, A3: +0.40 },
  "ressentido":       { N2: +0.80, A1: -0.65, A4: -0.55 },
  "sobrecarregado":   { N6: +0.85, N1: +0.60, C5: -0.50 },
  "volátil":          { N5: +0.82, N2: +0.68, C6: -0.55 },
  "melancólico":      { N3: +0.85, E6: -0.62, O3: +0.40 },
  "frágil":           { N6: +0.78, N1: +0.65, C1: -0.52 },

  // Cognitivo
  "pessimista":       { N3: +0.78, N1: +0.65, O5: -0.48 },
  "autocrítico":      { N4: +0.80, N3: +0.58, A5: -0.45 },
  "perfeccionista":   { C4: +0.72, N4: +0.65, C2: +0.68 },
  "rígido":           { O4: -0.75, C2: +0.55, A4: -0.60 },
  "indeciso":         { N1: +0.70, C6: -0.72, N6: +0.58 },
  "catastrofizante":  { N1: +0.88, N3: +0.65, O5: -0.42 },
  "confuso":          { N6: +0.72, C6: -0.65, O5: -0.48 },
  "comparativo":      { N4: +0.75, N3: +0.62, A5: -0.52 },
  "limitado":         { C1: -0.68, O4: -0.60, N6: +0.55 },
  "ruminante":        { N1: +0.82, N3: +0.72, C5: -0.48 },

  // Social
  "impulsivo":        { N5: +0.85, C6: -0.72, A4: -0.55 },
  "tímido":           { E3: -0.80, E2: -0.72, N4: +0.68 },
  "solitário":        { E2: -0.78, E1: -0.65, N3: +0.52 },
  "fechado":          { E1: -0.82, A1: -0.58, O4: -0.45 },
  "dependente":       { N6: +0.72, A4: -0.48, C1: -0.55 },
  "submisso":         { A4: +0.65, E3: -0.72, N4: +0.55 },
  "desconfiante":     { A1: -0.85, A2: -0.70, N2: +0.60 },
  "distante":         { E1: -0.80, A6: -0.72, N3: +0.45 },
  "controlador":      { C2: +0.62, A4: -0.68, N2: +0.65 },
  "ciumento":         { N2: +0.78, A1: -0.62, N5: +0.58 },
  "retraído":         { E2: -0.85, E3: -0.78, N4: +0.62 },
  "agressivo":        { N2: +0.88, A4: -0.80, A3: -0.65 },
  "evitativo":        { N1: +0.72, E2: -0.68, C5: -0.60 },

  // Comportamental
  "procrastinador":   { C5: -0.88, C4: -0.80, N1: +0.55 },
  "agitado":          { N5: +0.78, N1: +0.68, E4: +0.45 },
  "passivo":          { E3: -0.78, C4: -0.72, A4: +0.48 },
  "conformado":       { O4: -0.72, E3: -0.65, C4: -0.58 },
  "desmotivado":      { C4: -0.85, E6: -0.72, N3: +0.62 },
  "acelerado":        { N5: +0.75, E4: +0.65, C6: -0.55 },
  "desorganizado":    { C2: -0.88, C5: -0.80, C6: -0.72 },
  "negligente":       { C3: -0.85, C1: -0.72, A3: -0.58 },
  "reativo":          { N5: +0.80, N2: +0.72, C6: -0.65 },

  // Valores
  "perdido":          { O6: -0.72, C4: -0.68, N3: +0.65 },
  "sem propósito":    { O6: -0.80, C4: -0.72, N3: +0.58 },
  "superficial":      { O2: -0.68, A6: -0.62, O5: -0.55 },
  "materialista":     { O6: -0.65, A3: -0.58, C4: +0.45 },
  "ingrato":          { A3: -0.72, A6: -0.65, O6: -0.55 },
  "egoísta":          { A3: -0.85, A4: -0.72, A5: -0.65 },
  "inflexível":       { O4: -0.80, A4: -0.65, C2: +0.55 },
  "desengajado":      { C4: -0.78, E2: -0.65, O4: -0.58 },
  "desconectado":     { E1: -0.75, A6: -0.68, O3: -0.55 },
  "inauténtico":      { O6: -0.80, A2: -0.72, E6: -0.55 },
  "indiferente":      { A6: -0.80, A3: -0.72, O3: -0.65 },

  // ── ADJETIVOS POSITIVOS (eu futuro) ───────────────────────────────────────

  // Emocional
  "calmo":            { N1: -0.85, N6: -0.72, E6: +0.55 },
  "sereno":           { N1: -0.82, N5: -0.68, O3: +0.48 },
  "equilibrado":      { N6: -0.80, C1: +0.65, A4: +0.55 },
  "corajoso":         { N6: -0.72, E3: +0.75, C3: +0.65 },
  "resiliente":       { N6: -0.80, C1: +0.72, E6: +0.58 },
  "inteiro":          { N3: -0.72, O6: +0.68, A5: +0.55 },
  "leve":             { N1: -0.78, N3: -0.70, E6: +0.62 },
  "grato":            { A3: +0.78, E6: +0.65, O6: +0.60 },
  "esperançoso":      { N3: -0.80, E6: +0.72, O5: +0.55 },
  "entusiasmado":     { E6: +0.85, E4: +0.72, N3: -0.60 },

  // Cognitivo
  "focado":           { C5: +0.85, C4: +0.78, N1: -0.55 },
  "claro":            { C6: +0.80, O5: +0.68, N6: -0.62 },
  "inteligente":      { O5: +0.80, C1: +0.72, O4: +0.65 },
  "criativo":         { O1: +0.88, O5: +0.82, O2: +0.72 },
  "curioso":          { O4: +0.85, O5: +0.78, O1: +0.65 },
  "sábio":            { O5: +0.80, C6: +0.72, A6: +0.65 },
  "reflexivo":        { O3: +0.78, O5: +0.72, C6: +0.65 },
  "realista":         { C6: +0.72, O5: +0.65, N1: -0.55 },
  "inovador":         { O4: +0.85, O5: +0.78, E3: +0.58 },
  "estratégico":      { C6: +0.80, C1: +0.72, O5: +0.68 },

  // Social
  "empático":         { A6: +0.88, A3: +0.80, E1: +0.68 },
  "caloroso":         { E1: +0.85, A3: +0.78, A6: +0.72 },
  "generoso":         { A3: +0.88, A6: +0.75, A5: +0.62 },
  "conectado":        { E1: +0.80, E2: +0.72, A1: +0.65 },
  "assertivo":        { E3: +0.88, N4: -0.72, C3: +0.65 },
  "comunicativo":     { E1: +0.82, E3: +0.75, E2: +0.68 },
  "colaborativo":     { A4: +0.80, A3: +0.72, E2: +0.65 },
  "inspirador":       { E3: +0.78, E6: +0.72, A3: +0.65 },
  "confiável":        { A1: +0.85, C3: +0.80, A2: +0.72 },
  "presente":         { O3: +0.72, E1: +0.68, N1: -0.65 },

  // Comportamental
  "disciplinado":     { C5: +0.88, C3: +0.82, C4: +0.78 },
  "consistente":      { C3: +0.85, C5: +0.80, C1: +0.72 },
  "produtivo":        { C4: +0.88, C5: +0.80, E4: +0.65 },
  "proativo":         { C4: +0.82, E3: +0.75, C5: +0.72 },
  "organizado":       { C2: +0.90, C5: +0.78, C6: +0.72 },
  "perseverante":     { C4: +0.85, C3: +0.80, N6: -0.65 },
  "coerente":         { C3: +0.80, A2: +0.72, O6: +0.65 },
  "determinado":      { C4: +0.88, E3: +0.75, C5: +0.72 },
  "ativo":            { E4: +0.85, C4: +0.72, N3: -0.58 },
  "livre":            { O4: +0.78, E5: +0.70, N6: -0.65 },

  // Valores
  "autêntico":        { A2: +0.85, O6: +0.80, O3: +0.72 },
  "íntegro":          { A2: +0.88, C3: +0.82, O6: +0.75 },
  "propositado":      { O6: +0.88, C4: +0.80, C3: +0.72 },
  "pleno":            { E6: +0.80, O6: +0.75, N3: -0.72 },
  "compassivo":       { A6: +0.88, A3: +0.82, A5: +0.68 },
  "justo":            { A2: +0.82, A4: +0.72, C3: +0.68 },
  "espiritual":       { O6: +0.78, O3: +0.72, A6: +0.65 },
  "comprometido":     { C3: +0.88, C4: +0.80, A4: +0.65 },
  "confiante":        { N4: -0.85, E3: +0.78, C1: +0.72 },
  "forte":            { N6: -0.80, C1: +0.78, E3: +0.72 },
  "expansivo":        { E2: +0.78, E5: +0.72, O4: +0.65 },
  "realizado":        { C4: +0.82, E6: +0.75, N3: -0.72 },
  "transformado":     { O4: +0.72, C4: +0.68, N3: -0.65 },
};

// ── Faceta → Dimensão ─────────────────────────────────────────────────────
export const FACET_TO_DIM: Record<FacetKey, DimKey> = {
  N1:"N",N2:"N",N3:"N",N4:"N",N5:"N",N6:"N",
  E1:"E",E2:"E",E3:"E",E4:"E",E5:"E",E6:"E",
  O1:"O",O2:"O",O3:"O",O4:"O",O5:"O",O6:"O",
  A1:"A",A2:"A",A3:"A",A4:"A",A5:"A",A6:"A",
  C1:"C",C2:"C",C3:"C",C4:"C",C5:"C",C6:"C",
};

// ── Nomes das facetas ─────────────────────────────────────────────────────
export const FACET_NAMES: Record<FacetKey, string> = {
  N1:"Ansiedade",N2:"Hostilidade",N3:"Depressão",N4:"Autoconsciência",N5:"Impulsividade",N6:"Vulnerabilidade",
  E1:"Cordialidade",E2:"Gregarismo",E3:"Assertividade",E4:"Atividade",E5:"Busca de excitação",E6:"Emoções positivas",
  O1:"Fantasia",O2:"Estética",O3:"Sentimentos",O4:"Ações",O5:"Ideias",O6:"Valores",
  A1:"Confiança",A2:"Franqueza",A3:"Altruísmo",A4:"Complacência",A5:"Modéstia",A6:"Sensibilidade",
  C1:"Competência",C2:"Ordem",C3:"Senso de dever",C4:"Realização",C5:"Autodisciplina",C6:"Deliberação",
};

// ── Nomes das dimensões ────────────────────────────────────────────────────
export const DIM_NAMES: Record<DimKey, string> = {
  N:"Neuroticismo", E:"Extroversão", O:"Abertura", A:"Amabilidade", C:"Conscienciosidade",
};

export const DIM_COLORS: Record<DimKey, string> = {
  N:"#C4622D", E:"#1B6B5A", O:"#3A5A8C", A:"#854F0B", C:"#0F6E56",
};
