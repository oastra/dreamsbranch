"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  /** Canonical product slug — the server re-prices by this, never by `price`. */
  slug: string;
  title: string;
  /** Unit price in major units (e.g. dollars) — display only. */
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  /** True once localStorage has been read — gate UI that must not flash. */
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "dreams-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount (client-only) so SSR and the first client render agree
  // on an empty cart, then sync from storage. State must start empty on the
  // server, so this hydration genuinely needs setState in an effect.
  useEffect(() => {
    let initial: CartItem[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) initial = parsed;
      }
    } catch {
      // Corrupt/blocked storage — start empty.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(initial);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full/blocked — cart just won't persist this session.
    }
  }, [items, hydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) =>
      setItems((prev) => {
        const i = prev.findIndex((p) => p.slug === item.slug);
        if (i === -1) return [...prev, { ...item, quantity }];
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + quantity };
        return next;
      }),
    [],
  );

  const setQuantity = useCallback(
    (slug: string, quantity: number) =>
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((p) => p.slug !== slug)
          : prev.map((p) => (p.slug === slug ? { ...p, quantity } : p)),
      ),
    [],
  );

  const removeItem = useCallback(
    (slug: string) => setItems((prev) => prev.filter((p) => p.slug !== slug)),
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((n, it) => n + it.quantity, 0);
    const totalAmount = items.reduce((s, it) => s + it.price * it.quantity, 0);
    return {
      items,
      itemCount,
      totalAmount,
      hydrated,
      addItem,
      setQuantity,
      removeItem,
      clear,
    };
  }, [items, hydrated, addItem, setQuantity, removeItem, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
