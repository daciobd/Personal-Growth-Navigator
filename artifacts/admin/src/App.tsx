import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import Adjectives from "@/pages/Adjectives";
import Simulator from "@/pages/Simulator";
import Logs from "@/pages/Logs";
import TabRelatorio from "@/pages/TabRelatorio";
import Growth from "@/pages/Growth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 15000 } },
});

const NAV = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/growth", label: "Growth", icon: "🚀" },
  { href: "/library", label: "Intervenções", icon: "📚" },
  { href: "/adjectives", label: "Adjetivos", icon: "🏷️" },
  { href: "/logs", label: "Logs de Planos", icon: "📋" },
  { href: "/simulator", label: "Simulador", icon: "🧪" },
  { href: "/relatorio", label: "Relatórios", icon: "📄" },
];

function Sidebar() {
  const [location] = useLocation();
  return (
    <aside className="w-56 shrink-0 border-r bg-card h-full">
      <div className="p-5 border-b">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">M</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">MeuEu</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>
      <nav className="p-3 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const isActive = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/library" component={Library} />
      <Route path="/adjectives" component={Adjectives} />
      <Route path="/logs" component={Logs} />
      <Route path="/simulator" component={Simulator} />
      <Route path="/growth" component={Growth} />
      <Route path="/relatorio" component={TabRelatorio} />
      <Route>
        <div className="text-center py-24 text-muted-foreground">Página não encontrada</div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Layout>
          <Router />
        </Layout>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
