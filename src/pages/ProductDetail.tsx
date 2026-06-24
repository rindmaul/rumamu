import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  Ruler,
  Leaf,
  PackageOpen,
} from "lucide-react";
import { Container, Reveal } from "../components/Reveal";
import { Badge, Button, EmptyState, Skeleton } from "../components/ui";
import { ProductCard } from "../components/ProductCard";
import { formatRupiah } from "../lib/format";
import { effectivePrice, isOnSale, discountPercent } from "../lib/price";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getProductBySlug, listActiveProducts } from "../services/products";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";
import type { Product } from "../lib/types";

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { show } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setQty(1);
    setActiveImg(0);
    (async () => {
      try {
        const p = await getProductBySlug(slug!);
        if (!active) return;
        setProduct(p);
        if (p) {
          const all = await listActiveProducts();
          if (!active) return;
          setRelated(
            all
              .filter((x) => x.category_slug === p.category_slug && x.id !== p.id)
              .slice(0, 3)
          );
        }
      } catch {
        if (active) setProduct(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  usePageMeta({
    title: product ? pageTitle(product.name) : pageTitle("Produk"),
    description: product
      ? product.description?.slice(0, 160) || undefined
      : undefined,
  });

  if (loading) {
    return (
      <Container className="py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" strokeWidth={1.8} />}
          title="Produk tidak ditemukan"
          body="Produk yang kamu cari mungkin sudah tidak tersedia atau tautannya berubah."
          action={
            <Link to="/shop">
              <Button>Kembali ke katalog</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const inStock = product.stock > 0 && product.status === "Tersedia";

  // Cover first, then the extra gallery photos; de-duplicated and non-empty.
  const gallery = [...new Set([product.image_url, ...product.images].filter(Boolean))];
  const mainImage = gallery[activeImg] ?? product.image_url;

  function handleAdd() {
    if (!product || !inStock) return;
    const ok = addItem(product, qty);
    show(
      ok
        ? `${qty} ${product.name} ditambahkan ke keranjang.`
        : `Stok ${product.name} tidak mencukupi.`,
      ok ? "success" : "error"
    );
  }

  return (
    <Container className="py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-brown">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        <Link
          to={`/shop?category=${product.category_slug}`}
          className="transition hover:text-brown"
        >
          {product.category_name}
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        <span className="text-brown">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* Image + thumbnails */}
        <Reveal>
          <div className="group relative overflow-hidden rounded-card border border-line bg-white">
            <div className="aspect-square bg-sand/30">
              <img
                src={mainImage}
                alt={`${product.name}${product.subtitle ? ` - ${product.subtitle}` : ""}`}
                className="h-full w-full object-contain p-10"
              />
            </div>
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveImg((i) => (i - 1 + gallery.length) % gallery.length)
                  }
                  aria-label="Foto sebelumnya"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/90 text-brown shadow-md backdrop-blur transition hover:bg-cream hover:text-charcoal active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImg((i) => (i + 1) % gallery.length)}
                  aria-label="Foto berikutnya"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-cream/90 text-brown shadow-md backdrop-blur transition hover:bg-cream hover:text-charcoal active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
                <span className="absolute bottom-3 right-3 rounded-full bg-charcoal/70 px-2.5 py-1 text-xs font-medium text-cream">
                  {activeImg + 1}/{gallery.length}
                </span>
              </>
            )}
          </div>
          {/* Thumbnail strip — only when there's more than one photo */}
          {gallery.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-3">
              {gallery.map((url, i) => (
                <button
                  key={`${url}-${i}`}
                  type="button"
                  onClick={() => setActiveImg(i)}
                  aria-label={`Lihat foto ${i + 1}`}
                  aria-current={i === activeImg}
                  className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-white transition ${
                    i === activeImg
                      ? "border-charcoal"
                      : "border-line hover:border-brown/50"
                  }`}
                >
                  <img
                    src={url}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-contain p-2"
                  />
                </button>
              ))}
            </div>
          )}
        </Reveal>

        {/* Info */}
        <div>
          <span className="text-sm uppercase tracking-[0.14em] text-muted">
            {product.category_name}
          </span>
          <h1 className="mt-2 font-serif text-4xl text-charcoal md:text-5xl">
            {product.name}
          </h1>
          {product.subtitle && (
            <p className="mt-1 text-lg text-brown">{product.subtitle}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            {isOnSale(product) ? (
              <>
                <span className="text-3xl font-semibold text-[#b3422f]">
                  {formatRupiah(effectivePrice(product))}
                </span>
                <span className="text-xl text-muted line-through">
                  {formatRupiah(product.price)}
                </span>
                <span className="rounded-full bg-[#b3422f] px-2.5 py-1 text-xs font-semibold text-cream">
                  Hemat {discountPercent(product)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-semibold text-charcoal">
                {formatRupiah(product.price)}
              </span>
            )}
            <Badge tone={inStock ? "available" : "out"}>
              {inStock ? "Tersedia" : "Habis"}
            </Badge>
          </div>

          <p className="mt-2 text-sm text-muted">
            {inStock ? `Stok tersedia: ${product.stock}` : "Stok sedang kosong"}
          </p>

          <p className="mt-6 leading-relaxed text-brown">{product.description}</p>

          {/* Quantity + add to cart */}
          {inStock && (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-full border border-line bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Kurangi jumlah"
                  className="flex h-12 w-12 items-center justify-center text-brown transition hover:text-charcoal disabled:opacity-40"
                  disabled={qty <= 1}
                >
                  <Minus className="h-4 w-4" strokeWidth={2} />
                </button>
                <span className="w-10 text-center text-lg font-medium tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  aria-label="Tambah jumlah"
                  className="flex h-12 w-12 items-center justify-center text-brown transition hover:text-charcoal disabled:opacity-40"
                  disabled={qty >= product.stock}
                >
                  <Plus className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <Button size="lg" onClick={handleAdd} className="flex-1 sm:flex-none">
                <ShoppingBag className="h-5 w-5" strokeWidth={2} />
                Tambah ke Keranjang
              </Button>
            </div>
          )}

          {/* Spec rows */}
          <div className="mt-10 space-y-4 border-t border-line pt-8">
            <SpecRow
              icon={<Ruler className="h-5 w-5" strokeWidth={1.7} />}
              label="Ukuran"
              value={product.dimensions}
            />
            <SpecRow
              icon={<Leaf className="h-5 w-5" strokeWidth={1.7} />}
              label="Material"
              value={
                product.material ||
                "Rotan alami pilihan dengan rangka kayu, finishing natural handmade."
              }
            />
            <SpecRow
              icon={<Truck className="h-5 w-5" strokeWidth={1.7} />}
              label="Pengiriman"
              value={
                product.shipping ||
                "Dikirim 3-7 hari kerja via JNE / SiCepat, atau ambil langsung di workshop. (Estimasi simulasi tugas.)"
              }
            />
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-serif text-3xl text-charcoal md:text-4xl">
            Produk terkait
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}

function SpecRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sand text-brown">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-ink">{label}</h3>
        <p className="mt-0.5 text-sm leading-relaxed text-muted">{value}</p>
      </div>
    </div>
  );
}
