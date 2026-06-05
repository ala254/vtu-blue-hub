import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const SIGNED_TTL = 60 * 60 * 24 * 7; // 7 days

async function signIfPath(adminClient: any, urlOrPath: string): Promise<string> {
  if (!urlOrPath) return urlOrPath;
  if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) return urlOrPath;
  const { data } = await adminClient.storage.from("banners").createSignedUrl(urlOrPath, SIGNED_TTL);
  return data?.signedUrl ?? "";
}

export const listActiveBanners = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("banners")
    .select("id,image_url,title,description,target_link,sort_order,created_at")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  const banners = await Promise.all(
    (data ?? []).map(async (b) => ({ ...b, image_url: await signIfPath(supabaseAdmin, b.image_url) })),
  );
  return { banners };
});

export const listAllBanners = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isAdmin = await supabaseAdmin.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    const { data, error } = await supabaseAdmin
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw error;
    const banners = await Promise.all(
      (data ?? []).map(async (b) => ({ ...b, image_url: await signIfPath(supabaseAdmin, b.image_url) })),
    );
    return { banners };
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  image_url: z.string().min(1).max(2048),
  title: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  target_link: z.string().max(2048).optional().nullable(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const upsertBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isAdmin = await supabaseAdmin.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    if (data.id) {
      const { error } = await supabaseAdmin.from("banners").update(data).eq("id", data.id);
      if (error) throw error;
    } else {
      const { id: _omit, ...insert } = data;
      const { error } = await supabaseAdmin.from("banners").insert(insert);
      if (error) throw error;
    }
    return { ok: true };
  });

export const deleteBanner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isAdmin = await supabaseAdmin.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    const { data: existing } = await supabaseAdmin.from("banners").select("image_url").eq("id", data.id).single();
    if (existing?.image_url && !existing.image_url.startsWith("http")) {
      await supabaseAdmin.storage.from("banners").remove([existing.image_url]);
    }
    const { error } = await supabaseAdmin.from("banners").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const uploadBannerImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { filename: string; contentType: string; base64: string }) =>
    z.object({
      filename: z.string().min(1).max(255),
      contentType: z.string().regex(/^image\//).max(100),
      base64: z.string().min(1).max(8_000_000),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const isAdmin = await supabaseAdmin.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin.data) throw new Error("Forbidden");
    const buf = Buffer.from(data.base64, "base64");
    const safe = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${Date.now()}-${safe}`;
    const { error } = await supabaseAdmin.storage.from("banners").upload(path, buf, {
      contentType: data.contentType,
      upsert: false,
    });
    if (error) throw error;
    const { data: signed } = await supabaseAdmin.storage.from("banners").createSignedUrl(path, SIGNED_TTL);
    return { path, signedUrl: signed?.signedUrl ?? "" };
  });

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return { isAdmin: !!data };
  });
