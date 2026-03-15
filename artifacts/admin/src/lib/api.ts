const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = BASE.replace("/admin", "") + "/api";

export async function fetchStats() {
  const r = await fetch(`${API}/admin/stats`);
  if (!r.ok) throw new Error("Erro ao buscar stats");
  return r.json();
}

export async function fetchLogs(limit = 20, offset = 0) {
  const r = await fetch(`${API}/admin/logs?limit=${limit}&offset=${offset}`);
  if (!r.ok) throw new Error("Erro ao buscar logs");
  return r.json();
}

export async function fetchInterventions() {
  const r = await fetch(`${API}/admin/interventions`);
  if (!r.ok) throw new Error("Erro ao buscar intervenções");
  return r.json();
}

export async function fetchAdjectives() {
  const r = await fetch(`${API}/admin/adjectives`);
  if (!r.ok) throw new Error("Erro ao buscar adjetivos");
  return r.json();
}

export async function simulateProfile(currentAdjectives: string[], futureAdjectives: string[]) {
  const r = await fetch(`${API}/admin/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentAdjectives, futureAdjectives }),
  });
  if (!r.ok) throw new Error("Erro ao simular");
  return r.json();
}
