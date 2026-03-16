// artifacts/meueu/components/Big5LivePreview.tsx
//
// Componente de prévia Big Five em tempo real.
// Exibe radar SVG que se atualiza conforme o usuário seleciona adjetivos.
// Pode ser embarcado na tela de seleção de adjetivos.

import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable, Animated } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from "react-native-svg";
import {
  estimateB5FromAdjectives,
  generatePreviewInsight,
} from "../data/big5Estimator";
import { ADJECTIVE_B5_MAP, DIM_NAMES, DIM_COLORS, FACET_NAMES, FACET_TO_DIM, type DimKey } from "../data/adjectiveBig5Map";

type Props = {
  currentAdjectives: string[];
  futureAdjectives?: string[];
  compact?: boolean; // versão compacta para embutir no fluxo
};

const DIMS: DimKey[] = ["N", "E", "O", "A", "C"];
const ANGLES = DIMS.map((_, i) => (i / DIMS.length) * 2 * Math.PI - Math.PI / 2);
const SIZE = 200;
const CX = SIZE / 2;
const CY = SIZE / 2;
const MAX_R = SIZE * 0.36;
const LABEL_R = SIZE * 0.47;

function pt(angle: number, r: number) {
  return { x: CX + r * Math.cos(angle), y: CY + r * Math.sin(angle) };
}

// Confidence bar color
function confidenceColor(c: number) {
  if (c < 30) return "#E8A838";
  if (c < 60) return "#1B6B5A";
  return "#0F6E56";
}

