import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, ArrowUpRight } from "lucide-react";
import { Container, Reveal } from "../components/Reveal";
import { collections, type CollectionDef } from "../config/site";
import { listCategories } from "../services/products";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";
import type { Category } from "../lib/types";

// Warm tan-leather interior for the editorial closing band.
const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1920&auto=format&fit=crop";

// One lookbook tile: full-cover lifestyle photo + serif title overlay. The
// first tile is the feature (full width on tablet, 2x2 on desktop).
function CollectionCard({
  collection,
  index,
}: {
  collection: CollectionDef;
  index: number;
}) {
  const feature = index === 0;
  return (
    <Link
      to={collection.href}
      className={`group relative block overflow-hidden rounded-card aspect-[4/3] lg:aspect-auto lg:h-full ${
        feature ? "sm:col-span-2 lg:col-span-2 lg:row-span-2" : ""
      }`}
    >
      <img
        src={collection.image}
        alt={collection.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
      />
      {/* gradient for legibility + a touch deeper on hover */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(32,26,22,0.82) 0%, rgba(32,26,22,0.18) 46%, transparent 76%)",
        }}
      />
      <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/20" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
        <div>
          <h3
            className={`font-serif leading-tight text-cream drop-shadow-sm ${
              feature ? "text-3xl md:text-4xl" : "text-2xl"
            }`}
          >
            {collection.title}
          </h3>
          <p className="mt-1 text-sm text-cream/80">{collection.subtitle}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white/20 text-cream opacity-0 backdrop-blur-sm transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}

export default function Koleksi() {
  usePageMeta({
    title: pageTitle("Koleksi & Lookbook"),
    description:
      "Lookbook rumamu — inspirasi menata ruang per kamar dan suasana, dari ruang tamu hangat hingga gaya Japandi yang tenang.",
  });
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  return (
    <Container className="py-10 md:py-14">
      {/* Breadcrumb + heading */}
      <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-brown">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        <span className="text-brown">Koleksi</span>
      </nav>

      <Reveal>
        <h1 className="mt-4 max-w-2xl font-serif text-4xl text-charcoal md:text-5xl">
          Koleksi untuk tiap suasana rumah
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-brown">
          Dari ruang tamu hingga sudut paling tenang — rangkaian rotan pilihan
          yang kami kurasi untuk setiap momen di rumah.
        </p>
      </Reveal>

      {/* Lookbook bento of curated collections */}
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:auto-rows-[230px] lg:[grid-auto-flow:dense]">
        {collections.map((c, i) => (
          <CollectionCard key={c.title} collection={c} index={i} />
        ))}
      </div>

      {/* Secondary: jump straight to a product category */}
      {categories.length > 0 && (
        <div className="mt-14">
          <h2 className="font-serif text-2xl text-charcoal">Belanja per kategori</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-sand/60 px-5 py-2.5 text-sm font-medium text-ink transition hover:border-rattan hover:bg-sand"
              >
                {c.name}
                <ArrowUpRight className="h-4 w-4 text-brown" strokeWidth={2} />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Editorial closing band */}
      <section className="relative mt-16 overflow-hidden rounded-card md:mt-20">
        <img
          src={EDITORIAL_IMAGE}
          alt="Ruang santai hangat dengan furnitur rotan"
          className="h-[360px] w-full object-cover md:h-[440px]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/45 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-md px-7 md:px-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-rattan">
              Satu koleksi, satu cerita
            </p>
            <h2 className="font-serif text-3xl leading-tight text-cream md:text-4xl">
              Rancang ruang yang terasa seperti rumah.
            </h2>
            <p className="mt-4 text-cream/80">
              Padukan koleksi rotan kami untuk menghadirkan kehangatan alami di
              setiap sudut.
            </p>
            <Link
              to="/shop"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-rattan px-7 py-3 text-sm font-medium text-charcoal transition hover:bg-rattan-deep active:scale-[0.98]"
            >
              Eksplor produk
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </section>
    </Container>
  );
}
