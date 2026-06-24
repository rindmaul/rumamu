-- Optional promo/discount price. When set and lower than `price`, the storefront
-- shows the original price struck through, the promo price, and a discount badge.
alter table public.products
  add column if not exists sale_price numeric;
