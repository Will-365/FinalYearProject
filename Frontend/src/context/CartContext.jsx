import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CART_KEY = 'greencare_cart';

const CartContext = createContext(null);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    if (!product?._id) return;
    const qty = Math.max(1, quantity);
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === product._id);
      if (idx >= 0) {
        const next = [...prev];
        const maxStock = product.stock ?? next[idx].product?.stock ?? 99;
        next[idx] = {
          ...next[idx],
          quantity: Math.min(maxStock, next[idx].quantity + qty),
          product: { ...next[idx].product, ...product },
        };
        return next;
      }
      return [...prev, { productId: product._id, product, quantity: Math.min(qty, product.stock || qty) }];
    });
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => {
        if (i.productId !== productId) return i;
        const maxStock = i.product?.stock ?? quantity;
        return { ...i, quantity: Math.min(maxStock, quantity) };
      });
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const syncStock = useCallback((products = []) => {
    const map = Object.fromEntries(products.map((p) => [p._id, p]));
    setItems((prev) =>
      prev
        .map((i) => {
          const fresh = map[i.productId];
          if (!fresh || fresh.stock <= 0) return null;
          return {
            ...i,
            product: fresh,
            quantity: Math.min(i.quantity, fresh.stock),
          };
        })
        .filter(Boolean)
    );
  }, []);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, { product, quantity }) => ({
        points: acc.points + (product.pointsCost || 0) * quantity,
        cash: acc.cash + (product.cashPrice || 0) * quantity,
        phone: acc.phone + (product.phonePrice || product.cashPrice || 0) * quantity,
        count: acc.count + quantity,
      }),
      { points: 0, cash: 0, phone: 0, count: 0 }
    );
  }, [items]);

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, syncStock, totals, itemCount: totals.count }),
    [items, addItem, updateQuantity, removeItem, clearCart, syncStock, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
