import { Fragment, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { listOrders, updateOrderStatus } from "../../services/orders";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useToast } from "../../context/ToastContext";
import { formatDate, formatRupiah } from "../../lib/format";
import { orderStatuses } from "../../config/site";
import type { Order } from "../../lib/types";

const statusColor: Record<string, string> = {
  "Menunggu Konfirmasi Simulasi": "bg-amber-50 text-amber-700",
  "Pembayaran Dikonfirmasi (Simulasi)": "bg-blue-50 text-blue-700",
  "Sedang Diproses": "bg-indigo-50 text-indigo-700",
  Selesai: "bg-emerald-50 text-emerald-700",
  Dibatalkan: "bg-red-50 text-red-600",
};

export default function AdminOrders() {
  const { show } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      setOrders(await listOrders());
    } catch {
      show("Gagal memuat pesanan.", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onStatus(order: Order, status: string) {
    setBusy(order.id);
    try {
      await updateOrderStatus(order.order_number, status);
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id ? { ...o, order_status: status } : o
        )
      );
      show("Status pesanan diperbarui.", "success");
    } catch (e) {
      show(e instanceof Error ? e.message : "Gagal memperbarui status.", "error");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Pesanan</h1>
      <p className="text-sm text-slate-500">{orders.length} pesanan tercatat.</p>

      {!isSupabaseConfigured && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Mode pratinjau: pesanan diambil dari penyimpanan lokal browser ini.
        </div>
      )}

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nomor</th>
                <th className="px-4 py-3 font-medium">Pembeli</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Pembayaran</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" aria-label="Detail" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Memuat...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <ClipboardList
                      className="mx-auto mb-3 h-8 w-8 text-slate-300"
                      strokeWidth={1.6}
                    />
                    <p className="text-slate-400">Belum ada pesanan masuk.</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <Fragment key={o.id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {o.order_number}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{o.customer_name}</td>
                      <td className="px-4 py-3 tabular-nums text-slate-700">
                        {formatRupiah(o.total)}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {formatDate(o.created_at)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{o.payment_method}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            statusColor[o.order_status] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {o.order_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setOpenId(openId === o.id ? null : o.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                          aria-label="Lihat detail"
                        >
                          {openId === o.id ? (
                            <ChevronUp className="h-4 w-4" strokeWidth={2} />
                          ) : (
                            <ChevronDown className="h-4 w-4" strokeWidth={2} />
                          )}
                        </button>
                      </td>
                    </tr>
                    {openId === o.id && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="px-4 py-5">
                          <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
                            <div>
                              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Produk
                              </h3>
                              <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                                {o.items.map((it, i) => (
                                  <li
                                    key={i}
                                    className="flex justify-between gap-3 px-3 py-2 text-sm"
                                  >
                                    <span className="text-slate-700">
                                      {it.quantity} x {it.product_name}
                                    </span>
                                    <span className="tabular-nums text-slate-600">
                                      {formatRupiah(it.subtotal)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <div className="mt-3 space-y-1 text-sm text-slate-600">
                                <p>Subtotal: {formatRupiah(o.subtotal)}</p>
                                <p>
                                  Ongkir ({o.shipping_method}):{" "}
                                  {o.shipping_fee === 0
                                    ? "Gratis"
                                    : formatRupiah(o.shipping_fee)}
                                </p>
                                <p className="font-medium text-slate-800">
                                  Total: {formatRupiah(o.total)}
                                </p>
                              </div>
                            </div>
                            <div>
                              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Pembeli & pengiriman
                              </h3>
                              <div className="space-y-1 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600">
                                <p className="font-medium text-slate-800">
                                  {o.customer_name}
                                </p>
                                <p>{o.customer_phone}</p>
                                {o.customer_email && <p>{o.customer_email}</p>}
                                <p className="text-slate-500">
                                  {o.shipping_address}, {o.city} {o.postal_code}
                                </p>
                                {o.order_note && (
                                  <p className="text-slate-500">
                                    Catatan: {o.order_note}
                                  </p>
                                )}
                              </div>

                              <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                Ubah status
                              </h3>
                              <select
                                value={o.order_status}
                                disabled={busy === o.id}
                                onChange={(e) => onStatus(o, e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-60"
                              >
                                {orderStatuses.map((s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
