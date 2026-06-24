import type { ReactNode } from "react";
import { Navigate, Link } from "react-router-dom";
import { Loader2, ShieldAlert, DatabaseZap } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { ready, configured, session, isAdmin } = useAuth();

  if (!configured) {
    return (
      <CenterCard
        icon={<DatabaseZap className="h-7 w-7" strokeWidth={1.8} />}
        title="Supabase belum dikonfigurasi"
        body="Dashboard admin membutuhkan koneksi Supabase (Auth + Database). Tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY, jalankan migration, lalu buat akun admin sesuai README."
      />
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-cream text-brown">
        <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2} />
      </div>
    );
  }

  if (!session) return <Navigate to="/admin/login" replace />;

  if (!isAdmin) {
    return (
      <CenterCard
        icon={<ShieldAlert className="h-7 w-7" strokeWidth={1.8} />}
        title="Akses ditolak"
        body="Akun ini tidak memiliki peran admin. Hubungi pemilik untuk mengubah role menjadi 'admin' pada tabel profiles."
      />
    );
  }

  return <>{children}</>;
}

function CenterCard({
  icon,
  title,
  body,
}: {
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-cream px-5">
      <div className="max-w-md rounded-card border border-line bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand text-brown">
          {icon}
        </div>
        <h1 className="text-2xl text-ink">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-full bg-charcoal px-5 text-sm font-medium text-cream transition hover:bg-ink"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
