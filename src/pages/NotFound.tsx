import { Link } from "react-router-dom";
import { Container } from "../components/Reveal";
import { Button } from "../components/ui";
import { usePageMeta, pageTitle } from "../lib/usePageMeta";

export default function NotFound() {
  usePageMeta({ title: pageTitle("Halaman tidak ditemukan") });
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-serif text-7xl font-semibold text-rattan-deep">404</p>
      <h1 className="mt-4 font-serif text-4xl text-charcoal">Halaman tidak ditemukan</h1>
      <p className="mt-3 max-w-md text-brown">
        Tautan yang kamu buka mungkin sudah berpindah atau tidak tersedia lagi.
      </p>
      <Link to="/" className="mt-8">
        <Button size="lg">Kembali ke beranda</Button>
      </Link>
    </Container>
  );
}
