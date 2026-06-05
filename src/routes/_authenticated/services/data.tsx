import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { NETWORKS, DATA_PLANS, formatNaira } from "@/lib/catalog";
import { buyData } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/data")({
  head: () => ({ meta: [{ title: "Buy Data · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [network, setNetwork] = useState("mtn");
  const [planId, setPlanId] = useState("");
  const [phone, setPhone] = useState("");
  const fn = useServerFn(buyData);
  const m = useMutation({
    mutationFn: (v: { network: string; planId: string; phone: string }) => fn({ data: v }),
    onSuccess: () => { toast.success("Data purchase successful"); nav({ to: "/history" }); },
    onError: (e: any) => toast.error(e.message),
  });
  const plans = DATA_PLANS[network] || [];
  return (
    <>
      <PageHeader title="Buy Data" />
      <FormShell>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (!planId) return toast.error("Select a plan"); m.mutate({ network, planId, phone }); }}>
          <Field label="Network">
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button type="button" key={n.id} onClick={() => { setNetwork(n.id); setPlanId(""); }}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-semibold transition ${network === n.id ? "border-primary bg-primary-soft text-primary ring-2 ring-primary/30" : "border-border bg-card"}`}>
                  <img src={n.logo} alt={n.label} className="h-8 w-8 rounded-full object-cover" />
                  {n.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Phone Number">
            <input className={inputCls()} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08012345678" required />
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
          <PrimaryButton loading={m.isPending}>Buy Data</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