export default function Big5LivePreview({
  currentAdjectives,
  futureAdjectives = [],
  compact = false,
}: Props) {
  const [expanded, setExpanded] = useState(!compact);

  const estimate = useMemo(
    () => estimateB5FromAdjectives(currentAdjectives, futureAdjectives),
    [currentAdjectives.join(","), futureAdjectives.join(",")]
  );

  // Não mostra nada com menos de 3 adjetivos mapeados
  const totalMapped = [...currentAdjectives, ...futureAdjectives]
    .filter(a => !!ADJECTIVE_B5_MAP[a.toLowerCase()]).length;

  if (!estimate || totalMapped < 3) {
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyText}>
          Selecione ao menos 3 adjetivos para ver a prévia do seu perfil Big Five
        </Text>
      </View>
    );
  }

  // Radar points
  const scorePoints = DIMS.map((d, i) => pt(ANGLES[i], (estimate.dims[d] / 100) * MAX_R));
  const scoreStr = scorePoints.map(p => `${p.x},${p.y}`).join(" ");
  const grids = [20, 40, 60, 80, 100].map(v => {
    const pts = DIMS.map((_, i) => pt(ANGLES[i], (v / 100) * MAX_R));
    return pts.map(p => `${p.x},${p.y}`).join(" ");
  });

  // Top 3 facets with strongest signal
  const topFacets = Object.entries(estimate.facets)
    .map(([key, val]) => ({ key: key as keyof typeof FACET_NAMES, val, signal: Math.abs(val - 50) }))
    .filter(f => f.signal > 15)
    .sort((a, b) => b.signal - a.signal)
    .slice(0, 4);

  const insight = generatePreviewInsight(estimate);
  const confColor = confidenceColor(estimate.confidence);

  if (compact && !expanded) {
    return (
      <Pressable style={styles.compactCard} onPress={() => setExpanded(true)}>
        <View style={styles.compactLeft}>
          <Text style={styles.compactTitle}>Prévia Big Five</Text>
          <Text style={styles.compactSub} numberOfLines={1}>{insight}</Text>
        </View>
        <View style={[styles.confPill, { backgroundColor: confColor + "22", borderColor: confColor + "44" }]}>
          <Text style={[styles.confText, { color: confColor }]}>
            {estimate.confidenceLabel}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <Pressable
        style={styles.header}
        onPress={compact ? () => setExpanded(false) : undefined}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Prévia do seu perfil Big Five</Text>
          <Text style={styles.sub}>Estimativa baseada nos adjetivos selecionados</Text>
        </View>
        <View style={[styles.confPill, { backgroundColor: confColor + "22", borderColor: confColor + "44" }]}>
          <Text style={[styles.confText, { color: confColor }]}>
            Confiança {estimate.confidenceLabel}
          </Text>
        </View>
      </Pressable>

      {/* Confidence bar */}
      <View style={styles.confBarBg}>
        <View style={[styles.confBarFill, { width: `${estimate.confidence}%` as `${number}%`, backgroundColor: confColor }]} />
      </View>
      <Text style={styles.confHint}>
        {estimate.confidence < 40
          ? `${totalMapped} adjetivos mapeados — adicione mais para maior precisão`
          : `${totalMapped} adjetivos mapeados · ${5 - estimate.missingDims.length}/5 dimensões cobertas`
        }
      </Text>

      {/* Radar */}
      <View style={styles.radarWrap}>
        <Svg width={SIZE} height={SIZE}>
          {/* Grid */}
          {grids.map((pts, i) => (
            <Polygon key={i} points={pts} fill="none" stroke="#E8F0ED" strokeWidth={1} />
          ))}
          {/* Axes */}
          {DIMS.map((_, i) => {
            const outer = pt(ANGLES[i], MAX_R);
            return <Line key={i} x1={CX} y1={CY} x2={outer.x} y2={outer.y} stroke="#E8F0ED" strokeWidth={1} />;
          })}
          {/* Score polygon */}
          <Polygon
            points={scoreStr}
            fill="rgba(27,107,90,0.18)"
            stroke="#1B6B5A"
            strokeWidth={2}
            strokeLinejoin="round"
          />
          {/* Dots */}
          {scorePoints.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={4} fill={DIM_COLORS[DIMS[i]]} stroke="#fff" strokeWidth={1.5} />
          ))}
          {/* Labels */}
          {DIMS.map((d, i) => {
            const pos = pt(ANGLES[i], LABEL_R);
            const score = estimate.dims[d];
            const anchor = Math.cos(ANGLES[i]) > 0.3 ? "start" : Math.cos(ANGLES[i]) < -0.3 ? "end" : "middle";
            return (
              <G key={d}>
                <SvgText x={pos.x} y={pos.y - 5} textAnchor={anchor} fontSize={9} fontWeight="700" fill={DIM_COLORS[d]}>{d}</SvgText>
                <SvgText x={pos.x} y={pos.y + 7} textAnchor={anchor} fontSize={8} fill="#6B8F7E">{score}%</SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Insight */}
      <View style={styles.insightBox}>
        <Text style={styles.insightText}>{insight}</Text>
      </View>

      {/* Dimension bars */}
      <View style={styles.dimBars}>
        {DIMS.map(d => {
          const score = estimate.dims[d];
          const hasData = !estimate.missingDims.includes(d);
          return (
            <View key={d} style={styles.dimRow}>
              <Text style={[styles.dimLabel, { color: DIM_COLORS[d] }]}>{DIM_NAMES[d].slice(0, 5)}</Text>
              <View style={styles.dimBarBg}>
                <View style={[
                  styles.dimBarFill,
                  { width: `${score}%` as `${number}%`, backgroundColor: hasData ? DIM_COLORS[d] : "#C8D8CC" }
                ]} />
              </View>
              <Text style={[styles.dimScore, { color: hasData ? DIM_COLORS[d] : "#A8C0B8" }]}>{score}%</Text>
            </View>
          );
        })}
      </View>

      {/* Top facets */}
      {topFacets.length > 0 && (
        <View style={styles.facetsSection}>
          <Text style={styles.facetsTitle}>Facetas mais salientes</Text>
          <View style={styles.facetsGrid}>
            {topFacets.map(f => {
              const dim = FACET_TO_DIM[f.key];
              const color = DIM_COLORS[dim];
              const high = f.val > 50;
              return (
                <View key={f.key} style={[styles.facetChip, { borderColor: color + "44", backgroundColor: color + "10" }]}>
                  <Text style={[styles.facetName, { color }]}>{FACET_NAMES[f.key]}</Text>
                  <Text style={[styles.facetScore, { color }]}>{f.val}% · {high ? "alto" : "baixo"}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* CTA for full test */}
      <View style={styles.ctaBox}>
        <Text style={styles.ctaText}>
          Esta é uma estimativa. Faça o teste completo (120 itens) para um perfil clínico preciso com 30 facetas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyBox: { backgroundColor: "#F5F8F6", borderRadius: 12, padding: 16, marginVertical: 8 },
  emptyText: { fontSize: 13, color: "#A8C0B8", textAlign: "center", lineHeight: 20 },
  compactCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 14, borderWidth: 1, borderColor: "#E8F0ED", marginVertical: 6, gap: 12 },
  compactLeft: { flex: 1 },
  compactTitle: { fontSize: 13, fontWeight: "700", color: "#0F1F1B" },
  compactSub: { fontSize: 12, color: "#6B8F7E", marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E8F0ED", marginVertical: 8 },
  header: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  title: { fontSize: 14, fontWeight: "700", color: "#0F1F1B" },
  sub: { fontSize: 11, color: "#6B8F7E", marginTop: 2 },
  confPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  confText: { fontSize: 10, fontWeight: "700" },
  confBarBg: { height: 4, backgroundColor: "#E8F0ED", borderRadius: 2, overflow: "hidden", marginBottom: 4 },
  confBarFill: { height: "100%", borderRadius: 2 },
  confHint: { fontSize: 10, color: "#A8C0B8", marginBottom: 12 },
  radarWrap: { alignItems: "center", marginBottom: 12 },
  insightBox: { backgroundColor: "#F5F8F6", borderRadius: 10, padding: 12, marginBottom: 12 },
  insightText: { fontSize: 13, color: "#3D5A52", lineHeight: 19, fontStyle: "italic" },
  dimBars: { gap: 8, marginBottom: 12 },
  dimRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  dimLabel: { fontSize: 10, fontWeight: "700", width: 38 },
  dimBarBg: { flex: 1, height: 5, backgroundColor: "#E8F0ED", borderRadius: 3, overflow: "hidden" },
  dimBarFill: { height: "100%", borderRadius: 3 },
  dimScore: { fontSize: 11, fontWeight: "700", width: 32, textAlign: "right" },
  facetsSection: { marginBottom: 12 },
  facetsTitle: { fontSize: 11, fontWeight: "700", color: "#6B8F7E", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  facetsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  facetChip: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  facetName: { fontSize: 11, fontWeight: "700" },
  facetScore: { fontSize: 10, marginTop: 1 },
  ctaBox: { backgroundColor: "#E8F5F1", borderRadius: 8, padding: 10 },
  ctaText: { fontSize: 11, color: "#1B6B5A", lineHeight: 17, textAlign: "center" },
});
