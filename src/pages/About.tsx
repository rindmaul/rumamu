import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Plus,
  Minus,
  Leaf,
  Hand,
  Sparkles,
} from "lucide-react";
import { Container, Reveal } from "../components/Reveal";
import { benefits, categories, inspirationArticles } from "../config/site";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";

const benefitIcons = [Leaf, Hand, Sparkles];

// Warm boho interior (overridable). Sets the editorial tone for the hero.
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=1920&auto=format&fit=crop";

const faqs = [
  {
    q: "Apakah produk rumamu ini benar bisa dibeli?",
    a: "Website ini dibuat sebagai proyek tugas. Katalog, keranjang, dan checkout berfungsi penuh, namun pembayaran bersifat simulasi dan tidak ada transaksi nyata yang terjadi.",
  },
  {
    q: "Material apa yang digunakan?",
    a: "Setiap produk menggunakan rotan alami pilihan dengan rangka yang kokoh dan finishing natural. Karakter serat dapat sedikit berbeda pada tiap unit karena dikerjakan secara handmade.",
  },
  {
    q: "Bagaimana cara perawatan furnitur rotan?",
    a: "Bersihkan debu secara rutin dengan kuas lembut atau lap kering. Hindari paparan sinar matahari langsung dan air berlebih agar warna dan anyaman tetap awet.",
  },
  {
    q: "Apakah bisa kirim ke luar kota?",
    a: "Pada simulasi ini tersedia opsi JNE Reguler, SiCepat BEST, dan ambil langsung di workshop. Estimasi ongkir ditampilkan saat checkout.",
  },
];

const exploreCards = [
  {
    title: "Belanja Koleksi",
    body: "Temukan furnitur rotan untuk tiap sudut rumah.",
    href: "/shop",
    className: "bg-charcoal text-cream",
    sub: "text-cream/70",
  },
  {
    title: "Inspirasi Menata",
    body: "Ide sederhana menata ruang agar terasa hangat.",
    href: "#inspirasi",
    className: "bg-rattan text-charcoal",
    sub: "text-charcoal/70",
  },
  {
    title: "Pertanyaan Umum",
    body: "Material, perawatan, hingga pengiriman simulasi.",
    href: "#faq",
    className: "bg-sand text-ink",
    sub: "text-brown",
  },
];

