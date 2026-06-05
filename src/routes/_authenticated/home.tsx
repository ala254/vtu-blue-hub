import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getDashboard } from "@/lib/services.functions";
import { formatNaira } from "@/lib/catalog";
import {
  Bell, Smartphone, Wifi, Lightbulb, Tv, Trophy, GraduationCap, Gift, Grid3x3,
  Plus, ArrowLeftRight, Eye, EyeOff, ChevronRight,
} from "lucide-react";
import { TxStatusBadge, typeLabel } from "@/components/tx-badge";
import { BannerCarousel } from "@/components/banner-carousel";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({ meta: [{ title: "Home · Danjasub" }] }),
  component: HomePage,
});

const services = [
  { to: "/services/airtime", label: "Airtime", icon: Smartphone },
  { to: "/services/data", label: "Data", icon: Wifi },
  { to: "/services/electricity", label: "Electricity", icon: Lightbulb },
  { to: "/services/cable", label: "TV Subscription", icon: Tv },
  { to: "/services/betting", label: "Betting", icon: Trophy },
  { to: "/services/exam-pin", label: "Result Checker", icon: GraduationCap },
  { to: "/history", label: "Gift Cards", icon: Gift },
  { to: "/history", label: "More Services", icon: Grid3x3 },
] as const;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function HomePage() {
  const fn = useServerFn(getDashboard);
  const { data, isLoading } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });
  const [hidden, setHidden] = useState(false);

  const firstName = data?.profile?.full_name?.split(" ")[0] ?? "there";
  const balance = data?.balance ?? 0;

  return (
    <div className="mx-auto max-w-md animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-base font-bold shadow-elegant">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{greeting()} 👋</p>
            <p className="text-sm font-bold">{firstName}</p>
          </div>
        </div>
        <button aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-full bg-muted hover:bg-primary-soft transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive" />
        </button>
      </header>

      {/* Wallet card */}
      <div className="px-5">
        <div className="relative overflow-hidden rounded-[20px] bg-gradient-card p-5 text-primary-foreground shadow-elegant">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <p className="text-xs opacity-90">Available Balance</p>
            <button onClick={() => setHidden(v => !v)} aria-label="Toggle balance" className="grid h-8 w-8 place-items-center rounded-full bg-white/15 backdrop-blur hover:bg-white/25 transition">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="relative mt-1 text-3xl font-bold tracking-tight">
            {isLoading ? "₦—" : hidden ? "₦ ••••••" : formatNaira(balance)}
          </p>
          <div className="relative mt-5 grid grid-cols-2 gap-3">
            <Link to="/fund" className="flex items-center justify-center gap-2 rounded-2xl bg-white/95 py-3 text-sm font-semibold text-primary shadow-card hover:bg-white transition">
              <Plus className="h-4 w-4" /> Fund Wallet
            </Link>
            <Link to="/history" className="flex items-center justify-center gap-2 rounded-2xl bg-white/15 backdrop-blur py-3 text-sm font-semibold text-white hover:bg-white/25 transition">
              <ArrowLeftRight className="h-4 w-4" /> Transfer
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <Link
              key={s.label}
              to={s.to}
              className="group flex items-center gap-3 rounded-[20px] bg-card p-4 shadow-card hover:shadow-elegant hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary-soft text-primary group-hover:bg-gradient-primary group-hover:text-primary-foreground transition-colors">
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-semibold">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <BannerCarousel />

      {/* Recent transactions */}
      <section className="px-5 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold">Recent Transactions</h2>
          <Link to="/history" className="flex items-center gap-0.5 text-xs font-semibold text-primary">
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {isLoading && (
            <div className="rounded-[20px] bg-card p-4 shadow-card text-sm text-muted-foreground">Loading…</div>
          )}
          {!isLoading && (data?.recent?.length ?? 0) === 0 && (
            <div className="rounded-[20px] bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
              No transactions yet.
            </div>
          )}
          {data?.recent?.map((t: any) => (
            <div key={t.id} className="flex items-center gap-3 rounded-[20px] bg-card p-3.5 shadow-card hover:shadow-elegant transition">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
                <ServiceIcon type={t.type} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{t.description || typeLabel(t.type)}</p>
                <p className="text-[11px] text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{formatNaira(Number(t.amount))}</p>
                <TxStatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ServiceIcon({ type }: { type: string }) {
  const map: Record<string, typeof Smartphone> = {
    airtime: Smartphone, data: Wifi, electricity: Lightbulb, cable: Tv,
    betting: Trophy, exam_pin: GraduationCap, fund: Plus, referral: Gift,
  };
  const Icon = map[type] ?? Grid3x3;
  return <Icon className="h-5 w-5" />;
}
