import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Instagram, MessageCircle, Mail, ArrowRight } from "lucide-react";
import { site } from "../../config/site";
import { useToast } from "../../context/ToastContext";

export function Footer() {
  const { show } = useToast();
  const [email, setEmail] = useState("");

  function subscribe(e: FormEvent) {
    e.preventDefault();
    // Simulation only: no data is stored anywhere.
    setEmail("");
    show("Terima kasih, kamu akan mendapat kabar koleksi terbaru rumamu.", "success");
  }

  return (
    <footer className="mt-24 bg-charcoal text-cream">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div>
            <h2 className="text-3xl text-cream md:text-4xl">Tetap terhubung</h2>
            <p className="mt-3 max-w-md text-sm text-cream/70">
              Dapatkan inspirasi ruang dan kabar koleksi terbaru dari rumamu.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex w-full gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat email kamu"
              aria-label="Alamat email"
              className="h-12 flex-1 rounded-full border border-white/15 bg-white/5 px-5 text-sm text-cream placeholder:text-cream/50 focus:border-rattan focus:outline-none focus:ring-2 focus:ring-rattan/30"
            />
            <button
              type="submit"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-rattan px-6 text-sm font-medium text-charcoal transition hover:bg-rattan-deep active:scale-[0.98]"
            >
              Langganan
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      </div>

      {/* Columns */}
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        <div className="md:col-span-1">
          <img
            src="/logo/image10.jpeg"
            alt="Logo rumamu"
            className="mb-4 h-14 w-auto rounded-lg"
          />
          <p className="max-w-xs text-sm text-cream/70">{site.slogan}</p>
        </div>

        <div>
          <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-cream/90">
            Belanja
          </h3>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li>
              <Link to="/shop" className="transition hover:text-rattan">
                Shop
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=seating"
                className="transition hover:text-rattan"
              >
                Seating
              </Link>
            </li>
            <li>
              <Link to="/shop?category=tables" className="transition hover:text-rattan">
                Tables
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=storage"
                className="transition hover:text-rattan"
              >
                Storage
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-cream/90">
            Perusahaan
          </h3>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li>
              <Link to="/about" className="transition hover:text-rattan">
                Tentang Kami
              </Link>
            </li>
            <li>
              <Link to="/about#faq" className="transition hover:text-rattan">
                FAQ
              </Link>
            </li>
            <li>
              <Link to="/about#privasi" className="transition hover:text-rattan">
                Kebijakan Privasi
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-cream/90">
            Terhubung
          </h3>
          <ul className="space-y-2.5 text-sm text-cream/70">
            <li>
              <a
                href={site.contact.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-rattan"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.8} /> Instagram
              </a>
            </li>
            <li>
              <a
                href={site.contact.whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-rattan"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.8} /> WhatsApp
              </a>
            </li>
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-2 transition hover:text-rattan"
              >
                <Mail className="h-4 w-4" strokeWidth={1.8} /> {site.contact.email}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-5 py-6 text-center text-xs text-cream/50 sm:px-8">
          &copy; 2026 rumamu. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
