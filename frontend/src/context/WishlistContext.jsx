import { createContext, useContext, useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ecommerce_wishlist';

const WishlistCtx = createContext({
  wishlistIds: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
});

function loadFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(ids) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.warn('Wishlist save failed', e);
  }
}

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    setWishlistIds(loadFromStorage());
  }, []);

  const persist = useCallback((ids) => {
    setWishlistIds(ids);
    saveToStorage(ids);
  }, []);

  const addToWishlist = useCallback((id) => {
    persist((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, [persist]);

  const removeFromWishlist = useCallback((id) => {
    persist((prev) => prev.filter((x) => x !== id));
  }, [persist]);

  const isInWishlist = useCallback((id) => wishlistIds.includes(id), [wishlistIds]);

  return (
    <WishlistCtx.Provider value={{ wishlistIds, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistCtx.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistCtx);
}
