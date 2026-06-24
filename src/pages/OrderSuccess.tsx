import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Printer, Home, ShoppingBag, PackageOpen } from "lucide-react";
import { Container } from "../components/Reveal";
import { Badge, Button, EmptyState, Spinner } from "../components/ui";
import { formatDate, formatRupiah } from "../lib/format";
import { getOrderByNumber } from "../services/orders";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";
import type { Order } from "../lib/types";

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  usePageMeta({ title: pageTitle("Pesanan Berhasil") });
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderByNumber(orderNumber!)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <Container className="py-20">
        <Spinner label="Memuat ringkasan..." />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" strokeWidth={1.8} />}
          title="Pesanan tidak ditemukan"
          body="Nomor pesanan tidak dikenali atau dibuat di perangkat lain."
          action={
            <Link to="/shop">
              <Button>Kembali ke katalog</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-2xl">
        {/* Success header */}
        <div className="no-print flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-9 w-9" strokeWidth={1.8} />
          </div>
          <h1 className="mt-5 font-serif text-4xl text-charcoal">Terima kasih!</h1>
          <p className="mt-2 max-w-md text-brown">
            Pesananmu sudah kami terima. Simpan nomor pesanan di bawah untuk referensi.
          </p>
        </div>

        {/* Receipt */}
        <div className="print-clean mt-8 overflow-hidden rounded-card border border-line bg-white">
          <div className="flex items-center justify-between gap-4 border-b border-line p-6">
            <div>
              <p className="font-serif text-2xl font-semibold text-charcoal">rumamu</p>
              <p className="text-sm text-muted">Ringkasan Pesanan</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{order.order_number}</p>
              <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
            </div>
          </div>

          <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="available">Pembayaran Dikonfirmasi (Simulasi)</Badge>
              <Badge tone="neutral">{order.order_status}</Badge>
            </div>

            {/* Buyer */}
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted">
                Data pembeli
              </h2>
              <div className="text-sm leading-relaxed text-ink">
                <p className="font-medium">{order.customer_name}</p>
                <p>{order.customer_phone}</p>
                {order.customer_email && <p>{order.customer_email}</p>}
                <p className="mt-1 text-muted">
                  {order.shipping_address}, {order.city} {order.postal_code}
                </p>
                {order.order_note && (
                  <p className="mt-1 text-muted">Catatan: {order.order_note}</p>
                )}
              </div>
            </section>

            {/* Items */}
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                Produk
              </h2>
              <ul className="divide-y divide-line">
                {order.items.map((it, idx) => (
                  <li key={idx} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-medium text-ink">{it.product_name}</p>
                      <p className="text-muted">
                        {it.quantity} x {formatRupiah(it.product_price)}
                      </p>
                    </div>
                    <span className="font-medium text-ink">{formatRupiah(it.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Totals */}
            <section className="space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="text-ink">{formatRupiah(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Ongkir ({order.shipping_method})</span>
                <span className="text-ink">
                  {order.shipping_fee === 0 ? "Gratis" : formatRupiah(order.shipping_fee)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Metode pembayaran</span>
                <span className="text-ink">{order.payment_method}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <span className="text-base font-semibold text-ink">Total</span>
                <span className="text-lg font-semibold text-charcoal">
                  {formatRupiah(order.total)}
                </span>
              </div>
            </section>

            <p className="text-xs leading-relaxed text-muted">
              Dokumen ini adalah ringkasan pesanan simulasi untuk kebutuhan tugas, bukan
              bukti pembayaran bank yang asli.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print mt-6 flex flex-wrap gap-3">
          <Button onClick={() => window.print()}>
            <Printer className="h-5 w-5" strokeWidth={2} />
            Cetak Receipt
          </Button>
          <Link to="/">
            <Button variant="secondary">
              <Home className="h-5 w-5" strokeWidth={2} />
              Kembali ke beranda
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="ghost">
              <ShoppingBag className="h-5 w-5" strokeWidth={2} />
              Lanjut belanja
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
