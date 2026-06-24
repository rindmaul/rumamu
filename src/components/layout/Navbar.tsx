import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { navLinks, site } from "../../config/site";
import { useCart } from "../../context/CartContext";

export function Navbar() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function submitSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    setMenuOpen(false);
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : "/shop");
    setQuery("");
  }

  return (
    <>
    <header className="sticky top-0 z-50 border-b border-line bg-gradient-to-b from-cream/95 to-cream/80 shadow-[0_2px_16px_rgba(107,79,58,0.06)] backdrop-blur-md">
      <nav className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between gap-3 px-5 sm:h-[72px] sm:px-8">
        {/* Logo */}
        <Link to="/" className="shrink-0" aria-label="rumamu beranda">
          <img
            src="/logo/rumamu-logo.png"
            alt="rumamu"
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link, i) => (
            <li key={`${link.label}-${i}`}>
              <NavLink
                to={link.href}
                end={link.href === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-charcoal" : "text-brown hover:text-charcoal"
                  }`
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            aria-label="Cari produk"
            aria-expanded={searchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-brown transition hover:bg-brown/5 hover:text-charcoal"
          >
            <Search className="h-5 w-5" strokeWidth={1.8} />
          </button>

          <Link
            to="/cart"
            aria-label={`Keranjang, ${count} item`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-brown transition hover:bg-brown/5 hover:text-charcoal"
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rattan px-1 text-[11px] font-semibold text-charcoal">
                {count}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-full text-brown transition hover:bg-brown/5 hover:text-charcoal lg:hidden"
          >
            <Menu className="h-6 w-6" strokeWidth={1.8} />
          </button>
        </div>
      </nav>

      {/* Search row */}
      {searchOpen && (
        <div className="border-t border-line bg-cream">
          <form
            onSubmit={submitSearch}
            className="mx-auto flex max-w-[1280px] items-center gap-3 px-5 py-3 sm:px-8"
          >
            <Search className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.8} />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari kursi, meja, lampu rotan..."
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-charcoal px-4 py-1.5 text-xs font-semibold text-cream transition hover:bg-ink"
            >
              Cari
            </button>
          </form>
        </div>
      )}
    </header>

      {/* Mobile drawer — rendered outside <header> so `fixed` is relative to the
          viewport (a backdrop-filter ancestor would otherwise trap it). */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 flex h-full w-[84%] max-w-xs animate-[slidein_0.28s_ease-out] flex-col bg-cream shadow-2xl">
            {/* Header strip with logo */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <img src="/logo/rumamu-logo.png" alt="rumamu" className="h-7 w-auto" />
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Tutup menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-brown transition hover:bg-brown/5 hover:text-charcoal"
              >
                <X className="h-6 w-6" strokeWidth={1.8} />
              </button>
            </div>

            {/* Search inside the drawer */}
            <form
              onSubmit={submitSearch}
              className="flex items-center gap-2 border-b border-line px-4 py-4"
            >
              <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-muted" strokeWidth={1.8} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari produk..."
                  className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                />
              </div>
            </form>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-3 py-3">
              <ul className="flex flex-col gap-1">
                {navLinks.map((link, i) => (
                  <li key={`${link.label}-m-${i}`}>
                    <NavLink
                      to={link.href}
                      end={link.href === "/"}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 text-base font-medium transition ${
                          isActive
                            ? "bg-sand text-charcoal"
                            : "text-brown hover:bg-brown/5"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Cart + slogan footer */}
            <div className="border-t border-line px-4 py-4">
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-full bg-charcoal px-5 py-3 text-sm font-medium text-cream transition hover:bg-ink"
              >
                <ShoppingBag className="h-4 w-4" strokeWidth={1.9} />
                Keranjang{count > 0 ? ` (${count})` : ""}
              </Link>
              <p className="mt-3 text-center text-xs text-muted">{site.slogan}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes slidein{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
    </>
  );
}
