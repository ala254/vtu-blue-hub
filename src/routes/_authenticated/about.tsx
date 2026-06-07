import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-shell";
import { DeveloperInfo } from "@/components/developer-info";
import { Info, Phone, Mail, Code2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/about")({
  head: () => ({ meta: [{ title: "About · Danjasub" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="About" />
      <div className="mx-auto max-w-md px-5 pb-10 space-y-4">
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

        <div className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Code2 className="h-4 w-4 text-primary" /> Developer Information
          </div>
          <div className="mt-3 space-y-2">
            <Row icon={Code2} label="Developed by" value="Alamin Kabir" />
            <Row icon={Phone} label="Phone" value="09057352833" href="tel:09057352833" />
            <Row icon={Mail} label="Support" value="Contact for inquiries" />
          </div>
        </div>

        <DeveloperInfo variant="card" />
      </div>
    </>
  );
}

function Row({ icon: Icon, label, value, href }: { icon: any; label: string; value: string; href?: string }) {
  const Inner = (
    <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
  return href ? <a href={href}>{Inner}</a> : Inner;
}
