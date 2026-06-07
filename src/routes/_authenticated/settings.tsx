import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/page-shell";
import { useTheme } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { Moon, Sun, Lock, Eye, EyeOff, Info, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings · Danjasub" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, toggle } = useTheme();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (next.length < 6) return toast.error("Password must be at least 6 characters");
    if (next !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const email = userData.user?.email;
      if (!email) throw new Error("Not signed in");
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: current });
      if (signInErr) throw new Error("Current password is incorrect");
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) throw error;
      toast.success("Password updated");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <div className="mx-auto max-w-md px-5 pb-10 space-y-4">
        {/* Appearance */}
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</p>
          <button onClick={toggle} className="flex w-full items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
                {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Dark mode</p>
                <p className="text-[11px] text-muted-foreground">{theme === "dark" ? "On" : "Off"}</p>
              </div>
            </div>
            <span className={`relative h-6 w-11 rounded-full transition ${theme === "dark" ? "bg-primary" : "bg-muted"}`}>
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${theme === "dark" ? "left-5" : "left-0.5"}`} />
            </span>
          </button>
        </section>

        {/* Change password */}
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Change Password</p>
          </div>
          <form onSubmit={changePassword} className="space-y-3">
            <Field label="Current password" value={current} onChange={setCurrent} show={show} />
            <Field label="New password" value={next} onChange={setNext} show={show} />
            <Field label="Confirm new password" value={confirm} onChange={setConfirm} show={show} />
            <button type="button" onClick={() => setShow(s => !s)} className="flex items-center gap-1 text-xs text-muted-foreground">
              {show ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {show ? "Hide" : "Show"} passwords
            </button>
            <button disabled={loading} className="w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>

        <Link to="/about" className="flex items-center justify-between rounded-2xl bg-card p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-soft text-primary">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">About</p>
              <p className="text-[11px] text-muted-foreground">App & developer info</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </>
  );
}

function Field({ label, value, onChange, show }: { label: string; value: string; onChange: (v: string) => void; show: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-medium text-muted-foreground">{label}</span>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
        required
      />
    </label>
  );
}
