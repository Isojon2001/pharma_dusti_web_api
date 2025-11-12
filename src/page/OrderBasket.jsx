import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, Trash2 } from 'lucide-react';
import axios from 'axios';
import '../index.css';
import OrderHeader from '../components/OrderHeader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import OrderSuccessModal from '../components/OrderSuccessModal';
import OrderErrorModal from '../components/OrderErrorModal';
import ConfirmOrderModal from '../components/ConfirmOrderModal';

function OrderBasket() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    removeFromCart,
    updateQuantity,
    updateBatchIndex,
  } = useCart();

  const { token } = useAuth();

  const [inputValues, setInputValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '№', direction: 'asc' });

  useEffect(() => {
    const newInputValues = {};
    cartItems.forEach(item => {
      const key = item.id || item['Код'] || item['Артикул'];
      const selectedIndex = item.selectedBatchIndex ?? 0;
      const qty = item.batches?.[selectedIndex]?.quantity ?? item.quantity ?? 1;
      newInputValues[key] = qty.toString();
    });
    setInputValues(newInputValues);
  }, [cartItems]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

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

  const calculateTotalQuantity = () => {
    return cartItems.reduce((total, item) => {
      const key = item.id || item['Код'] || item['Артикул'];
      const qty = Number(inputValues[key] || item.quantity || 1);
      return total + (isNaN(qty) || qty < 1 ? 0 : qty);
    }, 0);
  };

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0 || !token || isSubmitting) return;
    const payload = { items: cartItems };

    try {
      setIsSubmitting(true);
      await axios.post(
        'https://api.dustipharma.tj:1212/api/v1/app/orders',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSuccessModal(true);
      clearCart();
    } catch (error) {
      const message = Array.isArray(error.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error.response?.data?.message || error.message || 'Ошибка при отправке заказа';
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

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedItems = [...cartItems].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const getValue = (item) => {
      switch (sortConfig.key) {
        case '№':
          return item.id || item['Код'] || item['Артикул'];
        case 'Производитель':
          return item['Производитель'] || '';
        case 'Наименование':
          return item['Наименование'] || '';
        case 'Кол-во': {
          const key = item.id || item['Код'] || item['Артикул'];
          return Number(inputValues[key] ?? item.quantity ?? 1);
        }
        case 'Цена': {
          const selectedIndex = item.selectedBatchIndex ?? 0;
          const batch = item.batches?.[selectedIndex];
          return batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
        }
        case 'Срок годности': {
          const selectedIndex = item.selectedBatchIndex ?? 0;
          const batch = item.batches?.[selectedIndex];
          return batch?.expiry ? new Date(batch.expiry).getTime() : 0;
        }
        case 'Сумма': {
          const selectedIndex = item.selectedBatchIndex ?? 0;
          const batch = item.batches?.[selectedIndex];
          const price = batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
          const key = item.id || item['Код'] || item['Артикул'];
          const qty = Number(inputValues[key] ?? item.quantity ?? 1);
          return price * qty;
        }
        default:
          return '';
      }
    };

    const aVal = getValue(a);
    const bVal = getValue(b);

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  return (
    <div className="OrderBasket_content">
      <div className="basket_backs">
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
      <div className="order_basket_tables">
        <div className="order_basket_table">
          <div className="OrderBasket_Header">
            <div className="table_basket">
              <div className="table_scrollable">
                <table className="table_info">
                  <thead>
                    <tr className="table_infos">
                      {['№','Производитель','Наименование','Кол-во','Цена','Срок годности','Сумма'].map(col => (
                        <th key={col} onClick={() => handleSort(col)}>
                          {col} {sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '▲▼'}
                        </th>
                      ))}
                      <th>Удалить</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="basket_empty">Корзина пуста</td>
                      </tr>
                    ) : (
                      sortedItems.map((item, index) => {
                        const key = `${item.id || item['Код'] || item['Артикул']}_${index}`;
                        const selectedIndex = item.selectedBatchIndex ?? 0;
                        const batchesSorted = (item.batches || []).slice().sort((a, b) =>
                          (a.expiry ? new Date(a.expiry) : Infinity) - (b.expiry ? new Date(b.expiry) : Infinity)
                        );
                        const selectedBatch = batchesSorted[selectedIndex];
                                                const qty = Number(inputValues[item.id || item['Код'] || item['Артикул']] ?? item.quantity ?? 1);
                        const price = selectedBatch ? parseFloat(selectedBatch.price) : parseFloat(item['Цена'] || 0);
                        const sum = price * (qty >= 1 ? qty : 0);

                        return (
                          <tr key={key} className={index % 2 === 0 ? 'td_even' : 'td_odd'}>
                            <td className="numeration_basket">{index + 1}</td>
                            <td className="pro_basket">{item['Производитель'] || ''}</td>
                            <td>{item['Наименование']}</td>
                            <td>
                              <div className="counter_table">
                                <button onClick={() => decreaseQuantity(key)}>-</button>
                                <input
                                  type="number"
                                  id={`quantity-${key}`}
                                  value={inputValues[item.id || item['Код'] || item['Артикул']] ?? item.quantity ?? 1}
                                  onChange={(e) => handleQuantityChange(item.id || item['Код'] || item['Артикул'], e.target.value)}
                                  min={1}
                                />
                                <button onClick={() => increaseQuantity(key)}>+</button>
                              </div>
                            </td>
                            <td className="plice_basket">{price.toFixed(2)}</td>
                            <td className="expiration_date">
                              {batchesSorted.length > 0 ? (
                                <select
                                  value={selectedIndex}
                                  onChange={(e) => handleBatchChange(key, Number(e.target.value))}
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
                            <td className="basket_price">{sum.toFixed(2)}</td>
                            <td>
                              <button
                                className="remove-btn"
                                onClick={() => removeFromCart(key)}
                                title="Удалить из корзины">
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
              <div className="detail_basket">
                <div>
                  <h2>Детали заказа</h2>
                  <div className="detailed_btn">
                    <button
                      onClick={() => clearCart()}
                      disabled={cartItems.length === 0}>
                      <Trash2 size={18} style={{ marginRight: '6px' }} />
                      Удалить всё
                    </button>
                  </div>
                </div>
                <div className="detailed_inf">
                  <div className="detailed_rows">
                    <div className="detailed_row">
                      <p>{calculateTotalQuantity()} шт.</p>
                      <p>Общее кол-во.</p>
                    </div>
                    <div className="detailed_row">
                      <p>{calculateTotal().toFixed(2)}</p>
                      <div className="detailed_btn">
                        <p>Итоговая сумма.</p>
                        <button
                          disabled={cartItems.length === 0 || isSubmitting}
                          onClick={() => setShowConfirmModal(true)}>
                          {isSubmitting ? 'Загрузка...' : 'Оформить'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
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
      {showConfirmModal && (
        <ConfirmOrderModal
          onConfirm={() => {
            setShowConfirmModal(false);
            handleSubmitOrder();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}
    </div>
  );
}

export default OrderBasket;
