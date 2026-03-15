import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";

const API = import.meta.env.BASE_URL.replace(/\/$/, "").replace("/admin", "") + "/api";

type CheckinRecord = {
  id: number;
  deviceId: string;
  date: string;
  practiceName: string;
  completed: boolean;
  rating: number | null;
  note: string | null;
  aiTip: string | null;
  xpEarned: number;
  streakDays: number;
  createdAt: string;
};

type CoachMessage = {
  id: number;
  role: string;
  content: string;
  createdAt: string;
};

type PlanLog = {
  id: number;
  sintese: string | null;
  fraseIntencao: string | null;
  praticas: any[] | null;
  createdAt: string;
};

type ReportData = {
  checkins: CheckinRecord[];
  coachMessages: CoachMessage[];
  planLogs: PlanLog[];
  stats: {
    totalCheckins: number;
    completedCheckins: number;
    avgRating: number | null;
    maxStreak: number;
    totalXP: number;
    coachInteractions: number;
  };
};

const DIM_COLORS: Record<string, string> = {
  O: "#7C3AED", C: "#0891B2", E: "#EA580C", A: "#16A34A", N: "#DC2626",
};

const DIM_NAMES: Record<string, string> = {
  O: "Abertura", C: "Conscienciosidade", E: "Extroversão", A: "Amabilidade", N: "Neuroticismo",
};

