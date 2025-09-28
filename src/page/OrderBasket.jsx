import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import OrderHeader from '../components/OrderHeader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderSuccessModal from '../components/OrderSuccessModal';
import OrderErrorModal from '../components/OrderErrorModal';

function OrderBasket() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    removeFromCart,
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
          <div className="table_scrollable">
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
export default OrderBasket;