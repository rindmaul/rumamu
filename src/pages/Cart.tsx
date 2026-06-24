import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, AlertCircle } from "lucide-react";
import { Container } from "../components/Reveal";
import { Button, EmptyState } from "../components/ui";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatRupiah } from "../lib/format";
import { shippingMethods } from "../config/site";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";

export default function Cart() {
  usePageMeta({ title: pageTitle("Keranjang Belanja") });
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const { show } = useToast();

  // Cheapest paid option as a pre-checkout estimate.
  const estimate = Math.min(...shippingMethods.map((m) => m.fee).filter((f) => f > 0));

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <h1 className="mb-8 font-serif text-4xl text-charcoal md:text-5xl">Keranjang</h1>
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" strokeWidth={1.8} />}
          title="Keranjang masih kosong"
          body="Belum ada produk di keranjang. Jelajahi koleksi rotan rumamu untuk menemukan yang cocok untuk rumahmu."
          action={
            <Link to="/shop">
              <Button>Mulai belanja</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  function changeQty(productId: string, next: number, stock: number, name: string) {
    if (next > stock) {
      show(`Stok ${name} hanya tersisa ${stock}.`, "error");
      setQuantity(productId, stock);
      return;
    }
    setQuantity(productId, next);
  }

  return (
    <Container className="py-10 md:py-14">
      <h1 className="font-serif text-4xl text-charcoal md:text-5xl">Keranjang</h1>
      <p className="mt-2 text-sm text-muted">{items.length} produk di keranjang</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="divide-y divide-line rounded-card border border-line bg-white">
          {items.map((item) => {
            const lowStock = item.quantity >= item.stock;
            return (
              <div key={item.productId} className="flex gap-4 p-4 sm:p-5">
                <Link
                  to={`/shop/${item.slug}`}
                  className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-line bg-sand/40"
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-contain p-2"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/shop/${item.slug}`}
                      className="text-lg leading-tight text-ink hover:text-brown"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      aria-label={`Hapus ${item.name}`}
                      className="text-muted transition hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" strokeWidth={1.8} />
                    </button>
                  </div>
                  <span className="mt-1 text-sm font-medium text-charcoal">
                    {formatRupiah(item.price)}
                  </span>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-full border border-line">
                      <button
                        onClick={() =>
                          changeQty(item.productId, item.quantity - 1, item.stock, item.name)
                        }
                        aria-label="Kurangi"
                        className="flex h-9 w-9 items-center justify-center text-brown hover:text-charcoal"
                      >
                        <Minus className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <span className="w-9 text-center text-sm font-medium tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          changeQty(item.productId, item.quantity + 1, item.stock, item.name)
                        }
                        aria-label="Tambah"
                        disabled={lowStock}
                        className="flex h-9 w-9 items-center justify-center text-brown hover:text-charcoal disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-charcoal">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>

                  {lowStock && (
                    <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-rattan-deep">
                      <AlertCircle className="h-3.5 w-3.5" strokeWidth={2} />
                      Mencapai batas stok ({item.stock})
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card border border-line bg-white p-6">
          <h2 className="text-xl text-ink">Ringkasan</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-medium text-ink">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Estimasi pengiriman</dt>
              <dd className="font-medium text-ink">mulai {formatRupiah(estimate)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="text-base font-semibold text-ink">Perkiraan total</span>
            <span className="text-lg font-semibold text-charcoal">
              {formatRupiah(subtotal + estimate)}
            </span>
          </div>
          <p className="mt-2 text-xs text-muted">
            Ongkir final dihitung saat checkout sesuai metode pengiriman yang dipilih.
          </p>

          <Link to="/checkout" className="mt-6 block">
            <Button full size="lg">
              Lanjut ke Checkout
              <ArrowRight className="h-5 w-5" strokeWidth={2} />
            </Button>
          </Link>
          <Link to="/shop" className="mt-3 block">
            <Button full variant="secondary">
              Lanjut belanja
            </Button>
          </Link>
        </aside>
      </div>
    </Container>
  );
}
