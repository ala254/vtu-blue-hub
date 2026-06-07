import { Code2, Phone } from "lucide-react";

export function DeveloperInfo({ variant = "footer" }: { variant?: "footer" | "card" }) {
  if (variant === "card") {
    return (
      <div className="rounded-2xl bg-gradient-card p-4 text-primary-foreground shadow-elegant">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur">
            <Code2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide opacity-80">Developer</p>
            <p className="truncate text-sm font-bold">Developed by Alamin Kabir</p>
            <a href="tel:09057352833" className="mt-0.5 inline-flex items-center gap-1 text-xs opacity-90 hover:opacity-100">
              <Phone className="h-3 w-3" /> Contact: 09057352833
            </a>
          </div>
        </div>
      </div>
    );
  }
  return (
    <footer className="mx-auto mt-6 max-w-md px-5 pb-2 text-center">
      <div className="rounded-2xl border border-border/60 bg-card/60 px-4 py-3 backdrop-blur">
        <p className="text-[11px] font-semibold text-foreground">Developed by Alamin Kabir</p>
        <a href="tel:09057352833" className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary">
          <Phone className="h-3 w-3" /> Contact: 09057352833
        </a>
      </div>
    </footer>
  );
}
