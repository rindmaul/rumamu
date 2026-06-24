import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { Info } from "lucide-react";
import { isSupabaseConfigured } from "../../lib/supabase";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

// Only rendered in dev builds so end users never see configuration chatter.
export function DevNotice() {
  if (isSupabaseConfigured || !import.meta.env.DEV) return null;
  return (
    <div className="bg-rattan/15 text-brown">
      <div className="mx-auto flex max-w-[1280px] items-center gap-2 px-5 py-2 text-xs sm:px-8">
        <Info className="h-3.5 w-3.5" strokeWidth={2} />
        <span>
          Mode pratinjau: Supabase belum dikonfigurasi. Katalog dan keranjang
          memakai data lokal; pesanan disimpan sementara di browser.
        </span>
      </div>
    </div>
  );
}

export function PublicLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DevNotice />
      <Navbar />
      <main className="flex-1">{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}
