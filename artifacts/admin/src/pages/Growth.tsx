import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import {
  fetchAnalyticsOverview,
  fetchAnalyticsFunnel,
  fetchAnalyticsDaily,
  fetchAnalyticsTopEvents,
  fetchAnalyticsProblemBreakdown,
} from "@/lib/api";

const FUNNEL_LABELS: Record<string, string> = {
  onboarding_started:          "1. Onboarding iniciado",
  onboarding_problem_selected: "2. Problema selecionado",
  plan_generated:              "3. Plano gerado",
  practice_started:            "4. Prática iniciada",
  practice_completed:          "5. Prática concluída",
};

const PROBLEM_LABELS: Record<string, string> = {
  "cant-start":     "Não consigo começar",
  procrastination:  "Procrastino demais",
  "lack-focus":     "Perco foco fácil",
  "feeling-lost":   "Me sinto perdido",
  "no-discipline":  "Falta de disciplina",
};

const COLORS = ["#1B6B5A", "#2D8F76", "#4AA88E", "#E8A838", "#E05252"];

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-foreground border-b pb-2">{title}</h2>
      {children}
    </div>
  );
}

export default function Growth() {
  const { data: overview } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: fetchAnalyticsOverview,
    refetchInterval: 30000,
  });

  const { data: funnel = [] } = useQuery({
    queryKey: ["analytics-funnel"],
    queryFn: fetchAnalyticsFunnel,
    refetchInterval: 30000,
  });

  const { data: daily = [] } = useQuery({
    queryKey: ["analytics-daily"],
    queryFn: () => fetchAnalyticsDaily(14),
    refetchInterval: 30000,
  });

  const { data: topEvents = [] } = useQuery({
    queryKey: ["analytics-top-events"],
    queryFn: () => fetchAnalyticsTopEvents(10),
    refetchInterval: 30000,
  });

  const { data: problemBreakdown = [] } = useQuery({
    queryKey: ["analytics-problem-breakdown"],
    queryFn: fetchAnalyticsProblemBreakdown,
    refetchInterval: 30000,
  });

  // Build daily chart data: pivot by date
  const dailyDates = [...new Set(daily.map((d) => d.day))].sort();
  const KEY_EVENTS = ["onboarding_started", "practice_started", "practice_completed"];
  const dailyChart = dailyDates.map((day) => {
    const row: Record<string, string | number> = { day };
    for (const ev of KEY_EVENTS) {
      const found = daily.find((d) => d.day === day && d.event === ev);
      row[ev] = found ? Number(found.n) : 0;
    }
    return row;
  });

  // Funnel conversion rates
  const funnelData = funnel.map((f, i) => {
    const prev = i > 0 ? funnel[i - 1].count : f.count;
    const rate = prev > 0 ? Math.round((f.count / prev) * 100) : 100;
    return {
      step: FUNNEL_LABELS[f.step] ?? f.step,
      count: f.count,
      rate: i === 0 ? 100 : rate,
    };
  });

  const totalOnboardings = overview?.onboardingsStarted ?? 0;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Growth</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ativação · Retenção · Engajamento · Valor
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Eventos totais" value={overview?.totalEvents ?? "—"} />
        <StatCard label="Eventos hoje" value={overview?.todayEvents ?? "—"} />
        <StatCard label="Usuários únicos" value={overview?.uniqueUsers ?? "—"} sub="por anonymous_id" />
        <StatCard label="Onboardings iniciados" value={overview?.onboardingsStarted ?? "—"} />
        <StatCard label="Práticas concluídas" value={overview?.practicesCompleted ?? "—"} />
      </div>

      {/* Activation funnel */}
      <Section title="Ativação — Funil">
        {funnelData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhum dado ainda. Eventos serão coletados quando usuários usarem o app.
          </p>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnelData} layout="vertical" margin={{ left: 160, right: 40, top: 4, bottom: 4 }}>
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="step" tick={{ fontSize: 11 }} width={160} />
                <Tooltip
                  formatter={(v: number, _: string, props: any) => [
                    `${v} usuários (${props.payload?.rate ?? "—"}% do passo anterior)`,
                    "Contagem",
                  ]}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Conversion table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">Etapa</th>
                    <th className="text-right px-4 py-2 font-medium">Usuários</th>
                    <th className="text-right px-4 py-2 font-medium">Taxa do passo anterior</th>
                    <th className="text-right px-4 py-2 font-medium">Taxa do total</th>
                  </tr>
                </thead>
                <tbody>
                  {funnelData.map((row, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-4 py-2 text-foreground">{row.step}</td>
                      <td className="px-4 py-2 text-right font-mono">{row.count}</td>
                      <td className="px-4 py-2 text-right">
                        <span className={row.rate < 50 ? "text-red-500" : row.rate < 70 ? "text-yellow-500" : "text-green-600"}>
                          {row.rate}%
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {totalOnboardings > 0
                          ? `${Math.round((row.count / totalOnboardings) * 100)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Section>

      {/* Daily events trend */}
      <Section title="Engajamento — Eventos por Dia (14 dias)">
        {dailyChart.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhum dado ainda. Os eventos começarão a aparecer aqui conforme o app for usado.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dailyChart} margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="onboarding_started" stroke="#6B7280" name="Onboarding" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="practice_started" stroke="#2D8F76" name="Prática iniciada" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="practice_completed" stroke="#1B6B5A" name="Prática concluída" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Section>

      {/* Two columns: top events + problem breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Section title="Top Eventos">
          {topEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado ainda.</p>
          ) : (
            <div className="space-y-2">
              {topEvents.map((ev, i) => {
                const max = topEvents[0]?.n ?? 1;
                const pct = Math.round((Number(ev.n) / Number(max)) * 100);
                return (
                  <div key={ev.event}>
                    <div className="flex justify-between text-sm mb-0.5">
                      <span className="text-foreground font-mono text-xs">{ev.event}</span>
                      <span className="text-muted-foreground">{ev.n}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Breakdown — Problema Selecionado">
          {problemBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Nenhum dado ainda.</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={problemBreakdown} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
                  <XAxis
                    dataKey="problem"
                    tickFormatter={(v) => {
                      const label = PROBLEM_LABELS[v] ?? v;
                      return label.length > 12 ? label.substring(0, 12) + "…" : label;
                    }}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: number) => [v, "Usuários"]}
                    labelFormatter={(label) => PROBLEM_LABELS[label] ?? label}
                  />
                  <Bar dataKey="n" radius={[4, 4, 0, 0]}>
                    {problemBreakdown.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {problemBreakdown.map((row) => (
                  <div key={row.problem} className="flex justify-between text-sm">
                    <span className="text-foreground">{PROBLEM_LABELS[row.problem] ?? row.problem}</span>
                    <span className="text-muted-foreground font-mono">{row.n}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Section>
      </div>

      {/* Diagnosis card */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
        <p className="text-sm font-semibold text-amber-900">Diagnóstico rápido</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-amber-800">
          <div className="bg-white rounded-lg border border-amber-100 p-3">
            <p className="font-medium mb-1">Drop em plan_generated</p>
            <p>O plano não está convencendo. Revise o copy e a apresentação das práticas.</p>
          </div>
          <div className="bg-white rounded-lg border border-amber-100 p-3">
            <p className="font-medium mb-1">Drop em practice_started</p>
            <p>O CTA está fraco. Destaque que leva apenas 5 minutos e reduza opções.</p>
          </div>
          <div className="bg-white rounded-lg border border-amber-100 p-3">
            <p className="font-medium mb-1">Drop em practice_completed</p>
            <p>A prática está difícil ou longa. Simplifique os passos e reduza o tempo.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
