import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
const CartContext = createContext();
export function CartProvider({ children, userId }) {
  const [cartItems, setCartItems] = useState([]);
  const hasLoadedCart = useRef(false);

  useEffect(() => {
    if (!userId || hasLoadedCart.current) return;
    const storageKey = `cart_${userId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      const valid = parsed.filter(item => item.id || item["Код"] || item["Артикул"]);
      setCartItems(valid);

      hasLoadedCart.current = true;
    } catch (e) {
      console.error('Ошибка загрузки корзины', e);
      setCartItems([]);
      hasLoadedCart.current = true;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !hasLoadedCart.current) return;
    const storageKey = `cart_${userId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Ошибка сохранения корзины', e);
    }
  }, [cartItems, userId]);

  function addToCart(product) {
    const key = product.id || product["Код"] || product["Артикул"];
    if (!key) return;
    const stock = Number(product["Количество"] ?? 999999999);
    setCartItems(prev => {
      const existing = prev.find(item => item.productKey === key);
      if (existing) {
        return prev.map(item =>
          item.productKey === key
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          productKey: key,
          stock,
          quantity: 1,
          selectedBatchIndex: 0
        }
      ];
    });
  }
  function updateQuantity(productId, newQuantity) {
  const qty = Number(newQuantity);
  if (isNaN(qty)) return;

  setCartItems(prev =>
    prev.map(item =>
      item.productKey === productId
        ? { ...item, quantity: qty }
        : item
    )
  );
}

function increaseQuantity(productId) {
  setCartItems(prev =>
    prev.map(item =>
      item.productKey === productId
        ? { ...item, quantity: item.quantity + 1 }
        : item
    )
  );
}

function decreaseQuantity(productId) {
  setCartItems(prev =>
    prev.map(item =>
      item.productKey === productId
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
  );
}

  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(item => item.productKey !== productId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        updateQuantity
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}