import { isSupabaseConfigured, supabase, STORAGE_BUCKET } from "../lib/supabase";
import { fallbackProducts } from "../data/products";
import { categories as categoryDefs } from "../config/site";
import type { Category, Product } from "../lib/types";

interface DbProductRow {
  id: string;
  name: string;
  subtitle: string | null;
  slug: string;
  category_id: string | null;
  price: number;
  sale_price: number | null;
  stock: number;
  dimensions: string | null;
  material: string | null;
  shipping: string | null;
  description: string | null;
  image_url: string | null;
  images: string[] | null;
  status: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
  categories?: { name: string; slug: string } | null;
}

function mapRow(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle,
    slug: row.slug,
    category_id: row.category_id,
    category_slug: row.categories?.slug ?? "",
    category_name: row.categories?.name ?? "",
    price: Number(row.price),
    sale_price: row.sale_price != null ? Number(row.sale_price) : null,
    stock: row.stock,
    dimensions: row.dimensions ?? "",
    material: row.material ?? "",
    shipping: row.shipping ?? "",
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    images: row.images ?? [],
    status: row.status ?? "Tersedia",
    is_active: row.is_active,
    is_featured: row.is_featured,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

const SELECT = "*, categories(name, slug)";

export interface ProductWritePayload {
  name: string;
  subtitle: string | null;
  slug: string;
  category_slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  dimensions: string;
  material: string;
  shipping: string;
  description: string;
  image_url: string;
  images: string[];
  status: string;
  is_featured: boolean;
}

interface DbCategoryRow {
  id: string;
  name: string;
  slug: string;
  blurb?: string | null;
  image_url?: string | null;
}

// Fall back to the curated config entry (blurb + image) when a DB row predates
// the 0003 migration or a new category has no image yet.
function configBySlug(slug: string) {
  return categoryDefs.find((c) => c.slug === slug);
}

function mapCategory(row: DbCategoryRow): Category {
  const cfg = configBySlug(row.slug);
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    blurb: row.blurb ?? cfg?.blurb ?? "",
    image_url: row.image_url ?? cfg?.image ?? "",
  };
}

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    return categoryDefs.map((c) => ({
      id: c.slug,
      name: c.name,
      slug: c.slug,
      blurb: c.blurb,
      image_url: c.image,
    }));
  }
  // select("*") tolerates the meta columns not existing yet (pre-migration).
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) throw error;
  return (data as DbCategoryRow[]).map(mapCategory);
}

export interface CategoryWritePayload {
  name: string;
  slug: string;
  blurb: string;
  image_url: string;
}

export async function createCategory(payload: CategoryWritePayload): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("categories").insert({
    name: payload.name,
    slug: payload.slug,
    blurb: payload.blurb,
    image_url: payload.image_url,
  });
  if (error) throw error;
}

export async function updateCategory(
  id: string,
  payload: CategoryWritePayload
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase
    .from("categories")
    .update({
      name: payload.name,
      slug: payload.slug,
      blurb: payload.blurb,
      image_url: payload.image_url,
    })
    .eq("id", id);
  if (error) throw error;
}

// Products reference category_id with ON DELETE SET NULL, so deleting a
// category leaves its products intact but uncategorised.
export async function deleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// Public catalog: only active products.
export async function listActiveProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) {
    return fallbackProducts.filter((p) => p.is_active);
  }
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbProductRow[]).map(mapRow);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return fallbackProducts.find((p) => p.slug === slug && p.is_active) ?? null;
  }
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as DbProductRow) : null;
}

// Admin: all products including archived.
export async function listAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return fallbackProducts;
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DbProductRow[]).map(mapRow);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured) {
    return fallbackProducts.find((p) => p.id === id) ?? null;
  }
  const { data, error } = await supabase
    .from("products")
    .select(SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRow(data as DbProductRow) : null;
}

async function resolveCategoryId(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function createProduct(payload: ProductWritePayload): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const category_id = await resolveCategoryId(payload.category_slug);
  const { error } = await supabase.from("products").insert({
    name: payload.name,
    subtitle: payload.subtitle,
    slug: payload.slug,
    category_id,
    price: payload.price,
    sale_price: payload.sale_price,
    stock: payload.stock,
    dimensions: payload.dimensions,
    material: payload.material,
    shipping: payload.shipping,
    description: payload.description,
    image_url: payload.image_url,
    images: payload.images,
    status: payload.status,
    is_featured: payload.is_featured,
    is_active: true,
  });
  if (error) throw error;
}

export async function updateProduct(
  id: string,
  payload: ProductWritePayload
): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const category_id = await resolveCategoryId(payload.category_slug);
  const { error } = await supabase
    .from("products")
    .update({
      name: payload.name,
      subtitle: payload.subtitle,
      slug: payload.slug,
      category_id,
      price: payload.price,
      sale_price: payload.sale_price,
      stock: payload.stock,
      dimensions: payload.dimensions,
      material: payload.material,
      shipping: payload.shipping,
      description: payload.description,
      image_url: payload.image_url,
      images: payload.images,
      status: payload.status,
      is_featured: payload.is_featured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

// Soft delete / archive: hides from public catalog but keeps order history intact.
export async function archiveProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function restoreProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase
    .from("products")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// Permanent delete (confirmation handled in the UI).
export async function deleteProduct(id: string): Promise<void> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!isSupabaseConfigured) throw new Error("Supabase belum dikonfigurasi.");
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
