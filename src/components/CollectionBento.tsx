import { ArrowUpRight } from "lucide-react";

// ── Design tokens (rumamu): warm beige / brass / espresso, Japandi calm ──────
const ESPRESSO = "#3C2415";
const BRASS = "#B8955A";

type CardSize = "feature" | "wide" | "tall" | "standard";

interface CollectionItem {
  title: string;
  subtitle?: string;
  imageUrl: string;
  size: CardSize;
}

// Span classes per size. Mobile = 1 col (no spans, reset to 1x1). Tablet (md) =
// 2 cols with reduced spans (only the wide/feature go full-width). Desktop (lg)
// = full asymmetric bento on 4 columns.
const sizeClasses: Record<CardSize, string> = {
  feature: "md:col-span-2 lg:col-span-2 lg:row-span-2",
  wide: "md:col-span-2 lg:col-span-2",
  tall: "lg:row-span-2",
  standard: "",
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?q=80&w=1400&auto=format&fit=crop`;

const defaultItems: CollectionItem[] = [
  {
    title: "Ruang Tamu",
    subtitle: "Koleksi kursi & sofa rotan",
    imageUrl: img("photo-1600210492493-0946911123ea"),
    size: "feature",
  },
  {
    title: "Meja Anyaman",
    imageUrl: img("photo-1583847268964-b28dc8f51f92"),
    size: "wide",
  },
  {
    title: "Kursi Santai",
    imageUrl: img("photo-1567538096630-e0c55bd6374c"),
    size: "tall",
  },
  {
    title: "Penyimpanan Rotan",
    imageUrl: img("photo-1594026112284-02bb6f3352fe"),
    size: "standard",
  },
  {
    title: "Dekorasi",
    imageUrl: img("photo-1616137422495-1e9e46e2aa77"),
    size: "standard",
  },
  {
    title: "Lampu Rotan",
    imageUrl: img("photo-1615529182904-14819c35db37"),
    size: "standard",
  },
  {
    title: "Set Makan",
    imageUrl: img("photo-1602872030219-ad2b9a54315c"),
    size: "standard",
  },
];

function BentoCard({ item }: { item: CollectionItem }) {
  const isFeature = item.size === "feature";
  return (
    <article
      className={`group relative cursor-pointer overflow-hidden rounded-2xl aspect-[4/3] md:aspect-auto md:h-full ${sizeClasses[item.size]}`}
    >
      {/* full-cover image with smooth hover zoom */}
      <img
        src={item.imageUrl}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-105"
      />

      {/* base gradient for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${ESPRESSO}cc 0%, ${ESPRESSO}26 38%, transparent 70%)`,
        }}
      />
      {/* extra tint that deepens on hover */}
      <div
        className="absolute inset-0 bg-transparent transition-colors duration-[400ms] ease-out group-hover:bg-[#3C2415]/30"
      />

      {/* overlay copy */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 md:p-6">
        <div>
          <h3
            className={`font-serif font-medium leading-tight text-white drop-shadow-sm ${
              isFeature ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
            }`}
          >
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="mt-1 text-sm text-white/80">{item.subtitle}</p>
          )}
        </div>
        <span className="mb-1 flex h-9 w-9 shrink-0 translate-y-1 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-[400ms] ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
    </article>
  );
}

export function CollectionBento({
  items = defaultItems,
}: {
  items?: CollectionItem[];
}) {
  return (
    <section className="bg-cream py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <div className="mb-10 max-w-xl md:mb-12">
          <p
            className="mb-3 text-sm font-medium uppercase tracking-[0.2em]"
            style={{ color: BRASS }}
          >
            Koleksi
          </p>
          <h2
            className="font-serif text-4xl leading-tight md:text-5xl"
            style={{ color: ESPRESSO }}
          >
            Koleksi rotan untuk tiap ruang
          </h2>
        </div>

        {/* Asymmetric bento — CSS Grid (not flexbox). Cream gaps come from the
            section background showing through the grid gap. */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:auto-rows-[210px] lg:grid-cols-4 lg:auto-rows-[230px] lg:[grid-auto-flow:dense]">
          {items.map((item, i) => (
            <BentoCard key={`${item.title}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default CollectionBento;
