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
import type { WishlistItem } from "./types";

interface WishlistContextValue {
  items: WishlistItem[];
  addItem: (product: Omit<WishlistItem, "addedAt">) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (product: Omit<WishlistItem, "addedAt">) => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

const STORAGE_KEY = "wishlist-items";

function loadFromStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: WishlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable -- silent fail
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // SSR-safe hydration
  useEffect(() => {
    setItems(loadFromStorage());
    setIsLoaded(true);
  }, []);

  // Persist on change after hydration
  useEffect(() => {
    if (isLoaded) {
      saveToStorage(items);
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product: Omit<WishlistItem, "addedAt">) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      return [...prev, { ...product, addedAt: new Date().toISOString() }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const isInWishlist = useCallback(
    (id: string) => items.some((i) => i.id === id),
    [items]
  );

  const toggleWishlist = useCallback(
    (product: Omit<WishlistItem, "addedAt">) => {
      setItems((prev) => {
        if (prev.some((i) => i.id === product.id)) {
          return prev.filter((i) => i.id !== product.id);
        }
        return [...prev, { ...product, addedAt: new Date().toISOString() }];
      });
    },
    []
  );

  const itemCount = useMemo(() => items.length, [items]);

  return (
    <WishlistContext.Provider
      value={{ items, addItem, removeItem, isInWishlist, toggleWishlist, itemCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a <WishlistProvider>");
  }
  return ctx;
}
