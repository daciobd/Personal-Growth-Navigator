import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdjectives, simulateProfile } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

const THERAPY_COLORS: Record<string, { bg: string; text: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8" },
  ACT: { bg: "#F0FDF4", text: "#166534" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8" },
  "Terapia Narrativa": { bg: "#F5F0FD", text: "#5A1A8A" },
  "Focada em Compaixão": { bg: "#FDF0F0", text: "#8A1A1A" },
};

export default function Simulator() {
  const { data: adjData, isLoading } = useQuery({
    queryKey: ["adjectives"],
    queryFn: fetchAdjectives,
  });

  const [currentSelected, setCurrentSelected] = useState<string[]>([]);
  const [futureSelected, setFutureSelected] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const simulate = useMutation({
    mutationFn: () => simulateProfile(currentSelected, futureSelected),
    onSuccess: (data) => setResult(data),
  });

  const toggleCurrent = (label: string) =>
    setCurrentSelected((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );

  const toggleFuture = (label: string) =>
    setFutureSelected((prev) =>
      prev.includes(label) ? prev.filter((a) => a !== label) : [...prev, label]
    );

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando...</div>;
  }

  const currentAdjectives: any[] = adjData?.current ?? [];
  const futureAdjectives: any[] = adjData?.future ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Simulador de Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monte um perfil e veja quais intervenções seriam ativadas e com qual score de relevância.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current */}
        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold mb-3">
            Eu Hoje
            {currentSelected.length > 0 && (
              <span className="ml-2 text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">
                {currentSelected.length} selecionados
              </span>
            )}
          </h3>
          <div className="flex flex-wrap">
            {currentAdjectives.map((a) => {
              const sel = currentSelected.includes(a.label);
              return (
                <button
                  key={a.label}
                  onClick={() => toggleCurrent(a.label)}
                  className={`text-xs px-2.5 py-1 rounded-full mr-1.5 mb-1.5 font-medium border transition-all ${
                    sel
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-red-50 text-red-700 border-transparent hover:border-red-300"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Future */}
        <div className="bg-card rounded-xl border p-5">
          <h3 className="font-semibold mb-3">
            Eu Futuro
            {futureSelected.length > 0 && (
              <span className="ml-2 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
                {futureSelected.length} selecionados
              </span>
            )}
          </h3>
          <div className="flex flex-wrap">
            {futureAdjectives.map((a) => {
              const sel = futureSelected.includes(a.label);
              return (
                <button
                  key={a.label}
                  onClick={() => toggleFuture(a.label)}
                  className={`text-xs px-2.5 py-1 rounded-full mr-1.5 mb-1.5 font-medium border transition-all ${
                    sel
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-green-50 text-green-700 border-transparent hover:border-green-300"
                  }`}
                >
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => simulate.mutate()}
        disabled={currentSelected.length === 0 || futureSelected.length === 0 || simulate.isPending}
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {simulate.isPending ? "Simulando..." : "Simular perfil"}
      </button>

      {result && (
        <div className="space-y-4">
          {/* Profile summary */}
          <div className="bg-card rounded-xl border p-5">
            <h3 className="font-semibold mb-3">Resumo do Perfil</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">{result.profileSummary.currentCount}</p>
                <p className="text-xs text-red-600">adjetivos atuais</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">{result.profileSummary.futureCount}</p>
                <p className="text-xs text-green-600">adjetivos futuros</p>
              </div>
            </div>
          </div>

          {/* Approach coverage */}
          {Object.keys(result.approachCoverage).length > 0 && (
            <div className="bg-card rounded-xl border p-5">
              <h3 className="font-semibold mb-3">Abordagens Ativadas</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.approachCoverage).map(([therapy, count]) => {
                  const c = THERAPY_COLORS[therapy] ?? { bg: "#F5F5F5", text: "#333" };
                  return (
                    <div
                      key={therapy}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: c.bg }}
                    >
                      <span className="text-sm font-semibold" style={{ color: c.text }}>
                        {therapy}
                      </span>
                      <span
                        className="text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: c.text, color: "#fff" }}
                      >
                        {count as number}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Relevant interventions */}
          {result.relevantInterventions?.length > 0 && (
            <div className="bg-card rounded-xl border">
              <div className="p-5 border-b">
                <h3 className="font-semibold">Intervenções por Score de Relevância</h3>
                <p className="text-xs text-muted-foreground mt-1">Score = 2 pts por adjetivo "De" correspondente + 2 pts por adjetivo "Para" correspondente</p>
              </div>
              <div className="divide-y">
                {result.relevantInterventions.map((item: any) => {
                  const c = THERAPY_COLORS[item.therapy] ?? { bg: "#F5F5F5", text: "#333" };
                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: c.bg, color: c.text }}
                          >
                            {item.therapy}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{item.title}</p>
                      </div>
                      <div
                        className="text-lg font-bold px-3 py-1 rounded-lg"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {item.score}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.relevantInterventions?.length === 0 && (
            <div className="bg-card rounded-xl border p-5 text-center text-muted-foreground text-sm">
              Nenhuma intervenção corresponde a este perfil. Tente selecionar adjetivos diferentes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
