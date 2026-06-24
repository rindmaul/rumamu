import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2, DatabaseZap, LogIn } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { usePageMeta, pageTitle } from "../../lib/usePageMeta";

export default function AdminLogin() {
  usePageMeta({ title: pageTitle("Masuk Admin") });
  const { configured, session, isAdmin, signIn, ready } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in as admin -> go straight to the dashboard.
  if (ready && session && isAdmin) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate("/admin");
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? "Email atau kata sandi salah."
          : "Gagal masuk. Coba lagi."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-cream px-5">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 block text-center font-serif text-3xl font-semibold text-charcoal"
        >
          rumamu
        </Link>

        <div className="rounded-card border border-line bg-white p-8 shadow-sm">
          <h1 className="text-2xl text-ink">Masuk Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Kelola produk dan pesanan rumamu.
          </p>

          {!configured ? (
            <div className="mt-6 flex gap-3 rounded-xl border border-rattan/40 bg-rattan/10 p-4 text-sm text-brown">
              <DatabaseZap className="mt-0.5 h-5 w-5 shrink-0 text-rattan-deep" strokeWidth={1.8} />
              <p>
                Supabase belum dikonfigurasi. Tambahkan env, jalankan migration, lalu
                buat akun admin sesuai panduan README untuk mengaktifkan login.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="text-sm font-medium text-ink">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-input border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-rattan focus:outline-none focus:ring-2 focus:ring-rattan/30"
                  placeholder="admin@rumamu.id"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-ink">
                  Kata sandi
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-input border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-rattan focus:outline-none focus:ring-2 focus:ring-rattan/30"
                  placeholder="********"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-charcoal text-sm font-medium text-cream transition hover:bg-ink active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                ) : (
                  <LogIn className="h-4 w-4" strokeWidth={2} />
                )}
                Masuk
              </button>
            </form>
          )}
        </div>

        <Link
          to="/"
          className="mt-5 block text-center text-sm text-muted transition hover:text-brown"
        >
          Kembali ke toko
        </Link>
      </div>
    </div>
  );
}
