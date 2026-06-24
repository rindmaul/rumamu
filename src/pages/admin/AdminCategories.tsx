import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Upload,
  Loader2,
  ImageOff,
} from "lucide-react";
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadProductImage,
  type CategoryWritePayload,
} from "../../services/products";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { slugify } from "../../lib/format";
import type { Category } from "../../lib/types";

interface FormState {
  name: string;
  slug: string;
  blurb: string;
  image_url: string;
}

const blank: FormState = { name: "", slug: "", blurb: "", image_url: "" };

export default function AdminCategories() {
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null); // null when closed
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blank);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setCategories(await listCategories());
    } catch {
      show("Gagal memuat kategori.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setSlugTouched(false);
    setIsOpen(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      blurb: c.blurb ?? "",
      image_url: c.image_url ?? "",
    });
    setSlugTouched(true);
    setIsOpen(true);
  }

  function setName(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugTouched ? f.slug : slugify(value),
    }));
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isSupabaseConfigured) {
      show("Upload gambar memerlukan Supabase Storage.", "error");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      show("Gambar berhasil diunggah.", "success");
    } catch (err) {
      show(err instanceof Error ? err.message : "Gagal mengunggah gambar.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      show("Menyimpan kategori memerlukan Supabase.", "error");
      return;
    }
    if (!form.name.trim()) return show("Nama kategori wajib diisi.", "error");
    const slug = slugify(form.slug || form.name);
    if (!slug) return show("Slug wajib diisi.", "error");

    const payload: CategoryWritePayload = {
      name: form.name.trim(),
      slug,
      blurb: form.blurb.trim(),
      image_url: form.image_url.trim(),
    };

    setSaving(true);
    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        show("Kategori diperbarui.", "success");
      } else {
        await createCategory(payload);
        show("Kategori ditambahkan.", "success");
      }
      setIsOpen(false);
      await load();
    } catch (err) {
      show(err instanceof Error ? err.message : "Gagal menyimpan kategori.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await deleteCategory(confirmDelete.id);
      show(`Kategori ${confirmDelete.name} dihapus.`, "success");
      setConfirmDelete(null);
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "Gagal menghapus.", "error");
    } finally {
      setBusyId(null);
    }
  }

  const label = "text-sm font-medium text-slate-700";
  const input =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Kategori</h1>
          <p className="text-sm text-slate-500">
            {categories.length} kategori terdaftar.
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Tambah kategori
        </button>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.9} />
          Mode pratinjau: kategori dari fallback lokal. Tambah, edit, dan hapus aktif
          setelah Supabase dikonfigurasi (dan migrasi 0003 dijalankan).
        </div>
      )}

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Deskripsi</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Memuat...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                    Belum ada kategori.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          {c.image_url ? (
                            <img
                              src={c.image_url}
                              alt={c.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <ImageOff
                              className="h-4 w-4 text-slate-300"
                              strokeWidth={1.7}
                            />
                          )}
                        </div>
                        <p className="font-medium text-slate-800">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{c.slug}</td>
                    <td className="max-w-xs px-4 py-3 text-slate-600">
                      <span className="line-clamp-1">{c.blurb || "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Edit ${c.name}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(c)}
                          aria-label={`Hapus ${c.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.9} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / edit modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" strokeWidth={1.9} />
            </button>
            <h2 className="text-lg font-semibold text-slate-900">
              {editing ? "Edit kategori" : "Tambah kategori"}
            </h2>

            <form onSubmit={onSubmit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={label}>Nama kategori</label>
                  <input
                    className={input}
                    value={form.name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dekorasi"
                  />
                </div>
                <div>
                  <label className={label}>Slug</label>
                  <input
                    className={input}
                    value={form.slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                    placeholder="dekorasi"
                  />
                </div>
              </div>

              <div>
                <label className={label}>Deskripsi singkat</label>
                <input
                  className={input}
                  value={form.blurb}
                  onChange={(e) => setForm((f) => ({ ...f, blurb: e.target.value }))}
                  placeholder="Sentuhan akhir untuk tiap ruang."
                />
              </div>

              <div>
                <label className={label}>Gambar kategori</label>
                <div className="mt-1.5 flex items-center gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {form.image_url ? (
                      <img
                        src={form.image_url}
                        alt="Pratinjau"
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <ImageOff className="h-5 w-5 text-slate-300" strokeWidth={1.7} />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onUpload}
                      className="hidden"
                      id="category-image"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                      ) : (
                        <Upload className="h-4 w-4" strokeWidth={1.9} />
                      )}
                      Unggah
                    </button>
                    <input
                      className={`${input} mt-2`}
                      value={form.image_url}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, image_url: e.target.value }))
                      }
                      placeholder="atau tempel URL gambar"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
                  {editing ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Hapus kategori ini?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {confirmDelete.name} akan dihapus. Produk yang memakai kategori ini tetap
              ada, namun menjadi tanpa kategori.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={onDelete}
                disabled={busyId === confirmDelete.id}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
