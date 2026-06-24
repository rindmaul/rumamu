import type { CSSProperties } from "react";

const columnA = [
  "/products/image2.png",
  "/products/image4.png",
  "/products/image6.png",
  "/products/image8.png",
];
const columnB = [
  "/products/image1.png",
  "/products/image9.png",
  "/products/image3.png",
  "/products/image5.png",
];

function MarqueeCard({ src, tilt }: { src: string; tilt: number }) {
  return (
    <div
      className="aspect-square shrink-0 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_16px_46px_rgba(107,79,58,0.16)] sm:rounded-3xl"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-contain p-4 sm:p-5"
      />
    </div>
  );
}

function MarqueeColumn({
  images,
  duration,
  reverse,
  wrapperClassName = "",
}: {
  images: string[];
  duration: number;
  reverse?: boolean;
  wrapperClassName?: string;
}) {
  // Doubled list + translateY(-50%) keyframe = seamless infinite loop.
  const loop = [...images, ...images];
  return (
    <div className={wrapperClassName}>
      <div
        className="hero-marquee-col flex flex-col gap-4 sm:gap-5"
        style={
          {
            "--marquee-duration": `${duration}s`,
            "--marquee-dir": reverse ? "reverse" : "normal",
          } as CSSProperties
        }
      >
        {loop.map((src, i) => (
          <MarqueeCard key={i} src={src} tilt={i % 2 === 0 ? -3 : 2.5} />
        ))}
      </div>
    </div>
  );
}

// Hero visual: two columns of product cards auto-scrolling forever in
// opposite directions, paused on hover. Replaces a static collage with the
// "always circling" gallery effect requested for the hero.
export function HeroMarquee({ badge }: { badge: string }) {
  return (
    <div className="relative aspect-[5/5.4] w-full">
      <div
        className="absolute left-1/2 top-1/2 h-[88%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-[48%] bg-sand"
        aria-hidden="true"
      />
      <div
        className="absolute inset-6 rounded-3xl opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(107,79,58,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(107,79,58,.18) 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
        aria-hidden="true"
      />

      <div className="hero-marquee-mask absolute inset-3 overflow-hidden rounded-[2rem] sm:inset-5">
        <div className="grid h-full grid-cols-2 gap-3 sm:gap-4">
          <MarqueeColumn images={columnA} duration={30} />
          <MarqueeColumn
            images={columnB}
            duration={24}
            reverse
            wrapperClassName="translate-y-10 sm:translate-y-14"
          />
        </div>
      </div>

      <span className="absolute bottom-3 right-1 z-10 rounded-full bg-charcoal px-4 py-2 text-xs font-medium tracking-wide text-cream shadow-lg sm:bottom-5 sm:right-2">
        {badge}
      </span>
    </div>
  );
}