export default function TabRelatorio() {
  const [deviceId, setDeviceId] = useState("");
  const [clientName, setClientName] = useState("");
  const [big5Scores, setBig5Scores] = useState<Record<string, number>>({ O: 50, C: 50, E: 50, A: 50, N: 50 });
  const [interpretation, setInterpretation] = useState<string | null>(null);

  const reportQuery = useQuery<ReportData>({
    queryKey: ["report", deviceId],
    queryFn: async () => {
      const res = await fetch(`${API}/admin/report/${deviceId}`);
      if (!res.ok) throw new Error("Erro ao carregar dados");
      return res.json();
    },
    enabled: deviceId.length > 3,
  });

  const interpretMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API}/admin/report/${deviceId}/interpret`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          big5Scores,
          clientName: clientName || "o paciente",
          checkinStats: reportQuery.data?.stats
            ? {
                completed: reportQuery.data.stats.completedCheckins,
                total: reportQuery.data.stats.totalCheckins,
                avgRating: reportQuery.data.stats.avgRating,
                maxStreak: reportQuery.data.stats.maxStreak,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      return data.interpretation as string;
    },
    onSuccess: (text) => setInterpretation(text),
  });

  const handlePrint = () => {
    window.print();
  };

  const data = reportQuery.data;
  const dims = ["O", "C", "E", "A", "N"];

  return (
    <div className="space-y-6">
      {/* Print styles */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-root { display: block !important; }
          #print-root { font-family: Georgia, serif; color: #000; }
        }
        @media screen {
          #print-root { display: none; }
        }
      `}</style>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatório de Paciente</h1>
          <p className="text-sm text-muted-foreground mt-1">Gere e exporte o relatório clínico do paciente</p>
        </div>
        <button
          onClick={handlePrint}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          🖨️ Exportar PDF
        </button>
      </div>

      {/* Config panel */}
      <div className="bg-card border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-foreground">Configuração do Relatório</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Device ID do Paciente</label>
            <input
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
              placeholder="ex: a1b2c3d4-..."
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Nome do Paciente</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Nome para o relatório"
              className="w-full border rounded-lg px-3 py-2 text-sm bg-background text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-2">Pontuações Big Five (0–100)</label>
          <div className="grid grid-cols-5 gap-3">
            {dims.map((d) => (
              <div key={d} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: DIM_COLORS[d] }} />
                  <span className="text-xs font-medium text-foreground">{DIM_NAMES[d]}</span>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={big5Scores[d]}
                  onChange={(e) => setBig5Scores((prev) => ({ ...prev, [d]: Number(e.target.value) }))}
                  className="w-full border rounded-md px-2 py-1.5 text-sm text-center font-bold bg-background text-foreground"
                  style={{ borderColor: DIM_COLORS[d] }}
                />
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="h-1.5 rounded-full" style={{ width: `${big5Scores[d]}%`, backgroundColor: DIM_COLORS[d] }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => interpretMutation.mutate()}
          disabled={interpretMutation.isPending || deviceId.length < 4}
          className="w-full py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          {interpretMutation.isPending ? "Gerando interpretação com IA..." : "⚡ Gerar interpretação com IA"}
        </button>
      </div>

      {/* Report preview */}
      {data && (
        <div className="bg-card border rounded-xl p-5 space-y-5" style={{ transform: "scale(1)", transformOrigin: "top left" }}>
          <div className="border-b pb-4">
            <h2 className="text-xl font-bold text-foreground">{clientName || "Paciente"}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">ID: {deviceId} · Relatório gerado em {new Date().toLocaleDateString("pt-BR")}</p>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Resumo de Engajamento</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Check-ins completos", value: `${data.stats.completedCheckins}/${data.stats.totalCheckins}` },
                { label: "Nota média", value: data.stats.avgRating != null ? `${data.stats.avgRating}/5` : "—" },
                { label: "Sequência máxima", value: `${data.stats.maxStreak} dias` },
                { label: "XP total", value: `${data.stats.totalXP} XP` },
                { label: "Mensagens ao coach", value: String(data.stats.coachInteractions) },
                { label: "Sessões de chat", value: String(Math.ceil(data.stats.coachInteractions / 2)) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted rounded-lg p-3">
                  <div className="text-lg font-bold text-foreground">{value}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Big Five */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Perfil Big Five</h3>
            <div className="space-y-2">
              {dims.map((d) => (
                <div key={d} className="flex items-center gap-3">
                  <span className="w-28 text-xs font-medium text-foreground">{DIM_NAMES[d]}</span>
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div className="h-2 rounded-full" style={{ width: `${big5Scores[d]}%`, backgroundColor: DIM_COLORS[d] }} />
                  </div>
                  <span className="w-10 text-xs font-bold text-right" style={{ color: DIM_COLORS[d] }}>{big5Scores[d]}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Interpretation */}
          {interpretation && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Interpretação Clínica</h3>
              <div className="bg-muted rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {interpretation}
              </div>
            </div>
          )}

          {/* Plan */}
          {data.planLogs.length > 0 && data.planLogs[0].sintese && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Plano Terapêutico</h3>
              <p className="text-sm text-muted-foreground italic mb-2">{data.planLogs[0].sintese}</p>
              {data.planLogs[0].fraseIntencao && (
                <p className="text-sm font-medium text-foreground border-l-2 border-primary pl-3">{data.planLogs[0].fraseIntencao}</p>
              )}
            </div>
          )}

          {/* Recent checkins */}
          {data.checkins.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Histórico de Check-ins (últimos {Math.min(data.checkins.length, 10)})</h3>
              <div className="space-y-1.5">
                {data.checkins.slice(0, 10).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-muted">
                    <span className="text-muted-foreground w-20">{c.date}</span>
                    <span className="flex-1 text-foreground">{c.practiceName}</span>
                    <span className={`font-medium ${c.completed ? "text-green-600" : "text-muted-foreground"}`}>
                      {c.completed ? "Concluído" : "Não concluído"}
                    </span>
                    {c.rating && <span className="text-muted-foreground">{c.rating}/5</span>}
                    <span className="text-primary font-bold">+{c.xpEarned} XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent coach messages */}
          {data.coachMessages.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Conversas com o Coach (últimas {Math.min(data.coachMessages.length, 6)})</h3>
              <div className="space-y-2">
                {data.coachMessages.slice(0, 6).map((m) => (
                  <div key={m.id} className={`rounded-lg p-2.5 text-xs ${m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"}`}>
                    <div className="font-medium text-muted-foreground mb-0.5">{m.role === "user" ? "Paciente" : "Coach IA"}</div>
                    <div className="text-foreground">{m.content.slice(0, 200)}{m.content.length > 200 ? "..." : ""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {reportQuery.isLoading && deviceId.length > 3 && (
        <div className="text-center text-muted-foreground py-8">Carregando dados do paciente...</div>
      )}

      {/* Print root (hidden on screen, visible when printing) */}
      <div id="print-root" style={{ display: "none", padding: "20px", fontFamily: "Georgia, serif" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "4px" }}>
          Relatório Clínico — {clientName || "Paciente"}
        </h1>
        <p style={{ fontSize: "12px", color: "#666", marginBottom: "20px" }}>
          Gerado em {new Date().toLocaleDateString("pt-BR")} · ID: {deviceId}
        </p>

        {data && (
          <>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>Engajamento</h2>
            <p style={{ fontSize: "13px", marginBottom: "16px" }}>
              {data.stats.completedCheckins} check-ins concluídos de {data.stats.totalCheckins} total ·
              Nota média: {data.stats.avgRating ?? "N/A"}/5 ·
              Sequência máxima: {data.stats.maxStreak} dias ·
              XP total: {data.stats.totalXP}
            </p>

            <h2 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "8px", borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>Perfil Big Five</h2>
            {dims.map((d) => (
              <p key={d} style={{ fontSize: "13px", marginBottom: "4px" }}>
                <strong>{DIM_NAMES[d]}:</strong> {big5Scores[d]}%
              </p>
            ))}

            {interpretation && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: "16px 0 8px", borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>Interpretação Clínica</h2>
                <p style={{ fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>{interpretation}</p>
              </>
            )}

            {data.planLogs.length > 0 && data.planLogs[0].sintese && (
              <>
                <h2 style={{ fontSize: "16px", fontWeight: "bold", margin: "16px 0 8px", borderBottom: "1px solid #ddd", paddingBottom: "4px" }}>Plano Terapêutico</h2>
                <p style={{ fontSize: "13px", fontStyle: "italic", marginBottom: "8px" }}>{data.planLogs[0].sintese}</p>
                {data.planLogs[0].fraseIntencao && (
                  <p style={{ fontSize: "13px", borderLeft: "3px solid #1B6B5A", paddingLeft: "12px" }}>{data.planLogs[0].fraseIntencao}</p>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
