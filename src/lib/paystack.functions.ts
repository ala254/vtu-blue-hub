import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const initFunding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ amount: z.number().min(100).max(1000000) }).parse(i))
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Payment provider not configured. Add PAYSTACK_SECRET_KEY.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin
      .from("profiles").select("email").eq("id", context.userId).maybeSingle();
    const email = profile?.email || context.claims?.email;
    if (!email) throw new Error("Email not found on profile");

    const reference = `fund_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    await supabaseAdmin.from("payment_intents").insert({
      user_id: context.userId,
      reference,
      amount: data.amount,
      status: "pending",
    });

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(data.amount * 100), // kobo
        reference,
        metadata: { user_id: context.userId },
      }),
    });
    const json: any = await res.json();
    if (!res.ok || !json?.status) throw new Error(json?.message || "Failed to init payment");
    return {
      authorization_url: json.data.authorization_url as string,
      reference: json.data.reference as string,
    };
  });

export const verifyFunding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ reference: z.string().min(4) }).parse(i))
  .handler(async ({ data, context }) => {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) throw new Error("Payment provider not configured.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: intent } = await supabaseAdmin
      .from("payment_intents").select("*").eq("reference", data.reference).maybeSingle();
    if (!intent || intent.user_id !== context.userId) throw new Error("Unknown reference");
    if (intent.status === "successful") return { success: true, amount: Number(intent.amount) };

    const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(data.reference)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const json: any = await res.json();
    if (!res.ok || !json?.status) throw new Error(json?.message || "Verification failed");

    if (json.data.status === "success") {
      const amount = Number(json.data.amount) / 100;
      await supabaseAdmin.from("payment_intents").update({ status: "successful" }).eq("reference", data.reference);
      await supabaseAdmin.rpc("credit_wallet", { _user_id: context.userId, _amount: amount });
      await supabaseAdmin.from("transactions").insert({
        user_id: context.userId,
        type: "fund",
        amount,
        status: "successful",
        reference: data.reference,
        description: "Wallet funding (Paystack)",
        metadata: { channel: json.data.channel },
      });
      return { success: true, amount };
    }
    await supabaseAdmin.from("payment_intents").update({ status: "failed" }).eq("reference", data.reference);
    return { success: false, amount: 0 };
  });
