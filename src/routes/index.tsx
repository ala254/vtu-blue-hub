import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Wifi, Smartphone, Lightbulb, Tv, GraduationCap, Trophy, Shield, Zap, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Danjasub — Fast. Reliable. Affordable VTU & Bill Payments" },
      { name: "description", content: "Buy data, airtime, pay electricity, cable TV and exam pins instantly. Built for Nigerians." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const services = [
    { icon: Wifi, label: "Data" },
    { icon: Smartphone, label: "Airtime" },
    { icon: Lightbulb, label: "Electricity" },
    { icon: Tv, label: "Cable TV" },
    { icon: Trophy, label: "Betting" },
    { icon: GraduationCap, label: "Exam Pins" },
  ];

  async function goApp() {
    const { data } = await supabase.auth.getUser();
    if (data.user) window.location.href = "/home";
    else window.location.href = "/auth";
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground font-bold shadow-elegant">D</div>
          <span className="text-lg font-bold tracking-tight">Danjasub</span>
        </div>
        <Link to="/auth" className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-elegant hover:opacity-90">
          Sign in
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-5 pt-6 pb-16 md:pt-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Fast • Reliable • Affordable
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              All your bills.<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">One blue app.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Danjasub is your all-in-one platform for data, airtime, bill payments, cable subscriptions and more.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={goApp} className="rounded-full bg-gradient-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-elegant">
                Get started — it's free
              </button>
              <Link to="/auth" className="rounded-full border border-border px-7 py-3 text-sm font-semibold">
                I have an account
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Secure</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-primary" /> Instant</span>
              <span className="inline-flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-primary" /> Best prices</span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-full max-w-[320px]">
            <div className="absolute -inset-6 rounded-[3rem] bg-gradient-primary opacity-20 blur-3xl" />
            <div className="relative rounded-[2.5rem] border-[10px] border-foreground/90 bg-background p-4 shadow-elegant">
              <div className="rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-card">
                <p className="text-xs opacity-90">Wallet Balance</p>
                <p className="mt-1 text-3xl font-bold">₦25,600.00</p>
                <button className="mt-3 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">+ Fund Wallet</button>
              </div>
              <p className="mt-5 mb-3 text-sm font-semibold">Quick Services</p>
              <div className="grid grid-cols-4 gap-3">
                {services.slice(0, 8).map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl bg-primary-soft p-2.5">
                    <s.icon className="h-5 w-5 text-primary" />
                    <span className="text-[10px] font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-soft/40 py-12">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-2xl font-bold tracking-tight">Why Choose Danjasub?</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { t: "Best Prices", d: "We offer the cheapest rates" },
              { t: "Instant Delivery", d: "Get your services delivered instantly" },
              { t: "24/7 Support", d: "We are always here to help" },
              { t: "Secure & Safe", d: "Your transactions are 100% safe" },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-card p-5 shadow-card">
                <p className="font-semibold">{x.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gradient-primary py-5 text-center text-sm text-primary-foreground">
        © {new Date().getFullYear()} Danjasub · Fast. Reliable. Affordable.
      </footer>
    </div>
  );
}
