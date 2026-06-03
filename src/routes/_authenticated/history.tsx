import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getTransactions } from "@/lib/services.functions";
import { PageHeader } from "@/components/page-shell";
import { TxStatusBadge, typeLabel } from "@/components/tx-badge";
import { formatNaira } from "@/lib/catalog";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "History · Danjasub" }] }),
  component: Page,
});

function Page() {
  const fn = useServerFn(getTransactions);
  const { data, isLoading } = useQuery({ queryKey: ["transactions"], queryFn: () => fn() });
  return (
    <>
      <PageHeader title="Transaction History" />
      <div className="mx-auto max-w-md space-y-2 px-5 pb-10">
        {isLoading && <p className="text-center text-sm text-muted-foreground">Loading…</p>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="rounded-2xl bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
            No transactions yet.
          </div>
        )}
        {data?.map((t: any) => (
          <div key={t.id} className="rounded-2xl bg-card p-3 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{t.description || typeLabel(t.type)}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                <TxStatusBadge status={t.status} />
              </div>
              <p className="whitespace-nowrap text-sm font-bold">{formatNaira(Number(t.amount))}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
