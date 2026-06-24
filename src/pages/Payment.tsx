import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { ShieldAlert, Copy, CheckCircle2, PackageOpen } from "lucide-react";
import { Container } from "../components/Reveal";
import { Button, EmptyState, Spinner } from "../components/ui";
import { formatRupiah } from "../lib/format";
import { useToast } from "../context/ToastContext";
import { confirmPayment, getOrderByNumber } from "../services/orders";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";
import type { Order } from "../lib/types";

export default function Payment() {
  const { orderNumber } = useParams();
  usePageMeta({ title: pageTitle("Pembayaran Simulasi") });
  const navigate = useNavigate();
  const { show } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState<string>("");
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let active = true;
    getOrderByNumber(orderNumber!)
      .then(async (o) => {
        if (!active) return;
        setOrder(o);
        if (o) {
          const payload = `RUMAMU-DEMO-PAYMENT-${o.order_number}-${o.total}`;
          const url = await QRCode.toDataURL(payload, {
            width: 280,
            margin: 1,
            color: { dark: "#201A16", light: "#ffffff" },
          });
          if (active) setQr(url);
        }
      })
      .catch(() => active && setOrder(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [orderNumber]);

  if (loading) {
    return (
      <Container className="py-20">
        <Spinner label="Memuat pesanan..." />
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" strokeWidth={1.8} />}
          title="Pesanan tidak ditemukan"
          body="Nomor pesanan tidak dikenali. Pesanan mungkin dibuat di perangkat lain."
          action={
            <Link to="/shop">
              <Button>Kembali ke katalog</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  const isQris = order.payment_method.toLowerCase().includes("qris");

  async function handleConfirm() {
    if (!order) return;
    setConfirming(true);
    try {
      await confirmPayment(order.order_number);
      navigate(`/order-success/${order.order_number}`);
    } catch {
      show("Gagal mengonfirmasi pembayaran. Coba lagi.", "error");
      setConfirming(false);
    }
  }

  function copyPayload() {
    navigator.clipboard
      ?.writeText(`RUMAMU-DEMO-PAYMENT-${order!.order_number}-${order!.total}`)
      .then(() => show("Teks demo disalin.", "success"))
      .catch(() => show("Tidak bisa menyalin.", "error"));
  }

  return (
    <Container className="py-10 md:py-14">
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-muted">Pesanan {order.order_number}</p>
        <h1 className="mt-1 font-serif text-4xl text-charcoal">Pembayaran</h1>

        {/* Simulation disclaimer (prominent) */}
        <div className="mt-6 flex gap-3 rounded-card border border-rattan/40 bg-rattan/10 p-4">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-rattan-deep" strokeWidth={2} />
          <p className="text-sm leading-relaxed text-brown">
            Ini adalah simulasi pembayaran untuk kebutuhan tugas. QR dan instruksi di
            halaman ini tidak terhubung ke transaksi atau rekening nyata.
          </p>
        </div>

        <div className="mt-6 rounded-card border border-line bg-white p-6 text-center">
          <p className="text-sm text-muted">Total yang harus dibayar</p>
          <p className="mt-1 text-3xl font-semibold text-charcoal">
            {formatRupiah(order.total)}
          </p>
          <p className="mt-1 text-sm text-brown">via {order.payment_method}</p>

          {isQris ? (
            <div className="mt-6 flex flex-col items-center">
              {qr ? (
                <img
                  src={qr}
                  alt="QR code simulasi pembayaran"
                  className="rounded-2xl border border-line"
                  width={240}
                  height={240}
                />
              ) : (
                <div className="h-[240px] w-[240px] animate-pulse rounded-2xl bg-sand" />
              )}
              <button
                onClick={copyPayload}
                className="mt-4 inline-flex items-center gap-1.5 text-sm text-brown transition hover:text-charcoal"
              >
                <Copy className="h-4 w-4" strokeWidth={1.8} />
                Salin teks demo QR
              </button>
            </div>
          ) : (
            <div className="mt-6 rounded-xl bg-sand/50 p-5 text-left text-sm text-brown">
              <p className="font-medium text-ink">Instruksi simulasi</p>
              <p className="mt-2">
                Anggap pembayaran {order.payment_method} sebesar{" "}
                {formatRupiah(order.total)} telah dilakukan ke akun demo rumamu. Tidak
                ada nomor rekening atau akun nyata yang terlibat.
              </p>
            </div>
          )}
        </div>

        <Button
          full
          size="lg"
          onClick={handleConfirm}
          loading={confirming}
          className="mt-6"
        >
          <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
          Konfirmasi Pembayaran Simulasi
        </Button>
        <Link to="/shop" className="mt-3 block text-center text-sm text-muted hover:text-brown">
          Batalkan dan kembali belanja
        </Link>
      </div>
    </Container>
  );
}
