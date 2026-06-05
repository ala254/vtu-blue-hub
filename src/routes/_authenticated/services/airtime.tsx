import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { NETWORKS } from "@/lib/catalog";
import { buyAirtime } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/airtime")({
  head: () => ({ meta: [{ title: "Buy Airtime · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [network, setNetwork] = useState("mtn");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(100);
  const fn = useServerFn(buyAirtime);
  const m = useMutation({
    mutationFn: (v: any) => fn({ data: v }),
    onSuccess: () => { toast.success("Airtime purchase successful"); nav({ to: "/history" }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Buy Airtime" />
      <FormShell>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate({ network, phone, amount: Number(amount) }); }}>
          <Field label="Network">
            <div className="grid grid-cols-4 gap-2">
              {NETWORKS.map((n) => (
                <button type="button" key={n.id} onClick={() => setNetwork(n.id)}
                  className={`flex flex-col items-center gap-1 rounded-xl border p-2 text-[11px] font-semibold transition ${network === n.id ? "border-primary bg-primary-soft text-primary ring-2 ring-primary/30" : "border-border bg-card"}`}>
                  <img src={n.logo} alt={n.label} className="h-8 w-8 rounded-full object-cover" />
                  {n.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Phone Number">
            <input className={inputCls()} value={phone} onChange={(e) => setPhone(e.target.value)} required placeholder="08012345678" />
          </Field>
          <Field label="Amount (₦)">
            <input className={inputCls()} type="number" min={50} max={50000} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </Field>
          <div className="flex gap-2">
            {[100, 200, 500, 1000, 2000].map((a) => (
              <button key={a} type="button" onClick={() => setAmount(a)} className="flex-1 rounded-xl border border-border bg-card py-2 text-xs font-semibold">
                ₦{a}
              </button>
            ))}
          </div>
          <PrimaryButton loading={m.isPending}>Buy Airtime</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
