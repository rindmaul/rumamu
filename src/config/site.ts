// Central, editable copy + configuration for the whole site.
// Change text here rather than hunting through components.

export const site = {
  brand: "rumamu",
  slogan: "Ruang hangat, cerita yang menetap.",
  announcement: {
    text: "Koleksi rotan pilihan untuk rumah yang lebih hangat",
    ctaLabel: "Jelajahi Koleksi",
    ctaHref: "/shop",
  },
  hero: {
    eyebrow: "Koleksi Rotan Pilihan",
    headingTop: "Your space,",
    headingBottom: "Your era.",
    description:
      "Koleksi rotan pilihan yang menghadirkan kehangatan alami di setiap sudut rumahmu.",
    primaryCta: { label: "Belanja Sekarang", href: "/shop" },
    secondaryCta: { label: "Lihat Inspirasi", href: "/about#inspirasi" },
    badge: "Natural • Handmade • Timeless",
  },
  contact: {
    instagram: "https://instagram.com/rumamu.id",
    whatsapp: "https://wa.me/6281234567890",
    email: "halo@rumamu.id",
  },
} as const;

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Koleksi", href: "/koleksi" },
  { label: "Tentang Kami", href: "/about" },
  { label: "Inspirasi", href: "/about#inspirasi" },
];

export interface CategoryDef {
  slug: string;
  name: string;
  blurb: string;
  // representative image used on the home category cards
  image: string;
}

export const categories: CategoryDef[] = [
  {
    slug: "seating",
    name: "Seating",
    blurb: "Kursi dan sofa rotan untuk bersantai.",
    image: "/products/image2.png",
  },
  {
    slug: "tables",
    name: "Tables",
    blurb: "Meja kopi dan konsol berkarakter.",
    image: "/products/image4.png",
  },
  {
    slug: "storage",
    name: "Storage",
    blurb: "Penyimpanan rapi dengan tekstur hangat.",
    image: "/products/image3.png",
  },
  {
    slug: "lighting",
    name: "Lighting",
    blurb: "Cahaya lembut dari anyaman rotan.",
    image: "/products/image6.png",
  },
];

// Curated, editorial collections for the /koleksi lookbook — by room & mood,
// deliberately distinct from the functional product categories used by Shop.
// Images are warm lifestyle scenes; each links into the relevant Shop view.
export interface CollectionDef {
  title: string;
  subtitle: string;
  image: string;
  href: string;
}

export const collections: CollectionDef[] = [
  {
    title: "Ruang Tamu",
    subtitle: "Sofa & kursi rotan untuk berkumpul",
    image:
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1400&auto=format&fit=crop",
    href: "/shop?category=seating",
  },
  {
    title: "Sudut Santai",
    subtitle: "Pojok favorit untuk melepas penat",
    image:
      "https://images.unsplash.com/photo-1522444195799-478538b28823?q=80&w=1400&auto=format&fit=crop",
    href: "/shop?category=seating",
  },
  {
    title: "Kamar Tidur",
    subtitle: "Kehangatan untuk ruang beristirahat",
    image:
      "https://images.unsplash.com/photo-1616627561839-074385245ff6?q=80&w=1400&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Gaya Japandi",
    subtitle: "Tenang, natural, dan seimbang",
    image:
      "https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?q=80&w=1400&auto=format&fit=crop",
    href: "/shop",
  },
  {
    title: "Meja & Permukaan",
    subtitle: "Meja kopi & konsol berkarakter",
    image:
      "https://images.unsplash.com/photo-1532372320572-cda25653a26d?q=80&w=1400&auto=format&fit=crop",
    href: "/shop?category=tables",
  },
  {
    title: "Penyimpanan Rapi",
    subtitle: "Simpan rapi dengan tekstur hangat",
    image:
      "https://images.unsplash.com/photo-1591129841117-3adfd313e34f?q=80&w=1400&auto=format&fit=crop",
    href: "/shop?category=storage",
  },
];

