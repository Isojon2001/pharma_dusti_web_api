import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const CartContext = createContext();

export function CartProvider({ children, userId }) {
  const [cartItems, setCartItems] = useState([]);
  const hasLoadedCart = useRef(false);

  useEffect(() => {
    if (!userId || hasLoadedCart.current) return;

    const storageKey = `cart_${userId}`;
    try {
      const savedCart = localStorage.getItem(storageKey);
      const parsed = savedCart ? JSON.parse(savedCart) : [];

      const validItems = parsed.filter(item => item.id || item['Код'] || item['Артикул']);
      console.log('Загружаем корзину один раз:', storageKey, validItems);

      setCartItems(validItems);
      hasLoadedCart.current = true;
    } catch (error) {
      console.error('Ошибка загрузки корзины из localStorage', error);
      setCartItems([]);
      hasLoadedCart.current = true;
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !hasLoadedCart.current) return;

    const storageKey = `cart_${userId}`;
    try {
      const current = localStorage.getItem(storageKey);
      const currentParsed = current ? JSON.parse(current) : [];
      const isEqual = JSON.stringify(currentParsed) === JSON.stringify(cartItems);
      if (isEqual) return;

      console.log('Сохраняем корзину:', storageKey, cartItems);
      localStorage.setItem(storageKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error('Ошибка сохранения корзины', error);
    }
  }, [cartItems, userId]);

  function addToCart(product) {
    const productKey = product.id || product['Код'] || product['Артикул'];
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
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }

      return [...prevItems, { ...product, id: productKey, quantity: 1 }];
    });
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
          if ((item.quantity || 1) > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
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
    <CartContext.Provider value={{
      cartItems,
      cartCount,
      addToCart,
      removeFromCart,
      increaseQuantity,
      decreaseQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
