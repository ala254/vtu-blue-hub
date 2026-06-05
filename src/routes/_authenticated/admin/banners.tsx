import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listAllBanners,
  upsertBanner,
  deleteBanner,
  uploadBannerImage,
  isCurrentUserAdmin,
} from "@/lib/banners.functions";
import { toast } from "sonner";
import { ArrowLeft, Plus, Pencil, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({ meta: [{ title: "Banners · Admin" }] }),
  component: AdminBanners,
});

type Form = {
  id?: string;
  image_url: string;
  title: string;
  description: string;
  target_link: string;
  is_active: boolean;
  sort_order: number;
};

const empty: Form = { image_url: "", title: "", description: "", target_link: "", is_active: true, sort_order: 0 };

function AdminBanners() {
  const qc = useQueryClient();
  const checkAdmin = useServerFn(isCurrentUserAdmin);
  const listFn = useServerFn(listAllBanners);
  const upsertFn = useServerFn(upsertBanner);
  const deleteFn = useServerFn(deleteBanner);
  const uploadFn = useServerFn(uploadBannerImage);

  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdmin() });
  const banners = useQuery({
    queryKey: ["banners", "all"],
    queryFn: () => listFn(),
    enabled: !!admin.data?.isAdmin,
  });

  const [form, setForm] = useState<Form>(empty);
  const [uploading, setUploading] = useState(false);

  const save = useMutation({
    mutationFn: (f: Form) =>
      upsertFn({
        data: {
          ...(f.id ? { id: f.id } : {}),
          image_url: f.image_url,
          title: f.title,
          description: f.description || null,
          target_link: f.target_link || null,
          is_active: f.is_active,
          sort_order: Number(f.sort_order) || 0,
        },
      }),
    onSuccess: () => {
      toast.success("Saved");
      setForm(empty);
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["banners"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  async function handleFile(file: File) {
    if (file.size > 4_000_000) {
      toast.error("Max 4 MB");
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
        r.onerror = reject;
        r.readAsDataURL(file);
      });
      const res = await uploadFn({
        data: { filename: file.name, contentType: file.type, base64 },
      });
      setForm((f) => ({ ...f, image_url: (res as any).path }));
      toast.success("Image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (admin.isLoading) return <div className="p-5 text-sm text-muted-foreground">Loading…</div>;
  if (!admin.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-md p-5 text-center">
        <h1 className="text-lg font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account does not have admin access. Add a row in <code>user_roles</code> with your user id and role <code>admin</code>.
        </p>
        <Link to="/home" className="mt-4 inline-block text-sm font-semibold text-primary">Back home</Link>
      </div>
    );
  }

  const list = (banners.data as any)?.banners ?? [];

  return (
    <div className="mx-auto max-w-md px-5 pb-10">
      <header className="flex items-center justify-between py-5">
        <Link to="/home" className="flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft className="h-4 w-4" /> Banners
        </Link>
      </header>

      <section className="rounded-2xl bg-card p-4 shadow-card">
        <h2 className="mb-3 text-sm font-bold">{form.id ? "Edit banner" : "New banner"}</h2>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-semibold">Image</span>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary-soft px-3 py-2 text-xs font-semibold text-primary">
                <Upload className="h-3.5 w-3.5" /> {uploading ? "Uploading…" : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </label>
              <input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="or paste image URL / storage path"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs"
              />
            </div>
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Title"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Description"
            rows={2}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <input
            value={form.target_link}
            onChange={(e) => setForm({ ...form, target_link: e.target.value })}
            placeholder="Target link (e.g. /services/data or https://…)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold">
              Sort
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs"
              />
            </label>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              disabled={!form.image_url || !form.title || save.isPending}
              onClick={() => save.mutate(form)}
              className="inline-flex items-center gap-1 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-elegant disabled:opacity-50"
            >
              <Plus className="h-3.5 w-3.5" /> {form.id ? "Update" : "Create"}
            </button>
            {form.id && (
              <button onClick={() => setForm(empty)} className="rounded-full border border-border px-4 py-2 text-xs font-semibold">
                Cancel
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h2 className="text-sm font-bold">All banners</h2>
        {banners.isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!banners.isLoading && list.length === 0 && (
          <div className="rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground shadow-card">
            No banners yet.
          </div>
        )}
        {list.map((b: any) => (
          <div key={b.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
            <img src={b.image_url} alt={b.title} className="h-14 w-20 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{b.title}</p>
              <p className="truncate text-xs text-muted-foreground">{b.description || "—"}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {b.is_active ? "Active" : "Inactive"} · sort {b.sort_order}
              </p>
            </div>
            <button
              onClick={() =>
                setForm({
                  id: b.id,
                  image_url: b.image_url,
                  title: b.title,
                  description: b.description ?? "",
                  target_link: b.target_link ?? "",
                  is_active: b.is_active,
                  sort_order: b.sort_order,
                })
              }
              className="grid h-8 w-8 place-items-center rounded-full bg-primary-soft text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => confirm("Delete banner?") && remove.mutate(b.id)}
              className="grid h-8 w-8 place-items-center rounded-full bg-destructive/10 text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
