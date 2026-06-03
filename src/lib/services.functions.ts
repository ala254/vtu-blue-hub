import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  DATA_PLANS,
  CABLE_PROVIDERS,
  EXAM_PINS,
} from "./catalog";

const REFERRAL_BONUS_RATE = 0.02; // 2% of spend

async function newRef(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function runService(opts: {
  userId: string;
  type: "data" | "airtime" | "electricity" | "cable" | "betting" | "exam_pin";
  amount: number;
  description: string;
  metadata: Record<string, unknown>;
  call: (ref: string) => Promise<any>;
}) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const reference = await newRef(opts.type);

  // Insert pending tx
  const { error: txErr } = await supabaseAdmin.from("transactions").insert({
    user_id: opts.userId,
    type: opts.type,
    amount: opts.amount,
    status: "pending",
    reference,
    description: opts.description,
    metadata: opts.metadata,
  });
  if (txErr) throw new Error(txErr.message);

  // Debit wallet atomically
  const { data: debited, error: debitErr } = await supabaseAdmin.rpc("debit_wallet", {
    _user_id: opts.userId,
    _amount: opts.amount,
  });
  if (debitErr) throw new Error(debitErr.message);
  if (!debited) {
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", description: "Insufficient balance" })
      .eq("reference", reference);
    throw new Error("Insufficient wallet balance. Please fund your wallet.");
  }

  // Call provider
  try {
    const providerResp = await opts.call(reference);
    await supabaseAdmin
      .from("transactions")
      .update({
        status: "successful",
        metadata: { ...opts.metadata, provider_response: providerResp },
      })
      .eq("reference", reference);

    // Referral bonus
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("referred_by")
      .eq("id", opts.userId)
      .maybeSingle();
    if (profile?.referred_by) {
      const bonus = Math.round(opts.amount * REFERRAL_BONUS_RATE * 100) / 100;
      if (bonus > 0) {
        await supabaseAdmin.rpc("credit_wallet", {
          _user_id: profile.referred_by,
          _amount: bonus,
        });
        const { data: txRow } = await supabaseAdmin
          .from("transactions")
          .select("id")
          .eq("reference", reference)
          .maybeSingle();
        await supabaseAdmin.from("referral_earnings").insert({
          referrer_id: profile.referred_by,
          referred_user_id: opts.userId,
          transaction_id: txRow?.id ?? null,
          amount: bonus,
        });
      }
    }

    return { success: true, reference };
  } catch (e: any) {
    // Refund
    await supabaseAdmin.rpc("credit_wallet", { _user_id: opts.userId, _amount: opts.amount });
    await supabaseAdmin
      .from("transactions")
      .update({ status: "failed", description: e?.message ?? "Provider error" })
      .eq("reference", reference);
    throw new Error(e?.message || "Service failed and your wallet was refunded.");
  }
}

export const buyAirtime = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      network: z.string().min(1),
      phone: z.string().min(10).max(15),
      amount: z.number().min(50).max(50000),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { inkotasub } = await import("@/lib/inkotasub.server");
    return runService({
      userId: context.userId,
      type: "airtime",
      amount: data.amount,
      description: `Airtime ${data.network.toUpperCase()} - ${data.phone}`,
      metadata: { ...data },
      call: (ref) => inkotasub.buyAirtime({ ...data, ref }),
    });
  });

export const buyData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      network: z.string().min(1),
      planId: z.string().min(1),
      phone: z.string().min(10).max(15),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const plan = DATA_PLANS[data.network]?.find((p) => p.id === data.planId);
    if (!plan) throw new Error("Invalid data plan");
    const { inkotasub } = await import("@/lib/inkotasub.server");
    return runService({
      userId: context.userId,
      type: "data",
      amount: plan.price,
      description: `Data ${data.network.toUpperCase()} ${plan.label} - ${data.phone}`,
      metadata: { ...data, planLabel: plan.label },
      call: (ref) => inkotasub.buyData({ ...data, ref }),
    });
  });

