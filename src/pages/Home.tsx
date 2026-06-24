import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Armchair,
  Table,
  Package2,
  Lamp,
} from "lucide-react";
import { Container, Reveal } from "../components/Reveal";
import { HeroMarquee } from "../components/HeroMarquee";
import { BenefitsCluster } from "../components/BenefitsCluster";
import { ProductCard } from "../components/ProductCard";
import { Skeleton } from "../components/ui";
import { categories, inspirationArticles, site } from "../config/site";
import { listActiveProducts } from "../services/products";
import { usePageMeta } from "../lib/usePageMeta";
import type { Product } from "../lib/types";

const categoryIcons: Record<string, typeof Armchair> = {
  seating: Armchair,
  tables: Table,
  storage: Package2,
  lighting: Lamp,
};

export default function Home() {
  usePageMeta({ title: `${site.brand} — ${site.slogan}` });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActiveProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = (
    products.filter((p) => p.is_featured).length >= 6
      ? products.filter((p) => p.is_featured)
      : products
  ).slice(0, 6);

  return (
    <>
      {/* A. HERO */}
      <section className="relative overflow-hidden">
        <div className="grain-soft absolute inset-0 opacity-60" aria-hidden="true" />
        <Container className="relative grid items-center gap-10 pb-16 pt-12 md:gap-12 md:pb-24 md:pt-16 lg:grid-cols-2">
          <div className="max-w-xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-rattan-deep">
              {site.hero.eyebrow}
            </p>
            <h1 className="font-serif text-5xl leading-[1.02] text-charcoal sm:text-6xl lg:text-7xl">
              {site.hero.headingTop}
              <br />
              {site.hero.headingBottom}
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-brown">
              {site.hero.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to={site.hero.primaryCta.href}
                className="inline-flex h-13 items-center gap-2 rounded-full bg-charcoal px-8 text-base font-medium text-cream shadow-[0_10px_30px_rgba(32,26,22,0.2)] transition-all hover:bg-ink active:scale-[0.98]"
              >
                {site.hero.primaryCta.label}
                <ArrowRight className="h-5 w-5" strokeWidth={2} />
              </Link>
              <Link
                to={site.hero.secondaryCta.href}
                className="inline-flex h-13 items-center rounded-full border border-brown/40 px-8 text-base font-medium text-brown transition-all hover:bg-brown/5 active:scale-[0.98]"
              >
                {site.hero.secondaryCta.label}
              </Link>
            </div>
          </div>

          {/* Right: hero marquee gallery */}
          <Reveal className="relative">
            <HeroMarquee badge={site.hero.badge} />
          </Reveal>
        </Container>
      </section>

      {/* D. CATEGORIES */}
      <section className="py-16 md:py-20">
        <Container>
          <Reveal>
            <h2 className="max-w-xl font-serif text-4xl text-charcoal md:text-5xl">
              Temukan untuk tiap sudut rumahmu
            </h2>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {categories.map((c, i) => {
              const Icon = categoryIcons[c.slug] ?? Package2;
              return (
                <Reveal key={c.slug} delay={i * 70}>
                  <Link
                    to={`/shop?category=${c.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow hover:shadow-[0_18px_50px_rgba(107,79,58,0.14)]"
                  >
                    <div className="relative aspect-square overflow-hidden bg-white">
                      <img
                        src={c.image}
                        alt={c.name}
                        className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="px-5 pb-5 pt-1">
                      <Icon
                        className="mb-2 h-5 w-5 text-rattan-deep"
                        strokeWidth={1.8}
                      />
                      <h3 className="text-2xl text-ink">{c.name}</h3>
                      <p className="mt-1 text-xs text-muted">{c.blurb}</p>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* E. FEATURED */}
      <section className="py-16 md:py-20">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-xl font-serif text-4xl text-charcoal md:text-5xl">
              Pilihan untuk ruang yang lebih hidup
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brown underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              Lihat Semua Koleksi
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-card border border-line bg-white p-5">
                    <Skeleton className="mb-4 aspect-square w-full" />
                    <Skeleton className="mb-2 h-4 w-1/3" />
                    <Skeleton className="mb-2 h-5 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))
              : featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Container>
      </section>

      {/* F. BRAND STORY */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="grid items-center gap-8 overflow-hidden rounded-card bg-charcoal text-cream md:grid-cols-2">
            <div className="p-8 md:p-14">
              <Reveal>
                <h2 className="font-serif text-4xl leading-tight text-cream md:text-5xl">
                  Bukan sekadar furnitur.
                </h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-cream/75">
                  Rumamu menghadirkan karya rotan yang memberi tekstur, kehangatan,
                  dan cerita pada ruang yang kamu tinggali setiap hari.
                </p>
                <Link
                  to="/about"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-rattan px-7 py-3 text-sm font-medium text-charcoal transition hover:bg-rattan-deep active:scale-[0.98]"
                >
                  Tentang rumamu
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Link>
              </Reveal>
            </div>
            <div className="relative min-h-[280px] p-8 md:min-h-[420px]">
              <div className="absolute right-8 top-6 aspect-[4/3] w-[58%] overflow-hidden rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
                <img
                  src="https://images.unsplash.com/photo-1602872030219-ad2b9a54315c?q=80&w=1200&auto=format&fit=crop"
                  alt="Ruang makan hangat rumamu"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-6 left-8 aspect-square w-[46%] overflow-hidden rounded-2xl border-4 border-charcoal shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <img
                  src="https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?q=80&w=1200&auto=format&fit=crop"
                  alt="Penyimpanan kayu hangat rumamu"
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* G. BENEFITS: two-column with a floating, connected card cluster */}
      <BenefitsCluster />

      {/* H. INSPIRATION — teaser; the full guides live on /about#inspirasi */}
      <section className="py-16 md:py-20">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
                Inspirasi Rumamu
              </h2>
              <p className="mt-3 max-w-md text-sm text-muted">
                Ide menata ruang dengan furnitur rotan agar terasa lebih hangat.
              </p>
            </div>
            <Link
              to="/about#inspirasi"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brown transition hover:text-charcoal"
            >
              Lihat semua panduan
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {inspirationArticles.map((a, i) => (
              <Reveal key={a.title} delay={i * 70}>
                <Link
                  to={`/about#panduan-${a.slug}`}
                  className="group flex h-full w-full flex-col overflow-hidden rounded-card border border-line bg-white text-left transition-shadow hover:shadow-[0_18px_50px_rgba(107,79,58,0.12)]"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-sand">
                    <img
                      src={a.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl leading-snug text-ink">{a.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">{a.excerpt}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brown">
                      Baca selengkapnya
                      <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
