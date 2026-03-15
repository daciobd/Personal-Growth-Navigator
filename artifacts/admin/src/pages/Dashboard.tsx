import { useQuery } from "@tanstack/react-query";
import { fetchStats, fetchLogs } from "@/lib/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="bg-card rounded-xl border p-5">
      <p className="text-sm text-muted-foreground mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function AdjChip({ label }: { label: string }) {
  return (
    <span className="inline-block bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full mr-1 mb-1">
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 30000,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: () => fetchLogs(15),
    refetchInterval: 30000,
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Carregando estatísticas...
      </div>
    );
  }

  const COLORS = ["#1B6B5A", "#2D8F76", "#4AA88E", "#6BC1A6", "#8CD8BE", "#ADE8D0", "#CEF4E8", "#D4F5EE", "#E0F9F4", "#EDF9F6"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Visão geral do MeuEu</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Planos gerados" value={stats?.totalPlans ?? 0} />
        <StatCard label="Últimos 7 dias" value={stats?.plansLast7Days ?? 0} sub="planos gerados" />
        <StatCard label="Intervenções" value={stats?.totalInterventions ?? 0} sub="na biblioteca" />
        <StatCard
          label="Adjetivos"
          value={(stats?.totalCurrentAdjectives ?? 0) + (stats?.totalFutureAdjectives ?? 0)}
          sub={`${stats?.totalCurrentAdjectives ?? 0} atuais + ${stats?.totalFutureAdjectives ?? 0} futuros`}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats?.topCurrentAdjectives?.length > 0 && (
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold text-sm mb-4">Adjetivos Atuais Mais Selecionados</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.topCurrentAdjectives} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="adj" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.topCurrentAdjectives.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {stats?.topFutureAdjectives?.length > 0 && (
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold text-sm mb-4">Adjetivos Futuros Mais Desejados</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.topFutureAdjectives} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="adj" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.topFutureAdjectives.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent logs */}
      <div className="bg-card rounded-xl border">
        <div className="p-5 border-b">
          <h3 className="font-semibold">Planos Recentes</h3>
        </div>
        {logsLoading ? (
          <div className="p-5 text-muted-foreground text-sm">Carregando logs...</div>
        ) : logsData?.logs?.length === 0 ? (
          <div className="p-5 text-muted-foreground text-sm">Nenhum plano gerado ainda.</div>
        ) : (
          <div className="divide-y">
            {logsData?.logs?.map((log: any) => (
              <div key={log.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    #{log.id}
                  </span>
                </div>
                <div className="space-y-1">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">Hoje:</span>
                    {log.currentAdjectives?.map((adj: string) => <AdjChip key={adj} label={adj} />)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide mr-2">Futuro:</span>
                    {log.futureAdjectives?.map((adj: string) => <AdjChip key={adj} label={adj} />)}
                  </div>
                  {log.fraseIntencao && (
                    <p className="text-sm italic text-muted-foreground mt-1 line-clamp-1">
                      "{log.fraseIntencao}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
