import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import type { Product } from "../lib/types";
import { formatRupiah } from "../lib/format";
import { effectivePrice, isOnSale, discountPercent } from "../lib/price";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { Badge } from "./ui";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { show } = useToast();
  const [fav, setFav] = useState(false);
  const inStock = product.stock > 0 && product.status === "Tersedia";
  const onSale = isOnSale(product);

  function handleAdd() {
    if (!inStock) return;
    const ok = addItem(product, 1);
    show(
      ok
        ? `${product.name} ditambahkan ke keranjang.`
        : `Stok ${product.name} tidak mencukupi.`,
      ok ? "success" : "error"
    );
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-line bg-white transition-shadow duration-300 hover:shadow-[0_18px_50px_rgba(107,79,58,0.14)]">
      <Link
        to={`/shop/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-white"
      >
        <img
          src={product.image_url}
          alt={`${product.name}${product.subtitle ? ` - ${product.subtitle}` : ""}`}
          loading="lazy"
          className="h-full w-full object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* availability as an image overlay so it never crowds the price row */}
        <span className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          <Badge tone={inStock ? "available" : "out"}>
            {inStock ? "Tersedia" : "Habis"}
          </Badge>
          {onSale && (
            <span className="rounded-full bg-[#b3422f] px-2.5 py-0.5 text-[11px] font-semibold text-cream shadow-sm">
              Promo -{discountPercent(product)}%
            </span>
          )}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setFav((f) => !f);
          }}
          aria-label={fav ? "Hapus dari favorit" : "Tambahkan ke favorit"}
          aria-pressed={fav}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brown shadow-sm backdrop-blur transition hover:bg-white"
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={2}
            fill={fav ? "currentColor" : "none"}
          />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted sm:text-xs">
          {product.category_name}
        </span>
        <Link to={`/shop/${product.slug}`} className="group/title mt-1.5">
          <h3 className="text-lg leading-tight text-ink transition-colors group-hover/title:text-brown sm:text-xl">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="mt-0.5 text-xs text-muted sm:text-sm">{product.subtitle}</p>
          )}
        </Link>

        <div className="mt-auto pt-3">
          {onSale ? (
            <div className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-base font-semibold text-[#b3422f] sm:text-lg">
                {formatRupiah(effectivePrice(product))}
              </span>
              <span className="text-xs text-muted line-through sm:text-sm">
                {formatRupiah(product.price)}
              </span>
            </div>
          ) : (
            <span className="block text-base font-semibold text-charcoal sm:text-lg">
              {formatRupiah(product.price)}
            </span>
          )}
          <button
            onClick={handleAdd}
            disabled={!inStock}
            className="mt-2.5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-charcoal text-[13px] font-medium text-cream transition-all duration-200 hover:bg-ink active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:text-sm"
          >
            <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2} />
            <span className="sm:hidden">{inStock ? "Tambah" : "Habis"}</span>
            <span className="hidden sm:inline">
              {inStock ? "Tambah ke Keranjang" : "Stok Habis"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
