import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, Hand, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Container, Reveal } from "./Reveal";
import { benefits } from "../config/site";

const benefitIcons: LucideIcon[] = [Leaf, Hand, Sparkles];

// Natural plaster-wall texture (overridable). Echoes the reference's soft
// stone backdrop without fighting the cream palette.
const DEFAULT_TEXTURE =
  "https://images.unsplash.com/photo-1604147706283-d7119b5b822c?q=80&w=1920&auto=format&fit=crop";

// Layered, directional shadows so the cards read as raised 3D surfaces.
const shadow3d =
  "shadow-[0_30px_55px_-18px_rgba(107,79,58,0.38),0_12px_24px_-12px_rgba(107,79,58,0.22)]";
const shadow3dHover =
  "hover:shadow-[0_48px_80px_-22px_rgba(107,79,58,0.42),0_18px_32px_-14px_rgba(107,79,58,0.26)]";

function BenefitCard({
  icon: Icon,
  title,
  body,
  rot,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  rot?: string; // 3D rotation (desktop cluster); omitted = flat (mobile stack)
}) {
  const base = "rounded-card border border-line bg-white p-5";
  return (
    <div
      className={
        rot
          ? `card-3d ${base} ${shadow3d} ${shadow3dHover}`
          : `${base} shadow-[0_22px_55px_rgba(107,79,58,0.16)] transition-shadow duration-300 hover:shadow-[0_28px_62px_rgba(107,79,58,0.22)]`
      }
      style={rot ? ({ "--card-rot": rot } as CSSProperties) : undefined}
    >
      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cream shadow-[0_6px_16px_rgba(107,79,58,0.16)]">
        <Icon className="h-5 w-5 text-rattan-deep" strokeWidth={1.7} />
      </span>
      <h3 className="text-xl leading-tight text-ink">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </div>
  );
}

export function BenefitsCluster({ imageUrl = DEFAULT_TEXTURE }: { imageUrl?: string }) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Full-bleed texture photo covering the whole section. A light, uniform
          cream wash keeps text legible while leaving the texture visible across
          the entire width; thin top/bottom fades blend into the cream sections
          above and below. */}
      <div className="absolute inset-0" aria-hidden="true">
        {/* Warm the cool plaster toward the cream palette so it doesn't read as
            a grey band between the cream sections above and below. */}
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full object-cover [filter:sepia(0.28)_saturate(1.35)_brightness(1.04)]"
          loading="lazy"
        />
        {/* Cream wash unifies the hue; sand tint via multiply deepens warmth. */}
        <div className="absolute inset-0 bg-sand/25 mix-blend-multiply" />
        <div className="absolute inset-0 bg-cream/45" />
        {/* Wide top/bottom fades melt the seam into the neighbouring sections. */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-cream),transparent_16%,transparent_84%,var(--color-cream))]" />
      </div>

      <Container className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
        {/* LEFT: copy + CTAs */}
        <div className="max-w-xl">
          <Reveal>
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-rattan-deep">
              Kenapa Rumamu
            </p>
            <h2 className="font-serif text-4xl leading-[1.05] text-charcoal md:text-5xl">
              Setiap <span className="italic">detail</span> punya alasan.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-brown">
              Dari pemilihan rotan hingga sentuhan akhir, setiap karya kami
              rancang untuk menemani rumahmu dalam waktu yang lama.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-2 rounded-full bg-charcoal px-7 text-sm font-medium text-cream shadow-[0_10px_30px_rgba(32,26,22,0.2)] transition-all hover:bg-ink active:scale-[0.98]"
              >
                Belanja Koleksi
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
              <Link
                to="/about"
                className="inline-flex h-12 items-center rounded-full border border-brown/40 bg-cream/60 px-7 text-sm font-medium text-brown backdrop-blur-sm transition-all hover:bg-brown/5 active:scale-[0.98]"
              >
                Tentang Material
              </Link>
            </div>
          </Reveal>
        </div>

        {/* RIGHT: 3D floating card cluster (desktop) — static, pops on hover */}
        <Reveal className="relative hidden lg:block">
          <div className="relative aspect-[5/4.7] w-full">
            {/* dashed connectors from the hub to each card (sit behind cards) */}
            <svg
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              {[
                ["50%", "50%", "26%", "24%"],
                ["50%", "50%", "72%", "40%"],
                ["50%", "50%", "40%", "74%"],
              ].map(([x1, y1, x2, y2], i) => (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#b3884f"
                  strokeOpacity={0.45}
                  strokeWidth={1.5}
                  strokeDasharray="3 5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>

            {/* embossed hub tile (brand mark) — tilted into the same 3D scene */}
            <div className="absolute left-1/2 top-1/2 z-20 h-[23%] w-[23%] -translate-x-1/2 -translate-y-1/2">
              <div className="flex h-full w-full items-center justify-center rounded-3xl border border-line bg-gradient-to-br from-cream to-sand [transform:perspective(1200px)_rotateX(7deg)_rotateY(-10deg)] shadow-[0_26px_44px_-12px_rgba(107,79,58,0.34),inset_0_2px_6px_rgba(255,255,255,0.75),inset_0_-4px_10px_rgba(107,79,58,0.2)]">
                <Leaf
                  className="h-1/2 w-1/2 text-rattan-deep/80 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]"
                  strokeWidth={1.5}
                />
              </div>
            </div>

            {/* Card 1 — top left (faces right/center) */}
            <div className="absolute left-0 top-[4%] z-20 w-[47%]">
              <BenefitCard
                icon={benefitIcons[0]}
                title={benefits[0].title}
                body={benefits[0].body}
                rot="rotateY(17deg) rotateX(8deg) rotateZ(-3deg)"
              />
            </div>

            {/* Card 2 — right (faces left/center) */}
            <div className="absolute right-0 top-[22%] z-20 w-[47%]">
              <BenefitCard
                icon={benefitIcons[1]}
                title={benefits[1].title}
                body={benefits[1].body}
                rot="rotateY(-17deg) rotateX(8deg) rotateZ(2deg)"
              />
            </div>

            {/* Card 3 — bottom (faces right/center) */}
            <div className="absolute bottom-0 left-[12%] z-20 w-[50%]">
              <BenefitCard
                icon={benefitIcons[2]}
                title={benefits[2].title}
                body={benefits[2].body}
                rot="rotateY(12deg) rotateX(6deg) rotateZ(-2deg)"
              />
            </div>
          </div>
        </Reveal>

        {/* RIGHT: simple stack (mobile / tablet) */}
        <div className="space-y-4 lg:hidden">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 80}>
              <BenefitCard
                icon={benefitIcons[i] ?? Leaf}
                title={b.title}
                body={b.body}
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
