-- ============================================================================
-- rumamu - 0005_product_gallery.sql
-- Extra gallery images per product. `image_url` stays the cover (used by cards,
-- cart, listings); `images` holds additional photos shown on the product page.
-- RLS unchanged (public read + admin-only writes from 0001). Safe to re-run.
-- ============================================================================

alter table public.products
  add column if not exists images text[] not null default '{}';
