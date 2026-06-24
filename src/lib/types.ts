export type CategorySlug = "seating" | "tables" | "storage" | "lighting";

export interface Category {
  id: string;
  name: string;
  slug: CategorySlug | string;
  blurb?: string;
  image_url?: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string | null;
  slug: string;
  category_id: string | null;
  category_slug: string;
  category_name: string;
  price: number;
  sale_price: number | null; // promo price; when < price the storefront shows a discount
  stock: number;
  dimensions: string;
  material: string;
  shipping: string;
  description: string;
  image_url: string; // cover image (cards, cart, listings)
  images: string[]; // additional gallery photos (product page)
  status: string; // "Tersedia" | "Habis"
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image_url: string;
  stock: number;
  quantity: number;
}

export interface OrderItem {
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus =
  | "Menunggu Konfirmasi Simulasi"
  | "Pembayaran Dikonfirmasi (Simulasi)"
  | "Sedang Diproses"
  | "Selesai"
  | "Dibatalkan";

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string;
  city: string;
  postal_code: string;
  order_note: string | null;
  shipping_method: string;
  shipping_fee: number;
  payment_method: string;
  payment_status: string;
  order_status: OrderStatus | string;
  subtotal: number;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface NewOrderInput {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  order_note: string;
  shipping_method: string;
  shipping_fee: number;
  payment_method: string;
  items: { product_id: string; quantity: number }[];
}
