import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { SlidersHorizontal, X, Search, PackageOpen, ChevronRight } from "lucide-react";
import { Container, Reveal } from "../components/Reveal";
import { ProductCard } from "../components/ProductCard";
import { Button, EmptyState, Select, Skeleton } from "../components/ui";
import { listActiveProducts, listCategories } from "../services/products";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";
import type { Category, Product } from "../lib/types";

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc";

const sortLabels: Record<SortKey, string> = {
  newest: "Produk terbaru",
  "price-asc": "Harga terendah",
  "price-desc": "Harga tertinggi",
  "name-asc": "Nama A-Z",
};

export default function Shop() {
  usePageMeta({
    title: pageTitle("Belanja Furnitur Rotan"),
    description:
      "Jelajahi katalog furnitur rotan rumamu — kursi, meja, penyimpanan, dan pencahayaan dengan kehangatan alami untuk setiap sudut rumah.",
  });
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const search = params.get("search") ?? "";
  const category = params.get("category") ?? "all";
  const availability = params.get("availability") ?? "all";
  const sort = (params.get("sort") as SortKey) ?? "newest";

  useEffect(() => {
    listActiveProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  }

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.subtitle ?? "").toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((p) => p.category_slug === category);
    if (availability === "in")
      list = list.filter((p) => p.stock > 0 && p.status === "Tersedia");
    if (availability === "out")
      list = list.filter((p) => p.stock <= 0 || p.status !== "Tersedia");

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // newest: keep service order (created_at desc / seed order)
        break;
    }
    return list;
  }, [products, search, category, availability, sort]);

  const activeCategoryName =
    category === "all"
      ? "Semua Koleksi"
      : (categories.find((c) => c.slug === category)?.name ?? "Koleksi");

  const Filters = (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Kategori</h3>
        <div className="flex flex-col gap-1">
          <FilterPill
            active={category === "all"}
            onClick={() => update("category", "all")}
            label="Semua kategori"
          />
          {categories.map((c) => (
            <FilterPill
              key={c.slug}
              active={category === c.slug}
              onClick={() => update("category", c.slug)}
              label={c.name}
            />
          ))}
        </div>
      </div>
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">Ketersediaan</h3>
        <div className="flex flex-col gap-1">
          <FilterPill
            active={availability === "all"}
            onClick={() => update("availability", "all")}
            label="Semua"
          />
          <FilterPill
            active={availability === "in"}
            onClick={() => update("availability", "in")}
            label="Tersedia"
          />
          <FilterPill
            active={availability === "out"}
            onClick={() => update("availability", "out")}
            label="Habis"
          />
        </div>
      </div>
    </div>
  );

  return (
    <Container className="py-10 md:py-14">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-brown">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        <span className="text-brown">{activeCategoryName}</span>
      </nav>

      <Reveal>
        <h1 className="mt-4 font-serif text-4xl text-charcoal md:text-5xl">
          {search ? `Hasil untuk "${search}"` : activeCategoryName}
        </h1>
      </Reveal>

      {/* search bar within shop */}
      <div className="mt-6 flex items-center gap-3 rounded-full border border-line bg-white px-5 py-3">
        <Search className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.8} />
        <input
          value={search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Cari nama produk..."
          className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
        />
        {search && (
          <button
            onClick={() => update("search", "")}
            aria-label="Hapus pencarian"
            className="text-muted hover:text-ink"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">{Filters}</aside>

        <div>
          {/* toolbar */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {loading ? "Memuat..." : `${filtered.length} produk ditemukan`}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm text-brown lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
                Filter
              </button>
              <Select
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
                aria-label="Urutkan"
                className="w-auto"
              >
                {Object.entries(sortLabels).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-card border border-line bg-white p-5">
                  <Skeleton className="mb-4 aspect-square w-full" />
                  <Skeleton className="mb-2 h-4 w-1/3" />
                  <Skeleton className="mb-2 h-5 w-2/3" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<PackageOpen className="h-6 w-6" strokeWidth={1.8} />}
              title="Belum ada produk"
              body="Coba ubah kata kunci, kategori, atau filter ketersediaan untuk menemukan koleksi lain."
              action={
                <Button
                  variant="secondary"
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  Reset filter
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-cream p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl text-ink">Filter</h2>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup filter"
                className="flex h-10 w-10 items-center justify-center rounded-full text-brown hover:bg-brown/5"
              >
                <X className="h-6 w-6" strokeWidth={1.8} />
              </button>
            </div>
            {Filters}
            <Button full className="mt-6" onClick={() => setDrawerOpen(false)}>
              Lihat {filtered.length} produk
            </Button>
          </div>
        </div>
      )}
    </Container>
  );
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-left text-sm transition ${
        active ? "bg-charcoal text-cream" : "text-brown hover:bg-brown/5"
      }`}
    >
      {label}
    </button>
  );
}
