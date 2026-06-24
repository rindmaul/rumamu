import type { Product } from "./types";

type Priced = Pick<Product, "price" | "sale_price">;

// A product is "on sale" only when it has a positive promo price below the
// regular price. Guards against 0 / null / accidental higher values.
export function isOnSale(p: Priced): boolean {
  return p.sale_price != null && p.sale_price > 0 && p.sale_price < p.price;
}

// The price the customer actually pays (promo price when on sale, else regular).
export function effectivePrice(p: Priced): number {
  return isOnSale(p) ? (p.sale_price as number) : p.price;
}

// Rounded discount percentage, e.g. 20 for "20% off". 0 when not on sale.
export function discountPercent(p: Priced): number {
  if (!isOnSale(p)) return 0;
  return Math.round((1 - (p.sale_price as number) / p.price) * 100);
}
