import { createContext, useContext, useMemo, useState } from 'react';

const CartCtx = createContext({
  items: [],
  addItem: () => {},
  updateItem: () => {},
  removeItem: () => {},
  clearCart: () => {},
  subtotal: 0,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (product, options = {}) => {
    setItems((prev) => {
      const key = `${product.id}-${options.size || ''}`;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: i.quantity + (options.quantity || 1) } : i,
        );
      }
      return [
        ...prev,
        {
          key,
          product,
          size: options.size || null,
          quantity: options.quantity || 1,
        },
      ];
    });
  };

  const updateItem = (key, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    );
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + (item.product.price || 0) * item.quantity,
        0,
      ),
    [items],
  );

  return (
    <CartCtx.Provider
      value={{ items, addItem, updateItem, removeItem, clearCart, subtotal }}
    >
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  return useContext(CartCtx);
}

