import { useQuery } from "@tanstack/react-query";
import { fetchInterventions } from "@/lib/api";
import { useState } from "react";

const THERAPY_COLORS: Record<string, { bg: string; text: string }> = {
  TCC: { bg: "#EFF6FF", text: "#1D4ED8" },
  ACT: { bg: "#F0FDF4", text: "#166534" },
  Mindfulness: { bg: "#FFF7ED", text: "#9A3412" },
  "Psicologia Positiva": { bg: "#FAF5FF", text: "#6B21A8" },
  "Terapia Narrativa": { bg: "#F5F0FD", text: "#5A1A8A" },
  "Focada em Compaixão": { bg: "#FDF0F0", text: "#8A1A1A" },
};

export default function Library() {
  const { data, isLoading } = useQuery({
    queryKey: ["interventions"],
    queryFn: fetchInterventions,
  });

  const [activeTherapy, setActiveTherapy] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const interventions: any[] = data?.interventions ?? [];

  const therapies = Array.from(new Set(interventions.map((i) => i.therapy)));

  const filtered = interventions.filter((i) => {
    const matchesTherapy = !activeTherapy || i.therapy === activeTherapy;
    const matchesSearch =
      !search ||
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.description.toLowerCase().includes(search.toLowerCase());
    return matchesTherapy && matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando biblioteca...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Biblioteca de Intervenções</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {interventions.length} intervenções em {therapies.length} abordagens terapêuticas
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTherapy(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeTherapy
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          Todas ({interventions.length})
        </button>
        {therapies.map((therapy) => {
          const c = THERAPY_COLORS[therapy] ?? { bg: "#F5F5F5", text: "#333" };
          const isActive = activeTherapy === therapy;
          const count = interventions.filter((i) => i.therapy === therapy).length;
          return (
            <button
              key={therapy}
              onClick={() => setActiveTherapy(isActive ? null : therapy)}
              className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? c.text : c.bg,
                color: isActive ? "#fff" : c.text,
              }}
            >
              {therapy} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar intervenções..."
        className="w-full md:w-80 px-4 py-2 rounded-lg border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((intervention) => {
          const c = THERAPY_COLORS[intervention.therapy] ?? { bg: "#F5F5F5", text: "#333" };
          return (
            <div key={intervention.id} className="bg-card rounded-xl border p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: c.bg, color: c.text }}
                    >
                      {intervention.therapy}
                    </span>
                    <span className="text-xs text-muted-foreground">{intervention.duration}</span>
                  </div>
                  <h3 className="font-semibold text-foreground">{intervention.title}</h3>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{intervention.description}</p>

              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Passos</p>
                <ol className="space-y-1">
                  {intervention.steps.map((step: string, i: number) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: c.bg, color: c.text }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {(intervention.fromAdjectives?.length > 0 || intervention.toAdjectives?.length > 0) && (
                <div className="space-y-1 pt-2 border-t">
                  {intervention.fromAdjectives?.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">De: </span>
                      {intervention.fromAdjectives.map((adj: string) => (
                        <span key={adj} className="inline-block text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full mr-1 mb-1">
                          {adj}
                        </span>
                      ))}
                    </div>
                  )}
                  {intervention.toAdjectives?.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground font-medium">Para: </span>
                      {intervention.toAdjectives.map((adj: string) => (
                        <span key={adj} className="inline-block text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full mr-1 mb-1">
                          {adj}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhuma intervenção encontrada com os filtros atuais.
        </div>
      )}
    </div>
  );
}
