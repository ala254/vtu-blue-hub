import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in · Danjasub" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) nav({ to: "/home", replace: true });
    });
  }, [nav]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/home`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email if confirmation is required.");
        nav({ to: "/home", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/home", replace: true });
      }
    } catch (e: any) {
      toast.error(e.message || "Authentication failed");
    } finally { setLoading(false); }
  }

  async function googleSignIn() {
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/home" });
    if (res.error) toast.error("Google sign-in failed");
  }

  async function forgotPassword() {
    if (!email) return toast.error("Enter your email first");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
        <div className="mb-6 text-center text-primary-foreground">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">D</div>
          <h1 className="text-2xl font-bold">Danjasub</h1>
          <p className="text-sm opacity-90">Fast. Reliable. Affordable.</p>
        </div>

        <div className="rounded-3xl bg-card p-6 shadow-elegant">
          <h2 className="text-xl font-bold">{mode === "signup" ? "Create Account" : "Welcome Back"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup" ? "Start enjoying instant bill payments" : "Sign in to continue"}
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <>
                <Field label="Full Name" value={fullName} onChange={setFullName} required />
                <Field label="Phone Number" type="tel" value={phone} onChange={setPhone} required />
              </>
            )}
            <Field label="Email Address" type="email" value={email} onChange={setEmail} required />
            <Field label="Password" type="password" value={password} onChange={setPassword} required />
            {mode === "login" && (
              <button type="button" onClick={forgotPassword} className="block text-xs font-medium text-primary">
                Forgot password?
              </button>
            )}
            <button disabled={loading} className="mt-2 w-full rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60">
              {loading ? "Please wait…" : mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>

          <button onClick={googleSignIn} className="w-full rounded-xl border border-border bg-card py-3 text-sm font-semibold hover:bg-muted">
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? "Already have an account? " : "New to Danjasub? "}
            <button onClick={() => setMode(mode === "signup" ? "login" : "signup")} className="font-semibold text-primary">
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none ring-primary/30 focus:ring-2"
      />
    </label>
  );
}
