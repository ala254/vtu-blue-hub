import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({ title, back = "/home", right }: { title: string; back?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between bg-background/95 px-5 py-4 backdrop-blur">
      <Link to={back} className="grid h-9 w-9 place-items-center rounded-full bg-muted">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <h1 className="text-base font-bold">{title}</h1>
      <div className="h-9 w-9">{right}</div>
    </header>
  );
}

export function FormShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-md px-5 pb-10">{children}</div>;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function inputCls() {
  return "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30";
}

export function PrimaryButton({ loading, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button {...props} disabled={loading || props.disabled}
      className="mt-2 w-full rounded-xl bg-gradient-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-elegant disabled:opacity-60">
      {loading ? "Processing…" : children}
    </button>
  );
}
