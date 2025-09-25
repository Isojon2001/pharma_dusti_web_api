import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import OrderHeader from '../components/OrderHeader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

function OrderBasket() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    removeFromCart, // Новый метод
  } = useCart();
  const { token } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = parseFloat(item['Цена']) || 0;
      return sum + price * item.quantity;
    }, 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0 || !token || isSubmitting) return;

    const payload = {
      items: cartItems
        .filter(item => item['Наименование'] && (item['Код'] || item['Артикул'] || item.id))
        .map(item => ({
          name: item['Наименование'],
          price: parseFloat(item['Цена']) || 0,
          product_code: item['Код'] || item['Артикул'] || item.id,
          quantity: item.quantity || 1,
        })),
    };

    try {
      setIsSubmitting(true);

      await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/orders',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowSuccessModal(true);
      clearCart();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        'Ошибка при отправке заказа';

      setErrorMessage(message);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="OrderBasket_content">
      <OrderHeader />

      <div className="OrderBasket_Header">
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/add-products-to-cart">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Корзина</h1>
        </div>

        <div className="table_basket">
          <div className="bg_table">
            <table className="table_info">
              <thead>
                <tr>
                  <th>Название продукта</th>
                  <th>Производитель</th>
                  <th>Срок годности</th>
                  <th>Цена</th>
                  <th>Кол-во</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="basket_empty">Корзина пуста</td>
                  </tr>
                ) : (
                  cartItems.map((item, index) => (
                    <tr key={item.id || index} className={index % 2 === 0 ? 'td_one' : 'td_two'}>
                      <td>{item['Наименование']}</td>
                      <td>{item['Производитель']}</td>
                      <td>{formatDate(item['Срок'])}</td>
                      <td>{item['Цена']} сом</td>
                      <td className='delete_basket_product'>

                        <div className="counter_table">
                          <button onClick={() => decreaseQuantity(item.id)}>-</button>
                          <p>{item.quantity}</p>
                          <button onClick={() => increaseQuantity(item.id)}>+</button>
                        </div>
                        <button
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                          title="Удалить из корзины"
                        >
                          <Trash2 size={25} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="detail_basket">
            <h2>Детали заказа</h2>
            <div>
              <p>Итоговая сумма:</p>
              <p>{calculateTotal().toFixed(2)} сом</p>
            </div>
            <button
              disabled={cartItems.length === 0 || isSubmitting}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? 'Загрузка...' : 'Оформить'}
            </button>
          </div>
        </div>
      </div>

      {showErrorModal && (
        <OrderErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />
      )}

      {showSuccessModal && (
        <OrderSuccessModal onClose={() => setShowSuccessModal(false)} />
      )}
    </div>
  );
}

function OrderErrorModal({ message, onClose }) {
  return (
    <div className="order-error__overlay">
      <div className="order-error__content">
        <div className="order-error__icon">
          <svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.5 5C44.3 5 55.5 16.2 55.5 30C55.5 43.8 44.3 55 30.5 55C16.7 55 5.5 43.8 5.5 30C5.5 16.2 16.7 5 30.5 5ZM25.2 21.2C24.7 20.7 24.1 20.4 23.5 20.4C22.9 20.4 22.2 20.6 21.8 21C21.3 21.5 21 22.1 20.9 22.7C20.9 23.3 21.1 23.96 21.5 24.5L26.96 30L21.66 35.3C21.2 35.8 20.9 36.4 20.9 37C20.9 37.6 21.1 38.25 21.5 38.7C21.9 39.2 22.6 39.5 23.2 39.6C23.8 39.6 24.5 39.4 25 39L30.5 33.5L36 39C36.5 39.5 37.1 39.8 37.7 39.8C38.3 39.8 39 39.5 39.5 39C40 38.5 40.3 38 40.3 37.3C40.3 36.7 40.1 36.05 39.7 35.6L34 30L39.3 24.7C39.8 24.2 40.1 23.6 40.1 23C40.1 22.4 39.9 21.7 39.5 21.3C39 20.8 38.4 20.5 37.8 20.4C37.2 20.4 36.5 20.6 36 21.1L30.5 26.5L25.2 21.2Z" fill="#EE4444" />
          </svg>
        </div>
        <h2 className="order-error__title">Заказ не оформлен</h2>
        <p className="order-error__message">{message || 'Обратитесь в поддержку'}</p>
        <button className="order-error__button" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

function OrderSuccessModal({ onClose }) {
  return (
    <div className="order-success__overlay">
      <div className="order-success__content">
        <div className="order-success__icon">
          <svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30.5 5C44.3 5 55.5 16.2 55.5 30C55.5 43.8 44.3 55 30.5 55C16.7 55 5.5 43.8 5.5 30C5.5 16.2 16.7 5 30.5 5ZM27 38L43 22L40.5 19.5L27 33L21 27L18.5 29.5L27 38Z" fill="#4BB543" />
          </svg>
        </div>
        <h2 className="order-success__title">Заказ оформлен</h2>
        <p className="order-success__message">Спасибо за ваш заказ!</p>
        <button className="order-success__button" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default OrderBasket;
