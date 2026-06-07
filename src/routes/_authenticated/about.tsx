import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-shell";
import { Info, Phone, MessageCircle, Code2, Sparkles, Copy, Check, BadgeCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/about")({
  head: () => ({ meta: [{ title: "About · Danjasub" }] }),
  component: Page,
});

const PHONE = "09057352833";
const PHONE_INTL = "+2349057352833";

function Page() {
  const [copied, setCopied] = useState(false);

  async function copyPhone() {
    try {
      await navigator.clipboard.writeText(PHONE);
      setCopied(true);
      toast.success("Phone number copied");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <>
      <PageHeader title="About" />
      <div className="mx-auto max-w-md px-5 pb-10 space-y-5">
        {/* App intro */}
        <div className="rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-elegant">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Info className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold">Danjasub</p>
              <p className="text-xs opacity-90">Premium VTU platform</p>
            </div>
          </div>
        </div>

        {/* Premium developer card */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-elegant">
          {/* Decorative gradient blobs */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br from-primary/30 to-primary-glow/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-gradient-to-tr from-primary-glow/25 to-primary/10 blur-3xl" />

          {/* Header strip */}
          <div className="relative flex items-center justify-between px-5 pt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" /> Developer
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
              <BadgeCheck className="h-3 w-3" /> Verified
            </span>
          </div>

          {/* Identity */}
          <div className="relative flex items-center gap-4 px-5 pt-4">
            <div className="relative">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-primary text-xl font-extrabold text-primary-foreground shadow-elegant">
                AK
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-success text-success-foreground">
                <Check className="h-3 w-3" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground">Developed by</p>
              <p className="truncate text-lg font-extrabold leading-tight">Alamin Kabir</p>
              <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Code2 className="h-3 w-3" /> Full-stack engineer
              </p>
            </div>
          </div>

          {/* Phone display */}
          <div className="relative mx-5 mt-5 rounded-2xl bg-gradient-to-br from-primary-soft to-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-card text-primary shadow-card">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
                  <p className="truncate font-mono text-base font-bold tracking-wide text-foreground">{PHONE}</p>
                </div>
              </div>
              <button
                onClick={copyPhone}
                aria-label="Copy phone number"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card text-muted-foreground shadow-card transition hover:text-primary"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="relative grid grid-cols-2 gap-3 p-5">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-primary py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition active:scale-[0.98]"
            >
              <Phone className="h-4 w-4" /> Call
            </a>
            <a
              href={`https://wa.me/${PHONE_INTL.replace("+", "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground shadow-card transition hover:border-primary/40 hover:text-primary active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>

          {/* Footer credit */}
          <div className="relative border-t border-border/70 bg-muted/30 px-5 py-3 text-center">
            <p className="text-[11px] font-medium text-muted-foreground">
              Crafted with care · © {new Date().getFullYear()} Alamin Kabir
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

