import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function OrderHeader() {
  const { cartItems } = useCart();

  const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <div className="AddProductsToСart">
      <div className="logo_login">
        <div className="logo_img">
          <img src="./Logo.png" alt="logo" />
        </div>
        <h3>ДУСТИ</h3>
        <h3>Фарма</h3>
      </div>

      <div className="products_profile">
        <div className="products_story">
          <Link to="/orders/history">
            <div className="products_story">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="..." fill="#0F7372" />
              </svg>
              <p>История заказов</p>
            </div>
          </Link>
        </div>

        <div className="products_cart">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="..." fill="#0F7372" />
          </svg>
          {totalCount > 0 && (
            <span className="cart_count">{totalCount}</span>
          )}
        </div>

        <div className="products_user">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="..." fill="#0F7372" />
            <path d="..." fill="#0F7372" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default OrderHeader;
