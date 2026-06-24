import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  archiveProduct,
  deleteProduct,
  listAllProducts,
  listCategories,
  restoreProduct,
} from "../../services/products";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { formatRupiah } from "../../lib/format";
import type { Category, Product } from "../../lib/types";

export default function AdminProducts() {
  const { show } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setProducts(await listAllProducts());
    } catch {
      show("Gagal memuat produk.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (cat !== "all") list = list.filter((p) => p.category_slug === cat);
    return list;
  }, [products, search, cat]);

  async function onArchiveToggle(p: Product) {
    setBusyId(p.id);
    try {
      if (p.is_active) {
        await archiveProduct(p.id);
        show(`${p.name} diarsipkan.`, "success");
      } else {
        await restoreProduct(p.id);
        show(`${p.name} dipulihkan.`, "success");
      }
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "Gagal memperbarui.", "error");
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete() {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    try {
      await deleteProduct(confirmDelete.id);
      show(`${confirmDelete.name} dihapus.`, "success");
      setConfirmDelete(null);
      await load();
    } catch (e) {
      show(e instanceof Error ? e.message : "Gagal menghapus.", "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Produk</h1>
          <p className="text-sm text-slate-500">{products.length} produk terdaftar.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Tambah produk
        </Link>
      </div>

      {!isSupabaseConfigured && (
        <div className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.9} />
          Mode pratinjau: data produk dari fallback lokal. Tambah, edit, arsip, dan hapus
          aktif setelah Supabase dikonfigurasi.
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-5 flex flex-wrap gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" strokeWidth={1.9} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama produk..."
            className="h-10 flex-1 bg-transparent text-sm text-slate-700 focus:outline-none"
          />
        </div>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none"
        >
          <option value="all">Semua kategori</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produk</th>
                <th className="px-4 py-3 font-medium">Kategori</th>
                <th className="px-4 py-3 font-medium">Harga</th>
                <th className="px-4 py-3 font-medium">Stok</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Memuat...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Tidak ada produk yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-full w-full object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{p.name}</p>
                          {p.subtitle && (
                            <p className="text-xs text-slate-400">{p.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.category_name}</td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">{p.stock}</td>
                    <td className="px-4 py-3">
                      {!p.is_active ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          Diarsip
                        </span>
                      ) : p.stock > 0 && p.status === "Tersedia" ? (
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                          Tersedia
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                          Habis
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="h-4 w-4" strokeWidth={1.9} />
                        </Link>
                        <button
                          onClick={() => onArchiveToggle(p)}
                          disabled={busyId === p.id}
                          aria-label={p.is_active ? "Arsipkan" : "Pulihkan"}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                        >
                          {p.is_active ? (
                            <Archive className="h-4 w-4" strokeWidth={1.9} />
                          ) : (
                            <ArchiveRestore className="h-4 w-4" strokeWidth={1.9} />
                          )}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(p)}
                          aria-label={`Hapus ${p.name}`}
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

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setConfirmDelete(null)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setConfirmDelete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              aria-label="Tutup"
            >
              <X className="h-5 w-5" strokeWidth={1.9} />
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" strokeWidth={1.9} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Hapus produk ini?
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {confirmDelete.name} akan dihapus permanen. Untuk menyembunyikan dari
              katalog tanpa menghapus, gunakan arsip.
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
                Hapus permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
