import React, { useMemo, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import RequireAuth from './components/RequireAuth';

import LoginPage from './page/LoginPage';
import RegistrationPage from './page/RegistrationPage';
import Examination from './page/Examination';
import SetPassword from './page/SetPassword';

import AddProductsToCart from './page/AddProductsToСart';
import OrderBasket from './page/OrderBasket';
import HistoryOrder from './page/HistoryOrder';
import DetailedStory from './page/DetailedStory';
import ProfileOrder from './page/ProfileOrder';
import ChangePassword from './page/ChangePassword';
import Reporting from './page/Reporting';

import './index.css';

function App() {
  const { token, user, isLoading } = useAuth();
  const userId = useMemo(() => {
    return token && user && typeof user.id === 'string' ? user.id : null;
  }, [token, user]);

  useEffect(() => {
    console.log('Используемый userId для корзины:', userId);
  }, [userId]);

  if (isLoading) {
    console.log('Auth loading...');
    return null;
  }

  return (
    <CartProvider userId={userId}>
      <Routes>
        
        <Route path="/" element={token ? <Navigate to="/add-products-to-cart" /> : <LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/examination" element={<Examination />} />
        <Route path="/setPassword" element={<SetPassword />} />

        <Route path="/add-products-to-cart" element={<RequireAuth><AddProductsToCart /></RequireAuth>} />
        <Route path="/order-basket" element={<RequireAuth><OrderBasket /></RequireAuth>} />
        <Route path="/history-order" element={<RequireAuth><HistoryOrder /></RequireAuth>} />
        <Route path="/detailed-history/:order_id" element={<RequireAuth><DetailedStory /></RequireAuth>} />
        <Route path="/profile-order" element={<RequireAuth><ProfileOrder /></RequireAuth>} />
        <Route path="/change-password" element={<RequireAuth><ChangePassword /></RequireAuth>} />
        <Route path="/reporting" element={<RequireAuth><Reporting /></RequireAuth>} />
      </Routes>
    </CartProvider>
  );
}

export default App;
