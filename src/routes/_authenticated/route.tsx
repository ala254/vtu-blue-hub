import { createFileRoute, Outlet, redirect, Link, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Home, History, User, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: AppShell,
});

function AppShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const tabs = [
    { to: "/home", label: "Home", icon: Home },
    { to: "/history", label: "History", icon: History },
    { to: "/fund", label: "Fund", icon: Wallet, highlight: true },
    { to: "/referrals", label: "Referrals", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background pb-24">
      <Outlet />
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-end justify-between px-2 py-2">
          {tabs.map((t) => {
            const active = path === t.to || (t.to === "/home" && path.startsWith("/services"));
            const Icon = t.icon;
            if (t.highlight) {
              return (
                <Link key={t.to} to={t.to} className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-elegant">
                  <Icon className="h-6 w-6" />
                </Link>
              );
            }
            return (
              <Link key={t.to} to={t.to} className={`flex w-16 flex-col items-center gap-0.5 py-1 text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
