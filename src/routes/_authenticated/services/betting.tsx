import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BETTING_PROVIDERS } from "@/lib/catalog";
import { buyBetting } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/betting")({
  head: () => ({ meta: [{ title: "Betting · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [provider, setProvider] = useState(BETTING_PROVIDERS[0].id);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState(500);
  const fn = useServerFn(buyBetting);
  const m = useMutation({
    mutationFn: (v: any) => fn({ data: v }),
    onSuccess: () => { toast.success("Funded successfully"); nav({ to: "/history" }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Fund Betting Account" />
      <FormShell>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate({ provider, customerId, amount: Number(amount) }); }}>
          <Field label="Provider">
            <select className={inputCls()} value={provider} onChange={(e) => setProvider(e.target.value)}>
              {BETTING_PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </Field>
          <Field label="Customer / User ID">
            <input className={inputCls()} value={customerId} onChange={(e) => setCustomerId(e.target.value)} required />
          </Field>
          <Field label="Amount (₦)">
            <input className={inputCls()} type="number" min={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </Field>
          <PrimaryButton loading={m.isPending}>Fund Account</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
