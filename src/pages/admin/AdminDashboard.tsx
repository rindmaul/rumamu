import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  CheckCircle2,
  Boxes,
  ClipboardList,
  ArrowRight,
  Plus,
} from "lucide-react";
import { listAllProducts } from "../../services/products";
import { listOrders } from "../../services/orders";
import { formatRupiah } from "../../lib/format";
import type { Order, Product } from "../../lib/types";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listAllProducts(), listOrders()])
      .then(([p, o]) => {
        setProducts(p);
        setOrders(o);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = products.filter((p) => p.is_active);
  const availableCount = active.filter(
    (p) => p.stock > 0 && p.status === "Tersedia"
  ).length;
  const totalStock = active.reduce((sum, p) => sum + p.stock, 0);
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  const cards = [
    { label: "Jumlah Produk", value: products.length, icon: Package },
    { label: "Produk Tersedia", value: availableCount, icon: CheckCircle2 },
    { label: "Total Stok", value: totalStock, icon: Boxes },
    { label: "Jumlah Pesanan", value: orders.length, icon: ClipboardList },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Ringkasan</h1>
          <p className="text-sm text-slate-500">Sekilas kondisi toko rumamu.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Tambah produk
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">{label}</span>
              <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.8} />
            </div>
            <p className="mt-3 text-3xl font-semibold tabular-nums text-slate-900">
              {loading ? "..." : value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Revenue (simulated) */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-medium text-slate-500">
            Nilai pesanan (simulasi)
          </h2>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {loading ? "..." : formatRupiah(revenue)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Akumulasi total dari seluruh pesanan tercatat.
          </p>
        </div>

        {/* Recent orders */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-500">Pesanan terbaru</h2>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
            >
              Semua <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
          {loading ? (
            <p className="mt-3 text-sm text-slate-400">Memuat...</p>
          ) : orders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Belum ada pesanan.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {orders.slice(0, 4).map((o) => (
                <li key={o.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="font-medium text-slate-700">{o.order_number}</span>
                  <span className="text-slate-500">{formatRupiah(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
