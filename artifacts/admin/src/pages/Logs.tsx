import { useQuery } from "@tanstack/react-query";
import { fetchLogs } from "@/lib/api";
import { useState } from "react";

function AdjChip({ label, variant }: { label: string; variant: "current" | "future" }) {
  return (
    <span
      className={`inline-block text-xs px-2 py-0.5 rounded-full mr-1 mb-1 font-medium ${
        variant === "current"
          ? "bg-red-50 text-red-700"
          : "bg-green-50 text-green-700"
      }`}
    >
      {label}
    </span>
  );
}

export default function Logs() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["logs", page],
    queryFn: () => fetchLogs(pageSize, page * pageSize),
  });

  const logs: any[] = data?.logs ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Logs de Planos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Histórico de planos gerados com adjetivos selecionados e frase de intenção
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-card rounded-xl border p-12 text-center">
          <p className="text-muted-foreground text-sm">Nenhum plano gerado ainda.</p>
          <p className="text-muted-foreground text-xs mt-1">Os logs aparecerão aqui conforme os usuários completarem o onboarding.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-card rounded-xl border p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                      #{log.id}
                    </span>
                    {log.sessionId && (
                      <span className="text-xs text-muted-foreground">
                        sessão: {log.sessionId.slice(0, 8)}…
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString("pt-BR")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Eu Hoje ({log.currentAdjectives?.length ?? 0})
                    </p>
                    <div>
                      {log.currentAdjectives?.map((adj: string) => (
                        <AdjChip key={adj} label={adj} variant="current" />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                      Eu Futuro ({log.futureAdjectives?.length ?? 0})
                    </p>
                    <div>
                      {log.futureAdjectives?.map((adj: string) => (
                        <AdjChip key={adj} label={adj} variant="future" />
                      ))}
                    </div>
                  </div>
                </div>

                {log.fraseIntencao && (
                  <div className="bg-secondary/40 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-0.5">Frase de intenção</p>
                    <p className="text-sm italic text-foreground">"{log.fraseIntencao}"</p>
                  </div>
                )}

                {log.praticas && log.praticas.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                      Práticas geradas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {log.praticas.map((p: any, i: number) => (
                        <div key={i} className="text-xs bg-secondary px-3 py-1.5 rounded-lg">
                          <span className="font-semibold">{p.abordagem}</span>
                          <span className="text-muted-foreground"> · {p.nome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || isFetching}
              className="px-4 py-2 text-sm rounded-lg border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Página {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={logs.length < pageSize || isFetching}
              className="px-4 py-2 text-sm rounded-lg border bg-card hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </>
      )}
    </div>
  );
}
