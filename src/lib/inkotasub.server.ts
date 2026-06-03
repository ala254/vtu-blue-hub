/**
 * Inkotasub VTU provider client.
 * NOTE: Public API docs were not available at build time. The endpoints,
 * payload shapes, and response parsing below follow common Nigerian VTU
 * provider conventions. Adjust to match Inkotasub's actual API once docs
 * are available — only this single file should need changes.
 */

const BASE = () =>
  (process.env.INKOTASUB_BASE_URL || "https://www.inkotasub.com/api/v1").replace(/\/$/, "");

function token() {
  const t = process.env.INKOTASUB_API_KEY;
  if (!t) throw new Error("INKOTASUB_API_KEY not configured");
  return t;
}

async function call<T = any>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Token ${token()}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Inkotasub error ${res.status}`);
  }
  return json as T;
}

export const inkotasub = {
  buyAirtime: (p: { network: string; amount: number; phone: string; ref: string }) =>
    call("/topup/", { network: p.network, amount: p.amount, mobile_number: p.phone, "Ported_number": true, airtime_type: "VTU", request_id: p.ref }),

  buyData: (p: { network: string; planId: string; phone: string; ref: string }) =>
    call("/data/", { network: p.network, plan: p.planId, mobile_number: p.phone, "Ported_number": true, request_id: p.ref }),

  buyElectricity: (p: { disco: string; meter: string; meterType: "prepaid" | "postpaid"; amount: number; phone: string; ref: string }) =>
    call("/billpayment/", { disco_name: p.disco, MeterType: p.meterType, meter_number: p.meter, amount: p.amount, phone: p.phone, request_id: p.ref }),

  buyCable: (p: { provider: string; plan: string; smartcard: string; ref: string }) =>
    call("/cablesub/", { cablename: p.provider, cableplan: p.plan, smart_card_number: p.smartcard, request_id: p.ref }),

  buyExamPin: (p: { examType: string; quantity: number; ref: string }) =>
    call("/epin/", { exam_name: p.examType, quantity: p.quantity, request_id: p.ref }),

  buyBetting: (p: { provider: string; customerId: string; amount: number; ref: string }) =>
    call("/betting/", { provider: p.provider, customer_id: p.customerId, amount: p.amount, request_id: p.ref }),
};
