import { useEffect } from "react";
import { site } from "../config/site";

// Lightweight per-page SEO without an external library. Sets the document
// title plus the description / Open Graph / Twitter meta tags so each route
// gets a distinct title and share preview — important for a real storefront.

const SITE_NAME = site.brand;
const DEFAULT_DESCRIPTION =
  "rumamu — koleksi furnitur rotan pilihan yang menghadirkan kehangatan alami di setiap sudut rumahmu.";

// Compose a page-specific title with the brand suffix.
export function pageTitle(label: string): string {
  return `${label} — ${SITE_NAME}`;
}

function upsertMeta(keyAttr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${keyAttr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(keyAttr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function usePageMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    document.title = title;
    const desc = description ?? DEFAULT_DESCRIPTION;
    upsertMeta("name", "description", desc);
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:type", "website");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", title);
    upsertMeta("name", "twitter:description", desc);
  }, [title, description]);
}
