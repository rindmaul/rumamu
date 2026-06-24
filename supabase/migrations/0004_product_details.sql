-- ============================================================================
-- rumamu - 0004_product_details.sql
-- Per-product material & shipping info so admins can edit what shows on the
-- product page (previously hardcoded templates in ProductDetail).
-- RLS unchanged: products already have public read + admin-only writes (0001).
-- Safe to re-run.
-- ============================================================================

alter table public.products
  add column if not exists material text,
  add column if not exists shipping text;
