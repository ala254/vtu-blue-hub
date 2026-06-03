import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/paystack-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        if (!secret) return new Response("not configured", { status: 500 });
        const signature = request.headers.get("x-paystack-signature") || "";
        const body = await request.text();
        const expected = createHmac("sha512", secret).update(body).digest("hex");
        try {
          if (!signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return new Response("invalid signature", { status: 401 });
          }
        } catch {
          return new Response("invalid signature", { status: 401 });
        }
        const payload = JSON.parse(body);
        if (payload?.event === "charge.success") {
          const reference = payload.data.reference as string;
          const amount = Number(payload.data.amount) / 100;
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: intent } = await supabaseAdmin
            .from("payment_intents").select("*").eq("reference", reference).maybeSingle();
          if (intent && intent.status !== "successful") {
            await supabaseAdmin.from("payment_intents").update({ status: "successful" }).eq("reference", reference);
            await supabaseAdmin.rpc("credit_wallet", { _user_id: intent.user_id, _amount: amount });
            await supabaseAdmin.from("transactions").insert({
              user_id: intent.user_id,
              type: "fund",
              amount,
              status: "successful",
              reference,
              description: "Wallet funding (Paystack webhook)",
              metadata: { channel: payload.data.channel },
            });
          }
        }
        return new Response("ok");
      },
    },
  },
});
