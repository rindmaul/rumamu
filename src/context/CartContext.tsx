import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Product } from "../lib/types";
import { effectivePrice } from "../lib/price";

const STORAGE_KEY = "rumamu_cart";

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  /** Returns false if requested quantity exceeds stock. */
  addItem: (product: Product, quantity?: number) => boolean;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);

function load(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(product: Product, quantity = 1): boolean {
    if (quantity <= 0) return false;
    const existing = items.find((i) => i.productId === product.id);
    const current = existing?.quantity ?? 0;
    const desired = current + quantity;
    if (desired > product.stock) {
      // Cap at available stock; signal that we could not add the full amount.
      if (current >= product.stock) return false;
      setItems((prev) =>
        prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: product.stock } : i
        )
      );
      return false;
    }
    if (existing) {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: desired } : i
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: effectivePrice(product),
          image_url: product.image_url,
          stock: product.stock,
          quantity,
        },
      ]);
    }
    return true;
  }

  function setQuantity(productId: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function clear() {
    setItems([]);
  }

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return { items, count, subtotal, addItem, setQuantity, removeItem, clear };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
  return ctx;
}
