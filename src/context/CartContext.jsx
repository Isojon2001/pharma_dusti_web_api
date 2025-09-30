import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children, userId }) {
  const [cartItems, setCartItems] = useState([]);
  const hasLoadedCart = useRef(false);

  // Загрузка корзины из localStorage
  useEffect(() => {
    if (!userId || hasLoadedCart.current) return;

    const storageKey = `cart_${userId}`;
    try {
      const savedCart = localStorage.getItem(storageKey);
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      const validItems = parsed.filter(item => item.id || item['Код'] || item['Артикул']);

      setCartItems(validItems);
      hasLoadedCart.current = true;
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage', error);
      setCartItems([]);
      hasLoadedCart.current = true;
    }
  }, [userId]);

  // Сохранение корзины в localStorage при изменениях
  useEffect(() => {
    if (!userId || !hasLoadedCart.current) return;

    const storageKey = `cart_${userId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Ошибка сохранения корзины', error);
    }
  }, [cartItems, userId]);

  // Функция для обновления количества товара
  function updateQuantity(productId, newQuantity) {
    const qty = Number(newQuantity);
    if (qty < 1) return; // минимум 1

    setCartItems(prevItems =>
      prevItems.map(item => {
        const key = item.id || item['Код'] || item['Артикул'];
        if (key === productId) {
          return { ...item, quantity: qty };
        }
        return item;
      })
    );
  }

  function addToCart(product) {
    const productKey = product.id || product['Код'] || product['Артикул'];
    const quantityToAdd = product.quantity || 1;

    if (!productKey) {
      console.warn('Нет ключа для товара:', product);
      return;
    }

    setCartItems(prevItems => {
      const existing = prevItems.find(item =>
        (item.id || item['Код'] || item['Артикул']) === productKey
      );

      if (existing) {
        return prevItems.map(item =>
          (item.id || item['Код'] || item['Артикул']) === productKey
            ? { ...item, quantity: (item.quantity || 1) + quantityToAdd }
            : item
        );
      }

      return [...prevItems, { ...product, id: productKey, quantity: quantityToAdd }];
    });
  }

  function clearCart() {
    setCartItems([]);
  }

  function increaseQuantity(productId) {
    setCartItems(prevItems =>
      prevItems.map(item =>
        (item.id || item['Код'] || item['Артикул']) === productId
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(productId) {
    setCartItems(prevItems =>
      prevItems.reduce((acc, item) => {
        const key = item.id || item['Код'] || item['Артикул'];
        if (key === productId) {
          const newQty = (item.quantity || 1) - 1;
          if (newQty > 0) acc.push({ ...item, quantity: newQty });
        } else {
          acc.push(item);
        }
        return acc;
      }, [])
    );
  }

  function removeFromCart(productId) {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        (item.id || item['Код'] || item['Артикул']) !== productId
      )
    );
  }

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

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
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
