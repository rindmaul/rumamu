import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { fallbackProducts } from "../data/products";
import { effectivePrice } from "../lib/price";
import type { NewOrderInput, Order, OrderItem } from "../lib/types";

const LOCAL_ORDERS_KEY = "rumamu_local_orders";

function genOrderNumber(): string {
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `RUM-2026-${rand}`;
}

function readLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function writeLocalOrders(orders: Order[]): void {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

// Build the order_items + totals snapshot from the input + a product price lookup.
function buildItems(
  input: NewOrderInput,
  priceLookup: (id: string) => { name: string; price: number } | null
): { items: OrderItem[]; subtotal: number } {
  let subtotal = 0;
  const items: OrderItem[] = [];
  for (const line of input.items) {
    if (line.quantity <= 0) continue;
    const p = priceLookup(line.product_id);
    if (!p) throw new Error("Produk tidak ditemukan.");
    const lineSubtotal = p.price * line.quantity;
    subtotal += lineSubtotal;
    items.push({
      product_id: line.product_id,
      product_name: p.name,
      product_price: p.price,
      quantity: line.quantity,
      subtotal: lineSubtotal,
    });
  }
  return { items, subtotal };
}

export async function createOrder(input: NewOrderInput): Promise<string> {
  if (!isSupabaseConfigured) {
    // Local mock order: store in localStorage so receipt + admin (notice) work offline.
    const { items, subtotal } = buildItems(input, (id) => {
      const p = fallbackProducts.find((x) => x.id === id);
      return p ? { name: p.name, price: effectivePrice(p) } : null;
    });
    if (items.length === 0) throw new Error("Keranjang kosong.");
    const order: Order = {
      id: crypto.randomUUID(),
      order_number: genOrderNumber(),
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email || null,
      shipping_address: input.shipping_address,
      city: input.city,
      postal_code: input.postal_code,
      order_note: input.order_note || null,
      shipping_method: input.shipping_method,
      shipping_fee: input.shipping_fee,
      payment_method: input.payment_method,
      payment_status: "Menunggu Pembayaran (Simulasi)",
      order_status: "Menunggu Konfirmasi Simulasi",
      subtotal,
      total: subtotal + input.shipping_fee,
      created_at: new Date().toISOString(),
      items,
    };
    writeLocalOrders([order, ...readLocalOrders()]);
    return order.order_number;
  }

  // Supabase: single atomic RPC validates stock, locks rows, decrements, creates order.
  const { data, error } = await supabase.rpc("create_order", {
    p_customer_name: input.customer_name,
    p_customer_phone: input.customer_phone,
    p_customer_email: input.customer_email || null,
    p_shipping_address: input.shipping_address,
    p_city: input.city,
    p_postal_code: input.postal_code,
    p_order_note: input.order_note || null,
    p_shipping_method: input.shipping_method,
    p_shipping_fee: input.shipping_fee,
    p_payment_method: input.payment_method,
    p_items: input.items,
  });
  if (error) throw error;
  return data as string;
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  if (!isSupabaseConfigured) {
    return readLocalOrders().find((o) => o.order_number === orderNumber) ?? null;
  }
  // SECURITY DEFINER RPC: lets an anonymous shopper read just their own order
  // by number without granting blanket SELECT on the orders table.
  const { data, error } = await supabase.rpc("get_order_with_items", {
    p_order_number: orderNumber,
  });
  if (error) throw error;
  if (!data) return null;
  const row = data as Order & { items?: OrderItem[] };
  return { ...row, items: row.items ?? [] };
}

// Mark a simulated payment as confirmed.
export async function confirmPayment(orderNumber: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const orders = readLocalOrders().map((o) =>
      o.order_number === orderNumber
        ? {
            ...o,
            payment_status: "Pembayaran Dikonfirmasi (Simulasi)",
            order_status: "Pembayaran Dikonfirmasi (Simulasi)",
          }
        : o
    );
    writeLocalOrders(orders);
    return;
  }
  const { error } = await supabase.rpc("confirm_order_payment", {
    p_order_number: orderNumber,
  });
  if (error) throw error;
}

export async function listOrders(): Promise<Order[]> {
  if (!isSupabaseConfigured) return readLocalOrders();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as (Order & { order_items: OrderItem[] })[]).map((o) => {
    const { order_items, ...rest } = o;
    return { ...(rest as Order), items: order_items ?? [] };
  });
}

export async function updateOrderStatus(
  orderNumber: string,
  status: string
): Promise<void> {
  if (!isSupabaseConfigured) {
    const orders = readLocalOrders().map((o) =>
      o.order_number === orderNumber ? { ...o, order_status: status } : o
    );
    writeLocalOrders(orders);
    return;
  }
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status, updated_at: new Date().toISOString() })
    .eq("order_number", orderNumber);
  if (error) throw error;
}
