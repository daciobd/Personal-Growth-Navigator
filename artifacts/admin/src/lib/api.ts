const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = BASE.replace("/admin", "") + "/api";

// --- Analytics ---

export async function fetchAnalyticsOverview() {
  const r = await fetch(`${API}/admin/analytics/overview`);
  if (!r.ok) throw new Error("Erro ao buscar overview");
  return r.json() as Promise<{
    totalEvents: number;
    todayEvents: number;
    uniqueUsers: number;
    practicesCompleted: number;
    onboardingsStarted: number;
  }>;
}

export async function fetchAnalyticsFunnel() {
  const r = await fetch(`${API}/admin/analytics/funnel`);
  if (!r.ok) throw new Error("Erro ao buscar funil");
  return r.json() as Promise<{ step: string; count: number }[]>;
}

export async function fetchAnalyticsDaily(days = 14) {
  const r = await fetch(`${API}/admin/analytics/daily?days=${days}`);
  if (!r.ok) throw new Error("Erro ao buscar daily");
  return r.json() as Promise<{ day: string; event: string; n: number }[]>;
}

export async function fetchAnalyticsTopEvents(limit = 10) {
  const r = await fetch(`${API}/admin/analytics/top-events?limit=${limit}`);
  if (!r.ok) throw new Error("Erro ao buscar top events");
  return r.json() as Promise<{ event: string; n: number }[]>;
}

export async function fetchAnalyticsProblemBreakdown() {
  const r = await fetch(`${API}/admin/analytics/problem-breakdown`);
  if (!r.ok) throw new Error("Erro ao buscar breakdown");
  return r.json() as Promise<{ problem: string; n: number }[]>;
}

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