export const benefits = [
  {
    title: "Material Alami",
    body: "Rotan pilihan dengan karakter yang hangat dan timeless.",
    detail:
      "Kami memilih batang rotan dengan serat rapat dan kadar air yang tepat, lalu mengeringkannya secara alami agar kuat namun tetap ringan. Hasilnya material yang menua dengan indah — warnanya justru makin hangat seiring waktu.",
  },
  {
    title: "Dirancang untuk Ruangmu",
    body: "Desain fungsional yang mudah dipadukan dengan beragam gaya interior.",
    detail:
      "Setiap proporsi kami rancang agar pas di ruang kecil maupun luas, dan mudah dipadukan dengan gaya Japandi, skandinavia, hingga tropis modern. Fungsional, tanpa mengorbankan estetika.",
  },
  {
    title: "Dibuat dengan Ketelitian",
    body: "Detail pengerjaan untuk menemani rumah dalam waktu yang lama.",
    detail:
      "Dikerjakan tangan oleh perajin berpengalaman — tiap anyaman dirapikan dan rangka diperkuat satu per satu. Finishing natural melindungi serat tanpa menutup teksturnya, sehingga awet menemani keseharian.",
  },
];

export const inspirationArticles = [
  {
    slug: "sudut-santai",
    title: "Cara Menata Sudut Santai dengan Furnitur Rotan",
    image:
      "https://images.unsplash.com/photo-1615529182904-14819c35db37?q=80&w=1200&auto=format&fit=crop",
    excerpt:
      "Mulai dari satu kursi rendah, lampu hangat, dan tekstur alami untuk membentuk sudut favorit di rumah.",
    body: "Sudut santai tidak butuh ruang besar. Pilih satu kursi rotan dengan dudukan rendah sebagai jangkar, tambahkan meja samping bulat untuk meletakkan cangkir dan buku, lalu hadirkan lampu meja rotan agar cahaya jatuh lembut di sore hari. Tekstur anyaman akan memberi kedalaman tanpa membuat sudut terasa penuh.",
  },
  {
    slug: "japandi",
    title: "Panduan Memadukan Rotan dalam Interior Japandi",
    image:
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop",
    excerpt:
      "Japandi menyatukan ketenangan Jepang dan kehangatan Skandinavia. Rotan menjadi jembatan yang pas.",
    body: "Kunci Japandi adalah palet netral, garis bersih, dan material alami. Rotan cocok karena warnanya hangat namun tidak ramai. Padukan meja kopi oval rotan dengan sofa berwarna sand, sisakan banyak ruang kosong, dan batasi dekorasi pada satu atau dua objek bermakna. Hasilnya ruang yang tenang dan tetap terasa hidup.",
  },
  {
    slug: "meja-kopi",
    title: "Pilih Meja Kopi yang Tepat untuk Ruang Tamu",
    image:
      "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?q=80&w=1200&auto=format&fit=crop",
    excerpt:
      "Bentuk, tinggi, dan proporsi meja kopi menentukan kenyamanan ruang tamu sehari-hari.",
    body: "Ukur dulu tinggi sofa: permukaan meja kopi idealnya sejajar atau sedikit di bawah dudukan. Bentuk bulat atau oval lebih aman untuk ruang dengan lalu lintas tinggi karena tidak ada sudut tajam. Beri jarak sekitar 40 cm dari sofa agar tetap nyaman dilangkahi. Untuk ruang kecil, pilih meja yang ringan secara visual seperti rangka rotan terbuka.",
  },
];

// `fee` is the courier base fee; the final ongkir adds a destination-zone
// surcharge (see lib/shipping.ts). Workshop pickup is always free.
export const shippingMethods = [
  { id: "jne-reguler", label: "JNE Reguler", fee: 25000, pickup: false },
  { id: "sicepat-best", label: "SiCepat BEST", fee: 30000, pickup: false },
  { id: "ambil-workshop", label: "Ambil di Workshop", fee: 0, pickup: true },
];

export const paymentMethods = [
  { id: "qris", label: "QRIS Simulasi" },
  { id: "transfer", label: "Transfer Bank Simulasi" },
  { id: "ewallet", label: "E-Wallet Simulasi" },
];

export const orderStatuses = [
  "Menunggu Konfirmasi Simulasi",
  "Pembayaran Dikonfirmasi (Simulasi)",
  "Sedang Diproses",
  "Selesai",
  "Dibatalkan",
] as const;
