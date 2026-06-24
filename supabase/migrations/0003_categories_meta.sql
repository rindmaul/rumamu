-- ============================================================================
-- rumamu - 0003_categories_meta.sql
-- Adds editorial metadata to categories so admins can manage them fully
-- (name + slug already existed; blurb + image_url power the storefront cards).
-- RLS is unchanged: public read + admin-only writes are already in place from
-- 0001 (categories_public_read / categories_admin_all).
-- Safe to re-run.
-- ============================================================================

alter table public.categories
  add column if not exists blurb text,
  add column if not exists image_url text;
