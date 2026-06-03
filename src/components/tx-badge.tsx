export function typeLabel(t: string) {
  return ({
    data: "Data", airtime: "Airtime", electricity: "Electricity",
    cable: "Cable TV", betting: "Betting", exam_pin: "Exam Pin",
    fund: "Wallet Funding", referral: "Referral Bonus",
  } as Record<string, string>)[t] ?? t;
}

export function TxStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    successful: "bg-success/15 text-success",
    pending: "bg-amber-500/15 text-amber-600",
    failed: "bg-destructive/15 text-destructive",
    reversed: "bg-muted text-muted-foreground",
  };
  return (
    <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}
