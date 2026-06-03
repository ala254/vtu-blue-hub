import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getReferrals, applyReferral } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { formatNaira } from "@/lib/catalog";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/referrals")({
  head: () => ({ meta: [{ title: "Referrals · Danjasub" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(getReferrals);
  const apply = useServerFn(applyReferral);
  const { data, refetch } = useQuery({ queryKey: ["referrals"], queryFn: () => fn() });
  const [code, setCode] = useState("");
  const m = useMutation({
    mutationFn: (v: { code: string }) => apply({ data: v }),
    onSuccess: () => { toast.success("Referral applied!"); refetch(); setCode(""); },
    onError: (e: any) => toast.error(e.message),
  });

  function copy() {
    navigator.clipboard.writeText(data?.code ?? "");
    toast.success("Code copied");
  }

  return (
    <>
      <PageHeader title="Referrals" />
      <FormShell>
        <div className="rounded-3xl bg-gradient-card p-5 text-primary-foreground shadow-elegant">
          <p className="text-xs opacity-90">Total earnings</p>
          <p className="mt-1 text-3xl font-bold">{formatNaira(data?.total ?? 0)}</p>
          <p className="mt-1 text-xs opacity-90">{data?.count ?? 0} referrals · earn 2% on each transaction</p>
        </div>

        <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold text-muted-foreground">Your referral code</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xl font-bold tracking-widest text-primary">{data?.code ?? "—"}</span>
            <button onClick={copy} className="grid h-9 w-9 place-items-center rounded-full bg-primary-soft text-primary">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); m.mutate({ code: code.trim() }); }}>
          <Field label="Have a referral code? Enter it here">
            <input className={inputCls()} value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. ab12cd34" />
          </Field>
          <PrimaryButton loading={m.isPending}>Apply Code</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
