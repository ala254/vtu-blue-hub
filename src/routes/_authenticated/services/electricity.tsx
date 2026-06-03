import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { DISCOS } from "@/lib/catalog";
import { buyElectricity } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/electricity")({
  head: () => ({ meta: [{ title: "Electricity · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [disco, setDisco] = useState(DISCOS[0].id);
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid");
  const [meter, setMeter] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState(1000);
  const fn = useServerFn(buyElectricity);
  const m = useMutation({
    mutationFn: (v: any) => fn({ data: v }),
    onSuccess: () => { toast.success("Payment successful"); nav({ to: "/history" }); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Electricity Bill" />
      <FormShell>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate({ disco, meterType, meter, phone, amount: Number(amount) }); }}>
          <Field label="Disco">
            <select className={inputCls()} value={disco} onChange={(e) => setDisco(e.target.value)}>
              {DISCOS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
            </select>
          </Field>
          <Field label="Meter Type">
            <div className="grid grid-cols-2 gap-2">
              {(["prepaid", "postpaid"] as const).map((mt) => (
                <button type="button" key={mt} onClick={() => setMeterType(mt)}
                  className={`rounded-xl border py-2 text-xs font-semibold capitalize ${meterType === mt ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}>
                  {mt}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Meter Number">
            <input className={inputCls()} value={meter} onChange={(e) => setMeter(e.target.value)} required />
          </Field>
          <Field label="Phone Number">
            <input className={inputCls()} value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </Field>
          <Field label="Amount (₦)">
            <input className={inputCls()} type="number" min={500} value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </Field>
          <PrimaryButton loading={m.isPending}>Pay Bill</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
