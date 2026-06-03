import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { getDashboard } from "@/lib/services.functions";
import { initFunding, verifyFunding } from "@/lib/paystack.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { formatNaira } from "@/lib/catalog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/fund")({
  head: () => ({ meta: [{ title: "Fund Wallet · Danjasub" }] }),
  component: Page,
});

function Page() {
  const [amount, setAmount] = useState(1000);
  const dash = useServerFn(getDashboard);
  const init = useServerFn(initFunding);
  const verify = useServerFn(verifyFunding);
  const { data } = useQuery({ queryKey: ["dashboard"], queryFn: () => dash() });

  // Handle redirect-back from Paystack with ?reference=
  useEffect(() => {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("reference") || url.searchParams.get("trxref");
    if (ref) {
      verify({ data: { reference: ref } }).then((r: any) => {
        if (r.success) toast.success(`Wallet funded with ${formatNaira(r.amount)}`);
        else toast.error("Payment was not completed");
        url.searchParams.delete("reference");
        url.searchParams.delete("trxref");
        window.history.replaceState({}, "", url.toString());
      }).catch((e) => toast.error(e.message));
    }
  }, [verify]);

  const m = useMutation({
    mutationFn: (v: { amount: number }) => init({ data: v }),
    onSuccess: (r: any) => { window.location.href = r.authorization_url; },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Fund Wallet" />
      <FormShell>
        <div className="rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-elegant">
          <p className="text-xs opacity-90">Current Balance</p>
          <p className="mt-1 text-3xl font-bold">{formatNaira(data?.balance ?? 0)}</p>
        </div>
        <form className="mt-5 space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate({ amount: Number(amount) }); }}>
          <Field label="Amount (₦)">
            <input className={inputCls()} type="number" min={100} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </Field>
          <div className="flex flex-wrap gap-2">
            {[500, 1000, 2000, 5000, 10000].map((a) => (
              <button key={a} type="button" onClick={() => setAmount(a)} className="flex-1 rounded-xl border border-border bg-card py-2 text-xs font-semibold">
                ₦{a.toLocaleString()}
              </button>
            ))}
          </div>
          <PrimaryButton loading={m.isPending}>Pay with Paystack</PrimaryButton>
          <p className="text-center text-[11px] text-muted-foreground">
            You'll be redirected to Paystack to complete payment securely.
          </p>
        </form>
      </FormShell>
    </>
  );
}