export const buyElectricity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      disco: z.string().min(1),
      meter: z.string().min(5).max(30),
      meterType: z.enum(["prepaid", "postpaid"]),
      amount: z.number().min(500).max(500000),
      phone: z.string().min(10).max(15),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { inkotasub } = await import("@/lib/inkotasub.server");
    return runService({
      userId: context.userId,
      type: "electricity",
      amount: data.amount,
      description: `Electricity ${data.disco} - ${data.meter}`,
      metadata: { ...data },
      call: (ref) => inkotasub.buyElectricity({ ...data, ref }),
    });
  });

export const buyCable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      provider: z.string().min(1),
      planId: z.string().min(1),
      smartcard: z.string().min(8).max(20),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const prov = CABLE_PROVIDERS.find((p) => p.id === data.provider);
    const plan = prov?.plans.find((p) => p.id === data.planId);
    if (!plan) throw new Error("Invalid cable plan");
    const { inkotasub } = await import("@/lib/inkotasub.server");
    return runService({
      userId: context.userId,
      type: "cable",
      amount: plan.price,
      description: `Cable ${prov!.label} ${plan.label} - ${data.smartcard}`,
      metadata: { ...data, planLabel: plan.label },
      call: (ref) => inkotasub.buyCable({ provider: data.provider, plan: data.planId, smartcard: data.smartcard, ref }),
    });
  });

export const buyExamPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      examId: z.string().min(1),
      quantity: z.number().int().min(1).max(10),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const exam = EXAM_PINS.find((e) => e.id === data.examId);
    if (!exam) throw new Error("Invalid exam");
    const total = exam.price * data.quantity;
    const { inkotasub } = await import("@/lib/inkotasub.server");
    return runService({
      userId: context.userId,
      type: "exam_pin",
      amount: total,
      description: `${exam.label} pin x${data.quantity}`,
      metadata: { ...data, examLabel: exam.label, unit: exam.price },
      call: (ref) => inkotasub.buyExamPin({ examType: data.examId, quantity: data.quantity, ref }),
    });
  });

export const buyBetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z.object({
      provider: z.string().min(1),
      customerId: z.string().min(3).max(30),
      amount: z.number().min(100).max(500000),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { inkotasub } = await import("@/lib/inkotasub.server");
    return runService({
      userId: context.userId,
      type: "betting",
      amount: data.amount,
      description: `Betting ${data.provider} - ${data.customerId}`,
      metadata: { ...data },
      call: (ref) => inkotasub.buyBetting({ ...data, ref }),
    });
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: wallet }, { data: transactions }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("wallets").select("balance").eq("user_id", userId).maybeSingle(),
      supabase
        .from("transactions")
        .select("id, type, amount, status, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);
    return {
      profile,
      balance: Number(wallet?.balance ?? 0),
      recent: transactions ?? [],
    };
  });

export const getTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("transactions")
      .select("id, type, amount, status, description, reference, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    return data ?? [];
  });

export const getReferrals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [{ data: profile }, { data: earnings }] = await Promise.all([
      supabase.from("profiles").select("referral_code").eq("id", userId).maybeSingle(),
      supabase
        .from("referral_earnings")
        .select("amount, created_at")
        .eq("referrer_id", userId)
        .order("created_at", { ascending: false }),
    ]);
    const total = (earnings ?? []).reduce((s, e: any) => s + Number(e.amount), 0);
    return {
      code: profile?.referral_code ?? "",
      total,
      count: earnings?.length ?? 0,
      earnings: earnings ?? [],
    };
  });

export const applyReferral = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ code: z.string().min(4).max(20) }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: me } = await supabaseAdmin
      .from("profiles").select("referred_by, referral_code").eq("id", context.userId).maybeSingle();
    if (me?.referred_by) throw new Error("Referral already applied");
    if (me?.referral_code === data.code) throw new Error("You can't refer yourself");
    const { data: referrer } = await supabaseAdmin
      .from("profiles").select("id").eq("referral_code", data.code).maybeSingle();
    if (!referrer) throw new Error("Invalid referral code");
    const { error } = await supabaseAdmin
      .from("profiles").update({ referred_by: referrer.id }).eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { success: true };
  });
