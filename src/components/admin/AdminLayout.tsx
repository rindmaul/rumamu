import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  LogOut,
  Menu,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePageMeta, pageTitle } from "../../lib/usePageMeta";

const items = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Produk", icon: Package, end: false },
  { to: "/admin/categories", label: "Kategori", icon: Tags, end: false },
  { to: "/admin/orders", label: "Pesanan", icon: ClipboardList, end: false },
];

export function AdminLayout() {
  usePageMeta({ title: pageTitle("Admin") });
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login");
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Link to="/admin" className="font-serif text-2xl font-semibold text-slate-900">
          rumamu
        </Link>
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-500">
          Admin
        </span>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" strokeWidth={1.9} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-slate-200 px-3 py-4">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          <ExternalLink className="h-4.5 w-4.5" strokeWidth={1.9} /> Lihat toko
        </a>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          <LogOut className="h-4.5 w-4.5" strokeWidth={1.9} /> Keluar
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl">
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Buka menu admin"
          >
            <Menu className="h-5 w-5" strokeWidth={1.9} />
          </button>
          <div className="ml-auto truncate text-sm text-slate-500">
            {session?.user.email}
          </div>
        </header>

        <main className="px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
