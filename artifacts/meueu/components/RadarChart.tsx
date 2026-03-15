import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import Colors from "@/constants/colors";

type RadarPoint = {
  label: string;
  value: number;
  color: string;
};

type Props = {
  data: RadarPoint[];
  size?: number;
  previousData?: RadarPoint[];
};

const DEG_TO_RAD = Math.PI / 180;

function getAngle(index: number, total: number): number {
  return (index * (360 / total) - 90) * DEG_TO_RAD;
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function buildPolygonPoints(
  cx: number,
  cy: number,
  maxR: number,
  values: number[],
): string {
  return values
    .map((v, i) => {
      const angle = getAngle(i, values.length);
      const r = (v / 100) * maxR;
      const pt = polarToCartesian(cx, cy, r, angle);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");
}

export function RadarChart({ data, size = 260, previousData }: Props) {
  const colors = Colors.light;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 40;
  const n = data.length;
  const gridLevels = [20, 40, 60, 80, 100];

  const values = data.map((d) => d.value);
  const prevValues = previousData?.map((d) => d.value);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Grid rings */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: n }, (_, i) => {
            const angle = getAngle(i, n);
            const r = (level / 100) * maxR;
            const pt = polarToCartesian(cx, cy, r, angle);
            return `${pt.x},${pt.y}`;
          }).join(" ");
          return (
            <Polygon
              key={level}
              points={pts}
              fill="none"
              stroke={colors.cardBorder}
              strokeWidth={level === 100 ? 1.5 : 1}
              strokeDasharray={level === 100 ? undefined : "3,3"}
            />
          );
        })}

        {/* Axis lines */}
        {data.map((_, i) => {
          const angle = getAngle(i, n);
          const end = polarToCartesian(cx, cy, maxR, angle);
          return (
            <Line
              key={i}
              x1={cx}
              y1={cy}
              x2={end.x}
              y2={end.y}
              stroke={colors.cardBorder}
              strokeWidth={1}
            />
          );
        })}

        {/* Previous data polygon (ghost) */}
        {prevValues && (
          <Polygon
            points={buildPolygonPoints(cx, cy, maxR, prevValues)}
            fill="rgba(0,0,0,0.04)"
            stroke={colors.textMuted}
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
        )}

        {/* Current data polygon */}
        <Polygon
          points={buildPolygonPoints(cx, cy, maxR, values)}
          fill={`${colors.primary}22`}
          stroke={colors.primary}
          strokeWidth={2}
        />

        {/* Axis dots */}
        {data.map((d, i) => {
          const angle = getAngle(i, n);
          const r = (d.value / 100) * maxR;
          const pt = polarToCartesian(cx, cy, r, angle);
          return (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={d.color}
              stroke="#fff"
              strokeWidth={1.5}
            />
          );
        })}

        {/* Labels */}
        {data.map((d, i) => {
          const angle = getAngle(i, n);
          const labelR = maxR + 22;
          const pt = polarToCartesian(cx, cy, labelR, angle);
          const textAnchor =
            Math.abs(pt.x - cx) < 5
              ? "middle"
              : pt.x < cx
              ? "end"
              : "start";
          return (
            <SvgText
              key={i}
              x={pt.x}
              y={pt.y + 4}
              textAnchor={textAnchor}
              fontSize={11}
              fontWeight="600"
              fill={d.color}
            >
              {d.label}
            </SvgText>
          );
        })}

        {/* Score labels at axis end */}
        {data.map((d, i) => {
          const angle = getAngle(i, n);
          const r = (d.value / 100) * maxR;
          const pt = polarToCartesian(cx, cy, r, angle);
          return (
            <SvgText
              key={`score-${i}`}
              x={pt.x}
              y={pt.y - 7}
              textAnchor="middle"
              fontSize={9}
              fontWeight="700"
              fill={d.color}
            >
              {d.value}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
  },
});
