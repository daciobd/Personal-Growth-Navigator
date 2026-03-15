import { useQuery } from "@tanstack/react-query";
import { fetchAdjectives } from "@/lib/api";
import { useState } from "react";

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Emocional: { bg: "#FEF2F2", text: "#991B1B" },
  Cognitivo: { bg: "#EFF6FF", text: "#1D4ED8" },
  Social: { bg: "#F0FDF4", text: "#166534" },
  Comportamental: { bg: "#FFF7ED", text: "#9A3412" },
  Valores: { bg: "#FAF5FF", text: "#6B21A8" },
};

function AdjChip({ label, category }: { label: string; category: string }) {
  const c = CATEGORY_COLORS[category] ?? { bg: "#F5F5F5", text: "#333" };
  return (
    <span
      className="inline-block text-xs px-2.5 py-1 rounded-full mr-1.5 mb-1.5 font-medium"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {label}
    </span>
  );
}

export default function Adjectives() {
  const { data, isLoading } = useQuery({
    queryKey: ["adjectives"],
    queryFn: fetchAdjectives,
  });

  const [tab, setTab] = useState<"current" | "future">("current");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories: string[] = data?.categories ?? [];
  const adjectives: any[] = tab === "current" ? (data?.current ?? []) : (data?.future ?? []);

  const filtered = activeCategory
    ? adjectives.filter((a) => a.category === activeCategory)
    : adjectives;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Carregando adjetivos...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Adjetivos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {data?.current?.length ?? 0} adjetivos atuais · {data?.future?.length ?? 0} adjetivos futuros
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg border bg-card p-1 w-fit">
        <button
          onClick={() => setTab("current")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "current" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Eu Hoje ({data?.current?.length ?? 0})
        </button>
        <button
          onClick={() => setTab("future")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === "future" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Eu Futuro ({data?.future?.length ?? 0})
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !activeCategory ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => {
          const c = CATEGORY_COLORS[cat] ?? { bg: "#F5F5F5", text: "#333" };
          const isActive = activeCategory === cat;
          const count = adjectives.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? null : cat)}
              className="px-3 py-1 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: isActive ? c.text : c.bg,
                color: isActive ? "#fff" : c.text,
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* By category */}
      {!activeCategory ? (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catAdjectives = adjectives.filter((a) => a.category === cat);
            const c = CATEGORY_COLORS[cat] ?? { bg: "#F5F5F5", text: "#333" };
            return (
              <div key={cat} className="bg-card rounded-xl border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {cat}
                  </span>
                  <span className="text-sm text-muted-foreground">{catAdjectives.length} adjetivos</span>
                </div>
                <div>
                  {catAdjectives.map((a) => (
                    <AdjChip key={a.label} label={a.label} category={a.category} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card rounded-xl border p-5">
          <div className="flex items-center gap-2 mb-4">
            <span
              className="text-sm font-semibold px-3 py-1 rounded-full"
              style={{
                backgroundColor: CATEGORY_COLORS[activeCategory]?.bg ?? "#F5F5F5",
                color: CATEGORY_COLORS[activeCategory]?.text ?? "#333",
              }}
            >
              {activeCategory}
            </span>
            <span className="text-sm text-muted-foreground">{filtered.length} adjetivos</span>
          </div>
          <div>
            {filtered.map((a) => (
              <AdjChip key={a.label} label={a.label} category={a.category} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
