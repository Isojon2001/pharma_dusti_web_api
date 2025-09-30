import React, { useState, useEffect } from 'react';
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
    updateQuantity,
    updateBatchIndex, // Предполагаем, что есть метод для обновления выбранной партии
  } = useCart();
  const { token } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Локальное состояние для input количества — ключ: productId, значение: строка (позволяет пустое поле)
  const [inputValues, setInputValues] = useState({});

  // Синхронизируем локальный inputValues с cartItems при изменении корзины
  useEffect(() => {
    const newInputValues = {};
    cartItems.forEach(item => {
      const key = item.id || item['Код'] || item['Артикул'];
      // Берём количество выбранной партии или 1 по умолчанию
      const selectedIndex = item.selectedBatchIndex ?? 0;
      const qty = item.batches?.[selectedIndex]?.quantity ?? item.quantity ?? 1;
      newInputValues[key] = qty.toString();
    });
    setInputValues(newInputValues);
  }, [cartItems]);

  // Форматируем дату в читаемый формат
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  // Подсчёт общей суммы по выбранным партиям и количеству
  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const selectedIndex = item.selectedBatchIndex ?? 0;
      const batch = item.batches?.[selectedIndex];
      const price = batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
      const qty = Number(inputValues[item.id || item['Код'] || item['Артикул']] || item.quantity || 1);
      if (isNaN(qty) || qty < 1) return sum;
      return sum + price * qty;
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0 || !token || isSubmitting) return;

    const payload = {
      items: cartItems
        .filter(item => item['Наименование'] && (item['Код'] || item['Артикул'] || item.id))
        .map(item => {
          const selectedIndex = item.selectedBatchIndex ?? 0;
          const batch = item.batches?.[selectedIndex];
          const qty = Number(inputValues[item.id || item['Код'] || item['Артикул']] || item.quantity || 1);

          return {
            name: item['Наименование'],
            price: batch ? parseFloat(batch.price) : parseFloat(item['Цена']) || 0,
            product_code: item['Код'] || item['Артикул'] || item.id,
            quantity: qty >= 1 ? qty : 1,
            expiry: batch?.expiry || null,
          };
        }),
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

  const handleQuantityChange = (productId, value) => {
    setInputValues(prev => ({ ...prev, [productId]: value }));

    if (value === '') return;

    const numericValue = Number(value);

    if (!isNaN(numericValue) && numericValue >= 1) {
      updateQuantity(productId, numericValue);
    }
  };

  const handleBatchChange = (productId, batchIndex) => {
    updateBatchIndex(productId, batchIndex);
  };

  return (
    <div className="OrderBasket_content">
      <div className='basket_backs'>
        <OrderHeader />
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/add-products-to-cart">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Корзина</h1>
        </div>
      </div>

      <div className="OrderBasket_Header">
        <div className="table_basket">
          <div className="table_scrollable">
            <div className="bg_table">
              <table className="table_info">
                <thead>
                  <tr className='table_infos'>
                    <th>№</th>
                    <th>Производитель</th>
                    <th>Наименование</th>
                    <th>Кол-во</th>
                    <th>Цена</th>
                    <th>Срок годности</th>
                    <th className='price_basket'>Сумма</th>
                    <th>Удалить</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="basket_empty">Корзина пуста</td>
                    </tr>
                  ) : (
                    cartItems.map((item, index) => {
                      const key = item.id || item['Код'] || item['Артикул'];
                      const selectedIndex = item.selectedBatchIndex ?? 0;
                      const batchesSorted = (item.batches || []).slice().sort((a, b) => new Date(a.expiry) - new Date(b.expiry));
                      const selectedBatch = batchesSorted[selectedIndex];

                      const qty = Number(inputValues[key] ?? item.quantity ?? 1);
                      const price = selectedBatch ? parseFloat(selectedBatch.price) : parseFloat(item['Цена'] || 0);
                      const sum = price * (qty >= 1 ? qty : 0);

                      return (
                        <tr key={key || index} className={index % 2 === 0 ? 'td_even' : 'td_odd'}>
                          <td>{index + 1}</td>
                          <td>{item['Производитель'] || 'Неизвестен'}</td>
                          <td>{item['Наименование']}</td>
                          <td>
                            <div className="counter_table">
                              <button onClick={() => decreaseQuantity(key)}>-</button>
                              <input
                                type="number"
                                name="quantity"
                                id={`quantity-${key}`}
                                value={inputValues[key] ?? item.quantity ?? 1}
                                onChange={e => handleQuantityChange(key, e.target.value)}
                                min={1}
                              />
                              <button onClick={() => increaseQuantity(key)}>+</button>
                            </div>
                          </td>
                          <td>{price.toFixed(2)}</td>
                          <td>
                            {batchesSorted.length > 0 ? (
                              <select
                                value={selectedIndex}
                                onChange={e => handleBatchChange(key, Number(e.target.value))}
                              >
                                {batchesSorted.map((batch, i) => (
                                  <option key={batch.expiry} value={i}>
                                    {formatDate(batch.expiry)}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              formatDate(item['Срок'])
                            )}
                          </td>
                          <td className='basket_price'>{sum.toFixed(2)}</td>
                          <td>
                            <button
                              className="remove-btn"
                              onClick={() => removeFromCart(key)}
                              title="Удалить из корзины"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
            <div className="detail_basket">
              <h2>Детали заказа</h2>
              <div className='detailed_inf'>
                <p>Итоговая сумма:</p>
                <div className='detailed_btn'>
                  <p>{calculateTotal().toFixed(2)}</p>
                  <button
                    disabled={cartItems.length === 0 || isSubmitting}
                    onClick={handleSubmitOrder}
                  >
                    {isSubmitting ? 'Загрузка...' : 'Оформить'}
                  </button>
                </div>
              </div>
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
