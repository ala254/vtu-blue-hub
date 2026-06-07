import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboard } from "@/lib/services.functions";
import { PageHeader } from "@/components/page-shell";
import { DeveloperInfo } from "@/components/developer-info";
import { supabase } from "@/integrations/supabase/client";
import { Info, LogOut, Mail, Phone, User, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const fn = useServerFn(getDashboard);
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => fn() });

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    nav({ to: "/auth" });
  }

  const p = data?.profile;
  return (
    <>
      <PageHeader title="Profile" />
      <div className="mx-auto max-w-md px-5 pb-10">
        <div className="rounded-3xl bg-gradient-card p-5 text-center text-primary-foreground shadow-elegant">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white/15 text-2xl font-bold backdrop-blur">
            {(p?.full_name ?? "U").charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 text-lg font-bold">{p?.full_name ?? "User"}</p>
          <p className="text-xs opacity-90">{p?.email}</p>
        </div>

        <div className="mt-4 space-y-2">
          <Row icon={User} label="Full name" value={p?.full_name ?? "—"} />
          <Row icon={Mail} label="Email" value={p?.email ?? "—"} />
          <Row icon={Phone} label="Phone" value={p?.phone ?? "—"} />
        </div>

        <Link to="/about" className="mt-3 flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">App</p>
              <p className="text-sm font-semibold">About & Developer</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>

        <div className="mt-4">
          <DeveloperInfo variant="card" />
        </div>

        <button onClick={signOut} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-3 text-sm font-semibold text-destructive">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
