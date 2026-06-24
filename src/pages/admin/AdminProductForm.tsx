import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Loader2, ImageOff, X } from "lucide-react";
import {
  createProduct,
  getProductById,
  updateProduct,
  uploadProductImage,
  listCategories,
  type ProductWritePayload,
} from "../../services/products";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { slugify } from "../../lib/format";
import type { Category } from "../../lib/types";

interface FormState {
  name: string;
  subtitle: string;
  slug: string;
  category_slug: string;
  price: string;
  sale_price: string;
  stock: string;
  status: string;
  dimensions: string;
  material: string;
  shipping: string;
  description: string;
  image_url: string;
  images: string[];
  is_featured: boolean;
}

const blank: FormState = {
  name: "",
  subtitle: "",
  slug: "",
  category_slug: "",
  price: "",
  sale_price: "",
  stock: "",
  status: "Tersedia",
  dimensions: "",
  material: "",
  shipping: "",
  description: "",
  image_url: "",
  images: [],
  is_featured: false,
};

// Product page shows the image ~500px wide (≈1000px on HD/retina screens), so
// anything smaller upscales and looks blurry. Warn below this.
const MIN_IMG_PX = 1000;

function getImageDims(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ w: img.naturalWidth, h: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve({ w: Infinity, h: Infinity });
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { show } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(blank);
  const [cats, setCats] = useState<Category[]>([]);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);

  // Load categories from the DB so newly added ones are selectable. Default a
  // new product to the first category once they arrive.
  useEffect(() => {
    listCategories()
      .then((list) => {
        setCats(list);
        if (!isEdit && list[0]) {
          setForm((f) => (f.category_slug ? f : { ...f, category_slug: list[0].slug }));
        }
      })
      .catch(() => show("Gagal memuat kategori.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    getProductById(id!)
      .then((p) => {
        if (!p) {
          show("Produk tidak ditemukan.", "error");
          navigate("/admin/products");
          return;
        }
        setForm({
          name: p.name,
          subtitle: p.subtitle ?? "",
          slug: p.slug,
          category_slug: p.category_slug,
          price: String(p.price),
          sale_price: p.sale_price != null ? String(p.sale_price) : "",
          stock: String(p.stock),
          status: p.status,
          dimensions: p.dimensions,
          material: p.material,
          shipping: p.shipping,
          description: p.description,
          image_url: p.image_url,
          images: p.images ?? [],
          is_featured: p.is_featured,
        });
        setSlugTouched(true);
      })
      .catch(() => show("Gagal memuat produk.", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      const { w, h } = await getImageDims(file);
      const url = await uploadProductImage(file);
      setForm((f) => ({ ...f, image_url: url }));
      if (Math.max(w, h) < MIN_IMG_PX) {
        show(
          `Gambar terunggah, tapi resolusinya rendah (${w}×${h}px). Unggah minimal ${MIN_IMG_PX}px agar tajam di halaman produk.`,
          "error"
        );
      } else {
        show("Gambar berhasil diunggah.", "success");
      }
    } catch (err) {
      show(err instanceof Error ? err.message : "Gagal mengunggah gambar.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Upload one or more additional gallery images and append their URLs.
  async function onGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    if (!isSupabaseConfigured) {
      show("Upload gambar memerlukan Supabase Storage.", "error");
      return;
    }
    setGalleryUploading(true);
    try {
      const dims = await Promise.all(files.map(getImageDims));
      const urls = await Promise.all(files.map((f) => uploadProductImage(f)));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
      const lowRes = dims.filter((d) => Math.max(d.w, d.h) < MIN_IMG_PX).length;
      if (lowRes > 0) {
        show(
          `${urls.length} gambar ditambahkan. ${lowRes} di antaranya beresolusi rendah (<${MIN_IMG_PX}px) dan bisa terlihat buram.`,
          "error"
        );
      } else {
        show(`${urls.length} gambar ditambahkan ke galeri.`, "success");
      }
    } catch (err) {
      show(err instanceof Error ? err.message : "Gagal mengunggah gambar.", "error");
    } finally {
      setGalleryUploading(false);
      if (galleryRef.current) galleryRef.current.value = "";
    }
  }

  function removeGalleryImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      show("Menyimpan produk memerlukan Supabase.", "error");
      return;
    }
    const price = Number(form.price);
    const stock = Number(form.stock);
    const hasSale = form.sale_price.trim() !== "";
    const sale_price = hasSale ? Number(form.sale_price) : null;
    if (!form.name.trim()) return show("Nama produk wajib diisi.", "error");
    if (!form.slug.trim()) return show("Slug wajib diisi.", "error");
    if (Number.isNaN(price) || price < 0) return show("Harga tidak valid.", "error");
    if (Number.isNaN(stock) || stock < 0) return show("Stok tidak valid.", "error");
    if (hasSale && (Number.isNaN(sale_price!) || sale_price! <= 0 || sale_price! >= price))
      return show("Harga promo harus lebih kecil dari harga normal.", "error");

    const payload: ProductWritePayload = {
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || null,
      slug: slugify(form.slug),
      category_slug: form.category_slug,
      price,
      sale_price,
      stock,
      dimensions: form.dimensions.trim(),
      material: form.material.trim(),
      shipping: form.shipping.trim(),
      description: form.description.trim(),
      image_url: form.image_url.trim(),
      images: form.images.map((u) => u.trim()).filter(Boolean),
      status: stock > 0 ? form.status : "Habis",
      is_featured: form.is_featured,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id!, payload);
        show("Produk diperbarui.", "success");
      } else {
        await createProduct(payload);
        show("Produk ditambahkan.", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      show(err instanceof Error ? err.message : "Gagal menyimpan produk.", "error");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2} /> Memuat...
      </div>
    );
  }

  const label = "text-sm font-medium text-slate-700";
  const input =
    "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200";

  return (
    <div className="max-w-3xl">
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={2} /> Kembali ke produk
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">
        {isEdit ? "Edit produk" : "Tambah produk"}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Nama produk</label>
              <input
                className={input}
                value={form.name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rattan Lounge Chair"
              />
            </div>
            <div>
              <label className={label}>Subtitle (opsional)</label>
              <input
                className={input}
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                placeholder="Kursi Santai Rendah"
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
                placeholder="rattan-lounge-chair"
              />
            </div>
            <div>
              <label className={label}>Kategori</label>
              <select
                className={input}
                value={form.category_slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category_slug: e.target.value }))
                }
              >
                {form.category_slug === "" && (
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                )}
                {cats.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Status</label>
              <select
                className={input}
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Habis">Habis</option>
              </select>
            </div>
            <div>
              <label className={label}>Harga (Rp)</label>
              <input
                className={input}
                inputMode="numeric"
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9]/g, "") }))
                }
                placeholder="899000"
              />
            </div>
            <div>
              <label className={label}>Harga promo (Rp) — opsional</label>
              <input
                className={input}
                inputMode="numeric"
                value={form.sale_price}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    sale_price: e.target.value.replace(/[^0-9]/g, ""),
                  }))
                }
                placeholder="Kosongkan jika tidak ada diskon"
              />
              <p className="mt-1 text-xs text-slate-400">
                Isi lebih kecil dari harga normal untuk menampilkan harga coret &amp;
                badge promo.
              </p>
            </div>
            <div>
              <label className={label}>Stok</label>
              <input
                className={input}
                inputMode="numeric"
                value={form.stock}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stock: e.target.value.replace(/[^0-9]/g, "") }))
                }
                placeholder="8"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Ukuran</label>
              <input
                className={input}
                value={form.dimensions}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dimensions: e.target.value }))
                }
                placeholder="Diameter 50 cm, Tinggi 55 cm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Material</label>
              <textarea
                className={`${input} min-h-[70px]`}
                value={form.material}
                onChange={(e) =>
                  setForm((f) => ({ ...f, material: e.target.value }))
                }
                placeholder="Rotan alami pilihan dengan rangka kayu, finishing natural."
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Pengiriman</label>
              <textarea
                className={`${input} min-h-[70px]`}
                value={form.shipping}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shipping: e.target.value }))
                }
                placeholder="Dikirim 3-7 hari kerja via JNE / SiCepat, atau ambil di workshop."
              />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Deskripsi</label>
              <textarea
                className={`${input} min-h-[110px]`}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Material rotan alami pilihan..."
              />
            </div>
          </div>
        </div>

        {/* Image + featured */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <label className={label}>Gambar produk (cover)</label>
          <p className="text-xs text-slate-400">
            Disarankan minimal {MIN_IMG_PX}px pada sisi terpanjang agar tajam.
          </p>
          <div className="mt-3 flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {form.image_url ? (
                <img
                  src={form.image_url}
                  alt="Pratinjau"
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <ImageOff className="h-6 w-6 text-slate-300" strokeWidth={1.7} />
              )}
            </div>
            <div className="flex-1">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onUpload}
                className="hidden"
                id="product-image"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Upload className="h-4 w-4" strokeWidth={1.9} />
                )}
                Unggah ke Storage
              </button>
              <input
                className={`${input} mt-2`}
                value={form.image_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, image_url: e.target.value }))
                }
                placeholder="atau tempel URL gambar (mis. /products/image1.png)"
              />
            </div>
          </div>

          {/* Gallery — additional photos shown on the product page */}
          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className={label}>Galeri tambahan</label>
                <p className="text-xs text-slate-400">
                  Foto lain yang tampil di halaman produk (selain cover).
                </p>
              </div>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onGalleryUpload}
                className="hidden"
                id="product-gallery"
              />
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={galleryUploading}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                {galleryUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <Upload className="h-4 w-4" strokeWidth={1.9} />
                )}
                Tambah foto
              </button>
            </div>

            {form.images.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-3">
                {form.images.map((url, i) => (
                  <div
                    key={`${url}-${i}`}
                    className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                  >
                    <img
                      src={url}
                      alt={`Galeri ${i + 1}`}
                      className="h-full w-full object-contain p-1.5"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      aria-label="Hapus gambar"
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow transition hover:text-red-600 group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-400">Belum ada foto tambahan.</p>
            )}
          </div>

          <label className="mt-6 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_featured: e.target.checked }))
              }
              className="h-4 w-4 accent-slate-900"
            />
            <span className="text-sm text-slate-700">
              Tampilkan sebagai produk unggulan (featured)
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />}
            {isEdit ? "Simpan perubahan" : "Tambah produk"}
          </button>
          <Link
            to="/admin/products"
            className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