export default function About() {
  usePageMeta({
    title: pageTitle("Tentang Kami"),
    description:
      "Cerita di balik rumamu — furnitur rotan handmade dari material yang jujur, dirancang untuk menemani rumah bertahun-tahun. Plus panduan menata ruang.",
  });
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [openBenefit, setOpenBenefit] = useState<number | null>(0);

  return (
    <>
      {/* 1. HERO — full-bleed lifestyle photo with overlaid heading */}
      <section className="relative h-[72vh] min-h-[460px] w-full overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Ruang keluarga hangat dengan furnitur rotan"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/35 to-charcoal/20" />
        <Container className="relative flex h-full flex-col justify-end pb-12 md:pb-16">
          <Reveal className="max-w-2xl">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.22em] text-rattan">
              Tentang Rumamu
            </p>
            <h1 className="font-serif text-4xl leading-[1.05] text-cream sm:text-5xl md:text-6xl">
              Ruang hangat, cerita yang menetap.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/80 md:text-lg">
              Rumamu menghadirkan furnitur rotan yang dikerjakan dengan ketelitian —
              agar setiap sudut rumah terasa lebih hidup, alami, dan nyaman untuk
              waktu yang lama.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 2. PULL-QUOTE — big serif statement with highlighted keywords */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div
          className="absolute -right-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-sand/60 blur-3xl"
          aria-hidden="true"
        />
        <Container className="relative">
          <Reveal className="max-w-4xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-rattan-deep">
              Berawal dari satu pertanyaan
            </p>
            <p className="font-serif text-3xl leading-[1.25] text-charcoal sm:text-4xl md:text-[2.75rem]">
              “Bagaimana caranya menghadirkan{" "}
              <span className="text-rattan-deep">kehangatan rumah</span> lewat
              material yang <span className="text-rattan-deep">alami dan jujur</span>,
              dan menemani keseharian untuk{" "}
              <span className="text-rattan-deep">waktu yang lama</span>?”
            </p>
          </Reveal>
        </Container>
      </section>

      {/* 3. ORIGIN STORY — image + narrative split */}
      <section className="pb-20 md:pb-28">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <Reveal className="order-2 md:order-1">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-rattan-deep">
                Cerita kami
              </p>
              <h2 className="font-serif text-3xl leading-tight text-charcoal md:text-4xl">
                Dibuat dari material yang jujur
              </h2>
              <div className="mt-5 space-y-4 leading-relaxed text-brown">
                <p>
                  Rotan adalah material yang tumbuh cepat dan ringan, namun kuat.
                  Kami memilih batang dengan serat rapat, lalu membentuknya menjadi
                  furnitur yang fungsional dan tahan menemani keseharian.
                </p>
                <p>
                  Setiap produk dikerjakan secara handmade dengan finishing natural —
                  sehingga karakter serat pada tiap unit terasa khas dan tidak pernah
                  benar-benar sama.
                </p>
              </div>
              <Link
                to="/shop"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-brown underline-offset-4 transition hover:text-charcoal hover:underline"
              >
                Lihat koleksi kami
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </Link>
            </Reveal>
            <Reveal className="order-1 md:order-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line">
                <img
                  src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=1200&auto=format&fit=crop"
                  alt="Kursi rotan dengan detail anyaman"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* 4. STATEMENT BAND — bold full-bleed mission, keywords highlighted */}
      <section className="bg-charcoal py-20 text-cream md:py-28">
        <Container>
          <Reveal className="max-w-4xl">
            <p className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-rattan">
              Yang kami percaya
            </p>
            <p className="font-serif text-3xl leading-[1.3] text-cream sm:text-4xl md:text-5xl">
              Rumah yang baik dibangun dari{" "}
              <span className="text-rattan">material yang jujur</span>,{" "}
              <span className="text-rattan">dikerjakan dengan tangan</span>, dan
              dirancang untuk menemani{" "}
              <span className="text-rattan">bertahun-tahun</span>.
            </p>
          </Reveal>

          {/* Expandable detail — About is the in-depth source; Home only teases */}
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {benefits.map((b, i) => {
              const Icon = benefitIcons[i] ?? Leaf;
              const open = openBenefit === i;
              return (
                <Reveal key={b.title} delay={i * 80}>
                  <button
                    onClick={() => setOpenBenefit(open ? null : i)}
                    aria-expanded={open}
                    className="flex h-full w-full flex-col rounded-card border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white/[0.08]"
                  >
                    <Icon className="mb-4 h-8 w-8 text-rattan" strokeWidth={1.5} />
                    <h3 className="font-serif text-2xl text-cream">{b.title}</h3>
                    <p className="mt-2 leading-relaxed text-cream/70">{b.body}</p>
                    <div
                      className={`grid transition-all duration-300 ${
                        open
                          ? "mt-3 grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <p className="overflow-hidden border-t border-white/10 pt-3 text-sm leading-relaxed text-cream/60">
                        {b.detail}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-rattan">
                      {open ? "Tutup" : "Selengkapnya"}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-300 ${
                          open ? "rotate-180" : ""
                        }`}
                        strokeWidth={2}
                      />
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 5. CIRCULAR CATEGORY ROW */}
      <section className="py-20 md:py-28">
        <Container>
          <Reveal>
            <h2 className="max-w-xl font-serif text-3xl text-charcoal md:text-4xl">
              Jelajahi tiap sudut rumah
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 70}>
                <Link to={`/shop?category=${c.slug}`} className="group block text-center">
                  <div className="mx-auto aspect-square w-full max-w-[180px] overflow-hidden rounded-full border border-line bg-white shadow-[0_16px_40px_rgba(107,79,58,0.12)] transition-transform duration-300 group-hover:-translate-y-1.5">
                    <img
                      src={c.image}
                      alt={c.name}
                      className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-4 font-serif text-xl text-ink transition-colors group-hover:text-brown">
                    {c.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted">{c.blurb}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 6. EXPLORE CARDS — warm adaptation of the colourful card row */}
      <section className="pb-20 md:pb-28">
        <Container>
          <div className="grid gap-5 md:grid-cols-3">
            {exploreCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 70}>
                <Link
                  to={card.href}
                  className={`group flex h-full min-h-[180px] flex-col justify-between rounded-card p-7 transition-transform duration-300 hover:-translate-y-1 ${card.className}`}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 backdrop-blur-sm transition group-hover:bg-white/40">
                    <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="mt-8">
                    <h3 className="font-serif text-2xl">{card.title}</h3>
                    <p className={`mt-1.5 text-sm ${card.sub}`}>{card.body}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 7. INSPIRATION (anchor used by navbar) — the full, detailed guides */}
      <section id="inspirasi" className="scroll-mt-24 bg-sand/50 py-20 md:py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-rattan-deep">
              Inspirasi
            </p>
            <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
              Panduan menata ruang
            </h2>
            <p className="mt-4 leading-relaxed text-brown">
              Langkah demi langkah menghadirkan kehangatan rotan di setiap sudut —
              dari memilih furnitur hingga memadukannya dengan gaya ruangmu.
            </p>
          </Reveal>

          <div className="mt-14 space-y-16 md:space-y-24">
            {inspirationArticles.map((a, i) => (
              <Reveal
                key={a.title}
                id={`panduan-${a.slug}`}
                className="grid scroll-mt-24 items-center gap-8 md:grid-cols-2 md:gap-12"
              >
                <div className={i % 2 === 1 ? "md:order-2" : ""}>
                  <div className="aspect-[4/3] overflow-hidden rounded-card border border-line shadow-[0_18px_50px_rgba(107,79,58,0.12)]">
                    <img
                      src={a.image}
                      alt={a.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-rattan-deep">
                    Panduan {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-2 font-serif text-2xl leading-tight text-charcoal md:text-3xl">
                    {a.title}
                  </h3>
                  <p className="mt-3 text-lg leading-relaxed text-brown">
                    {a.excerpt}
                  </p>
                  <p className="mt-4 leading-relaxed text-muted">{a.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="scroll-mt-24 py-20 md:py-28">
        <Container>
          <h2 className="font-serif text-4xl text-charcoal md:text-5xl">
            Pertanyaan umum
          </h2>
          <div className="mt-8 max-w-3xl divide-y divide-line rounded-card border border-line bg-white">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-lg text-ink">{f.q}</span>
                    {open ? (
                      <Minus className="h-5 w-5 shrink-0 text-brown" strokeWidth={2} />
                    ) : (
                      <Plus className="h-5 w-5 shrink-0 text-brown" strokeWidth={2} />
                    )}
                  </button>
                  {open && (
                    <p className="px-6 pb-5 leading-relaxed text-muted">{f.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 9. PRIVACY */}
      <section id="privasi" className="scroll-mt-24 pb-20">
        <Container>
          <div className="max-w-3xl rounded-card border border-line bg-white p-8">
            <h2 className="font-serif text-3xl text-charcoal">Kebijakan Privasi</h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-brown">
              <p>
                Sebagai proyek tugas, rumamu hanya mengumpulkan data yang kamu isi saat
                checkout (nama, kontak, dan alamat pengiriman) untuk keperluan
                memproses pesanan simulasi.
              </p>
              <p>
                Data pesanan disimpan di basis data Supabase milik pemilik proyek, atau
                sementara di browser kamu ketika mode pratinjau aktif. Tidak ada data
                pembayaran nyata yang diproses atau disimpan.
              </p>
              <p>
                Untuk pertanyaan terkait data, hubungi kami melalui kanal yang tertera
                di footer.
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 10. CTA */}
      <section className="pb-24">
        <Container>
          <div className="flex flex-col items-center gap-5 rounded-card bg-charcoal p-10 text-center text-cream md:p-16">
            <h2 className="font-serif text-3xl text-cream md:text-4xl">
              Mulai dari satu sudut rumahmu
            </h2>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-rattan px-8 py-3.5 text-base font-medium text-charcoal transition hover:bg-rattan-deep active:scale-[0.98]"
            >
              Jelajahi koleksi
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
