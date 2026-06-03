import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/services.functions";
import { formatNaira } from "@/lib/catalog";
import { Bell, Wifi, Smartphone, Lightbulb, Tv, Trophy, GraduationCap, MoreHorizontal, Plus, ChevronRight } from "lucide-react";
import { TxStatusBadge, typeLabel } from "@/components/tx-badge";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Home · Danjasub" }] }),
  component: HomePage,
});

const services = [
  { to: "/services/data", label: "Data", icon: Wifi },
  { to: "/services/airtime", label: "Airtime", icon: Smartphone },
  { to: "/services/electricity", label: "Electricity", icon: Lightbulb },
  { to: "/services/cable", label: "Cable TV", icon: Tv },
  { to: "/services/betting", label: "Betting", icon: Trophy },
  { to: "/services/exam-pin", label: "Exam Pin", icon: GraduationCap },
  { to: "/fund", label: "Wallet", icon: Plus },
  { to: "/history", label: "More", icon: MoreHorizontal },
] as const;

function HomePage() {
  const fn = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });

  const firstName = data?.profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-md">
      <header className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-bold">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Hello,</p>
            <p className="text-sm font-semibold">{firstName}</p>
          </div>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-muted">
          <Bell className="h-5 w-5" />
        </button>
      </header>

      <div className="px-5">
        <Link to="/fund" className="block rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-elegant">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs opacity-90">Wallet Balance</p>
              <p className="mt-1 text-3xl font-bold">{isLoading ? "₦—" : formatNaira(data?.balance ?? 0)}</p>
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Plus className="h-3 w-3" /> Fund Wallet
              </span>
            </div>
            <ChevronRight className="h-6 w-6 opacity-80" />
          </div>
        </Link>
      </div>

      <section className="px-5 pt-6">
        <h2 className="mb-3 text-sm font-bold">Quick Services</h2>
        <div className="grid grid-cols-4 gap-3">
          {services.map((s) => (
            <Link key={s.to} to={s.to} className="flex flex-col items-center gap-1.5 rounded-2xl bg-card p-3 shadow-card hover:bg-primary-soft">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-medium">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Recent Transactions</h2>
          <Link to="/history" className="text-xs font-semibold text-primary">View All</Link>
        </div>
        <div className="space-y-2">
          {isLoading && <div className="rounded-2xl bg-card p-4 shadow-card text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && (data?.recent?.length ?? 0) === 0 && (
            <div className="rounded-2xl bg-card p-6 text-center text-sm text-muted-foreground shadow-card">No transactions yet.</div>
          )}
          {data?.recent?.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.description || typeLabel(t.type)}</p>
                <TxStatusBadge status={t.status} />
              </div>
              <p className="text-sm font-bold">{formatNaira(Number(t.amount))}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
