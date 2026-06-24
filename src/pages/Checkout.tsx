import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Lock, ShoppingCart } from "lucide-react";
import { Container } from "../components/Reveal";
import { Button, EmptyState, Field, Input, Textarea } from "../components/ui";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatRupiah } from "../lib/format";
import { paymentMethods, shippingMethods } from "../config/site";
import { shippingZones, detectZone, shippingFee } from "../lib/shipping";
import { createOrder } from "../services/orders";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";

interface FormState {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  order_note: string;
}

const empty: FormState = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  shipping_address: "",
  city: "",
  postal_code: "",
  order_note: "",
};

export default function Checkout() {
  usePageMeta({ title: pageTitle("Checkout") });
  const { items, subtotal, clear } = useCart();
  const { show } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>(empty);
  const [shippingId, setShippingId] = useState(shippingMethods[0].id);
  const [paymentId, setPaymentId] = useState(paymentMethods[0].id);
  // "" until detected/picked; "auto" remembers the zone matched from the city.
  const [zoneId, setZoneId] = useState("");
  const [zoneTouched, setZoneTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const shipping = useMemo(
    () => shippingMethods.find((m) => m.id === shippingId) ?? shippingMethods[0],
    [shippingId]
  );
  const payment = useMemo(
    () => paymentMethods.find((m) => m.id === paymentId) ?? paymentMethods[0],
    [paymentId]
  );
  const zone = useMemo(
    () => shippingZones.find((z) => z.id === zoneId) ?? null,
    [zoneId]
  );
  const shippingCost = shippingFee(shipping, zone);
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<ShoppingCart className="h-6 w-6" strokeWidth={1.8} />}
          title="Keranjang kosong"
          body="Tambahkan produk ke keranjang sebelum melanjutkan ke checkout."
          action={
            <Link to="/shop">
              <Button>Mulai belanja</Button>
            </Link>
          }
        />
      </Container>
    );
  }

  function set<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    // Auto-detect the shipping zone from the city until the user picks manually.
    if (key === "city" && !zoneTouched) {
      const detected = detectZone(value);
      setZoneId(detected ? detected.id : "");
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.customer_name.trim()) next.customer_name = "Nama lengkap wajib diisi.";
    if (!form.customer_phone.trim()) next.customer_phone = "Nomor WhatsApp wajib diisi.";
    else if (!/^[0-9+\-\s]{7,}$/.test(form.customer_phone.trim()))
      next.customer_phone = "Nomor WhatsApp tidak valid.";
    if (form.customer_email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.customer_email))
      next.customer_email = "Format email tidak valid.";
    if (!form.shipping_address.trim()) next.shipping_address = "Alamat wajib diisi.";
    if (!form.city.trim()) next.city = "Kota wajib diisi.";
    if (!form.postal_code.trim()) next.postal_code = "Kode pos wajib diisi.";
    setErrors(next);
    if (!shipping.pickup && !zone) {
      show("Pilih wilayah tujuan untuk menghitung ongkir.", "error");
      return false;
    }
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) {
      show("Mohon lengkapi data yang ditandai.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const orderNumber = await createOrder({
        ...form,
        shipping_method:
          shipping.pickup || !zone
            ? shipping.label
            : `${shipping.label} — ${zone.label}`,
        shipping_fee: shippingCost,
        payment_method: payment.label,
        items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
      });
      clear();
      navigate(`/payment/${orderNumber}`);
    } catch (err) {
      show(
        err instanceof Error ? err.message : "Gagal membuat pesanan. Coba lagi.",
        "error"
      );
      setSubmitting(false);
    }
  }

  return (
    <Container className="py-10 md:py-14">
      <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
        <Link to="/cart" className="transition hover:text-brown">
          Keranjang
        </Link>
        <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
        <span className="text-brown">Checkout</span>
      </nav>
      <h1 className="mt-4 font-serif text-4xl text-charcoal md:text-5xl">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Customer */}
          <section className="rounded-card border border-line bg-white p-6">
            <h2 className="text-xl text-ink">Data pembeli</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Nama lengkap" htmlFor="name" required error={errors.customer_name}>
                  <Input
                    id="name"
                    value={form.customer_name}
                    onChange={(e) => set("customer_name", e.target.value)}
                    placeholder="Nama penerima"
                  />
                </Field>
              </div>
              <Field label="Nomor WhatsApp" htmlFor="phone" required error={errors.customer_phone}>
                <Input
                  id="phone"
                  inputMode="tel"
                  value={form.customer_phone}
                  onChange={(e) => set("customer_phone", e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </Field>
              <Field label="Email" htmlFor="email" hint="Opsional" error={errors.customer_email}>
                <Input
                  id="email"
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => set("customer_email", e.target.value)}
                  placeholder="email@contoh.com"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field
                  label="Alamat lengkap"
                  htmlFor="address"
                  required
                  error={errors.shipping_address}
                >
                  <Textarea
                    id="address"
                    value={form.shipping_address}
                    onChange={(e) => set("shipping_address", e.target.value)}
                    placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan"
                  />
                </Field>
              </div>
              <Field label="Kota" htmlFor="city" required error={errors.city}>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Kota / kabupaten"
                />
              </Field>
              <Field label="Kode pos" htmlFor="postal" required error={errors.postal_code}>
                <Input
                  id="postal"
                  inputMode="numeric"
                  value={form.postal_code}
                  onChange={(e) => set("postal_code", e.target.value)}
                  placeholder="15310"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Catatan pesanan" htmlFor="note" hint="Opsional">
                  <Textarea
                    id="note"
                    value={form.order_note}
                    onChange={(e) => set("order_note", e.target.value)}
                    placeholder="Contoh: titip ke satpam, warna preferensi, dll."
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-card border border-line bg-white p-6">
            <h2 className="text-xl text-ink">Metode pengiriman</h2>

            {/* Destination zone → drives the ongkir estimate */}
            <div className="mt-4">
              <label htmlFor="zone" className="text-sm font-medium text-ink">
                Wilayah tujuan
              </label>
              <select
                id="zone"
                value={zoneId}
                onChange={(e) => {
                  setZoneTouched(true);
                  setZoneId(e.target.value);
                }}
                className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink focus:border-brown focus:outline-none focus:ring-2 focus:ring-rattan/30"
              >
                <option value="">Pilih wilayah untuk estimasi ongkir…</option>
                {shippingZones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.label}
                    {z.surcharge > 0 ? ` (+${formatRupiah(z.surcharge)})` : ""}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-xs text-muted">
                Terisi otomatis dari kota yang kamu masukkan. Ongkir adalah estimasi
                simulasi.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {shippingMethods.map((m) => {
                const fee = shippingFee(m, zone);
                return (
                  <label
                    key={m.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                      shippingId === m.id
                        ? "border-charcoal bg-sand/40"
                        : "border-line hover:border-brown/40"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={m.id}
                        checked={shippingId === m.id}
                        onChange={() => setShippingId(m.id)}
                        className="h-4 w-4 accent-charcoal"
                      />
                      <span className="text-sm font-medium text-ink">{m.label}</span>
                    </span>
                    <span className="text-sm text-brown">
                      {m.pickup
                        ? "Gratis"
                        : zone
                          ? formatRupiah(fee)
                          : `mulai ${formatRupiah(m.fee)}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-card border border-line bg-white p-6">
            <h2 className="text-xl text-ink">Metode pembayaran</h2>
            <p className="mt-1 text-sm text-muted">
              Semua metode di sini adalah simulasi untuk kebutuhan tugas.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${
                    paymentId === m.id
                      ? "border-charcoal bg-sand/40 font-medium text-ink"
                      : "border-line text-brown hover:border-brown/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={paymentId === m.id}
                    onChange={() => setPaymentId(m.id)}
                    className="h-4 w-4 accent-charcoal"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside className="h-fit rounded-card border border-line bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-xl text-ink">Ringkasan Pesanan</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3 text-sm">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-sand px-1.5 text-xs font-medium text-brown">
                  {i.quantity}
                </span>
                <span className="flex-1 text-ink">{i.name}</span>
                <span className="font-medium text-ink">
                  {formatRupiah(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="text-ink">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">
                Ongkir ({shipping.label}
                {zone && !shipping.pickup ? ` · ${zone.label}` : ""})
              </dt>
              <dd className="text-ink">
                {shipping.pickup ? "Gratis" : formatRupiah(shippingCost)}
              </dd>
            </div>
          </dl>
          <div className="mt-4 flex justify-between border-t border-line pt-4">
            <span className="text-base font-semibold text-ink">Total</span>
            <span className="text-lg font-semibold text-charcoal">
              {formatRupiah(total)}
            </span>
          </div>

          <Button full size="lg" type="submit" loading={submitting} className="mt-6">
            Buat Pesanan
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted">
            <Lock className="h-3.5 w-3.5" strokeWidth={2} />
            Checkout simulasi, tidak ada pembayaran nyata.
          </p>
        </aside>
      </form>
    </Container>
  );
}
