import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { EXAM_PINS, formatNaira } from "@/lib/catalog";
import { buyExamPin } from "@/lib/services.functions";
import { PageHeader, FormShell, Field, inputCls, PrimaryButton } from "@/components/page-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/services/exam-pin")({
  head: () => ({ meta: [{ title: "Exam Pins · Danjasub" }] }),
  component: Page,
});

function Page() {
  const nav = useNavigate();
  const [examId, setExamId] = useState(EXAM_PINS[0].id);
  const [quantity, setQuantity] = useState(1);
  const fn = useServerFn(buyExamPin);
  const m = useMutation({
    mutationFn: (v: any) => fn({ data: v }),
    onSuccess: () => { toast.success("Pin purchase successful"); nav({ to: "/history" }); },
    onError: (e: any) => toast.error(e.message),
  });
  const exam = EXAM_PINS.find((e) => e.id === examId)!;
  return (
    <>
      <PageHeader title="Buy Exam Pin" />
      <FormShell>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); m.mutate({ examId, quantity: Number(quantity) }); }}>
          <Field label="Exam">
            <div className="grid grid-cols-2 gap-2">
              {EXAM_PINS.map((x) => (
                <button type="button" key={x.id} onClick={() => setExamId(x.id)}
                  className={`rounded-xl border p-3 text-left ${examId === x.id ? "border-primary bg-primary-soft text-primary" : "border-border bg-card"}`}>
                  <div className="text-sm font-semibold">{x.label}</div>
                  <div className="text-xs">{formatNaira(x.price)}</div>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Quantity">
            <input className={inputCls()} type="number" min={1} max={10} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </Field>
          <div className="rounded-xl bg-primary-soft p-3 text-sm">
            Total: <span className="font-bold text-primary">{formatNaira(exam.price * quantity)}</span>
          </div>
          <PrimaryButton loading={m.isPending}>Buy Pin</PrimaryButton>
        </form>
      </FormShell>
    </>
  );
}
