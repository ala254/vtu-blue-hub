import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CABLE_PROVIDERS, formatNaira } from "@/lib/catalog";
import { buyCable } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/cable")({
  head: () => ({ meta: [{ title: "Cable TV · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [provider, setProvider] = useState(CABLE_PROVIDERS[0].id);
  const [planId, setPlanId] = useState("");
  const [smartcard, setSmartcard] = useState("");
  const fn = useServerFn(buyCable);
  const m = useMutation({
    mutationFn: (v: any) => fn({ data: v }),
    onSuccess: () => { toast.success("Subscription successful"); nav({ to: "/history" }); },
    onError: (e: any) => toast.error(e.message),
  });
  const plans = CABLE_PROVIDERS.find((p) => p.id === provider)?.plans ?? [];
  return (
    <>
      <PageHeader title="Cable TV" />
      <FormShell>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!planId) return toast.error("Select a plan"); m.mutate({ provider, planId, smartcard }); }}>
          <Field label="Provider">
            <div className="grid grid-cols-3 gap-2">
              {CABLE_PROVIDERS.map((p) => (
                <button type="button" key={p.id} onClick={() => { setProvider(p.id); setPlanId(""); }}
                  className={`rounded-xl border py-2 text-xs font-semibold ${provider === p.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Smart Card / IUC Number">
            <input className={inputCls()} value={smartcard} onChange={(e) => setSmartcard(e.target.value)} required />
          </Field>
          <Field label="Select Plan">
            <div className="space-y-2">
              {plans.map((p) => (
                <button type="button" key={p.id} onClick={() => setPlanId(p.id)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left ${planId === p.id ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
                  <span className="text-sm">{p.label}</span>
                  <span className="text-sm font-bold text-primary">{formatNaira(p.price)}</span>
                </button>
              ))}
            </div>
          </Field>
          <PrimaryButton loading={m.isPending}>Subscribe</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
