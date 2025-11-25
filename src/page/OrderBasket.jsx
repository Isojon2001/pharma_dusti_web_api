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
import FixQuantityModal from '../components/FixQuantityModal';
import ConfirmClearCartModal from '../components/ConfirmClearCartModal';
import ConfirmOrderModal from '../components/ConfirmOrderModal';

function OrderBasket() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    removeFromCart,
    updateQuantity,
    updateBatchIndex
  } = useCart();

  const { token } = useAuth();
  const [inputValues, setInputValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState("");
  const [showFixModal, setShowFixModal] = useState(false);
  const [fixProducts, setFixProducts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: '№', direction: 'asc' });
useEffect(() => {
  setInputValues(prevValues => {
    const newValues = {};
    cartItems.forEach(item => {
      const key = item.id || item['Код'] || item['Артикул'];
      newValues[key] = prevValues[key] ?? item.quantity?.toString() ?? '1';
    });
    return newValues;
  });
}, [cartItems]);

  const formatDate = (dateStr) =>
    !dateStr || dateStr === '0001-01-01T00:00:00Z'
      ? '—'
      : new Date(dateStr).toLocaleDateString('ru-RU');

      const handleQuantityChange = (id, value) => {
  let num = Number(value);
  if (isNaN(num) || num <= 0) return;

  setInputValues(prev => ({ ...prev, [id]: num.toString() }));
  updateQuantity(id, num);
};


  const handleBatchChange = (id, batchIndex) => {
    updateBatchIndex(id, batchIndex);
  };


  const calculateTotal = () =>
    cartItems.reduce((sum, item) => {
      const idKey = item.id || item['Код'] || item['Артикул'];
      const qty = Number(inputValues[idKey] ?? item.quantity ?? 1);

      const batch = item.batches?.[item.selectedBatchIndex ?? 0];
      const price = batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);

      return sum + (isNaN(qty) ? 0 : price * qty);
    }, 0);


  const calculateTotalQuantity = () =>
    cartItems.reduce((total, item) => {
      const idKey = item.id || item['Код'] || item['Артикул'];
      const qty = Number(inputValues[idKey] ?? item.quantity ?? 1);
      return total + qty;
    }, 0);


  const groupCartItems = (items) => {
    return items.map(item => {
      const idKey = item.id || item["Код"] || item["Артикул"];
      const qty = Number(inputValues[idKey] ?? item.quantity ?? 1);

      const batch = item.batches?.[item.selectedBatchIndex ?? 0];

      return {
        product_code: item["Код"],
        name: item["Наименование"],
        price: batch ? parseFloat(batch.price) : parseFloat(item["Цена"]),
        expiry: batch?.expiry ?? item["Срок"],
        quantity: qty
      };
    });
  };
const checkStock = () => {
  const exceeded = [];

  cartItems.forEach(item => {
    const idKey = item.id || item["Код"] || item["Артикул"];
    const stock = Number(item["Количество"] ?? 0);
    const ordered = Math.max(1, Number(inputValues[idKey] ?? item.quantity ?? 1));

    if (ordered > stock) {
      exceeded.push({
        idKey,
        manufacturer: item["Производитель"] || "",
        name: item["Наименование"],
        stock,
        newQty: stock
      });
    }
  });

  return exceeded;
};



const handleQuantityFix = (id, newQty) => {
  const qty = Number(newQty);
  setInputValues(prev => ({ ...prev, [id]: qty }));
  updateQuantity(id, qty);
};

  const handleSubmitOrder = async () => {
    if (!token || cartItems.length === 0 || isSubmitting) return;

    const exceeded = checkStock();
    if (exceeded.length > 0) {
      setFixProducts(checkStock());
      setShowFixModal(true);
      return;
    }

    try {
      setIsSubmitting(true);

      await axios.post(
        "https://api.dustipharma.tj:1212/api/v1/app/orders",
        { items: groupCartItems(cartItems) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowSuccessModal(true);
      clearCart();

    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "Произошла ошибка при оформлении заказа";

      setApiErrorMessage(msg);
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction:
        prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };


  const sortedItems = [...cartItems].sort((a, b) => {
    const getVal = (item) => {
      const idKey = item.id || item["Код"] || item["Артикул"];

      switch (sortConfig.key) {
        case "№":
          return idKey;
        case "Производитель":
          return item["Производитель"] || "";
        case "Наименование":
          return item["Наименование"] || "";
        case "Кол-во":
          return Number(inputValues[idKey] ?? item.quantity ?? 1);
        case "Цена": {
          const batch = item.batches?.[item.selectedBatchIndex ?? 0];
          return batch ? parseFloat(batch.price) : parseFloat(item["Цена"] || 0);
        }
        case "Срок годности": {
          const batch = item.batches?.[item.selectedBatchIndex ?? 0];
          const date = batch?.expiry || item["Срок"];
          return date ? new Date(date).getTime() : Infinity;
        }
        case "Сумма": {
          const qty = Number(inputValues[idKey] ?? item.quantity ?? 1);
          const batch = item.batches?.[item.selectedBatchIndex ?? 0];
          const price = batch ? parseFloat(batch.price) : parseFloat(item["Цена"]);
          return qty * price;
        }
        default:
          return "";
      }
    };

    const aVal = getVal(a);
    const bVal = getVal(b);

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }

    return sortConfig.direction === "asc"
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
                      {["№", "Производитель", "Наименование", "Кол-во", "Цена", "Срок годности", "Сумма"].map(col => (
                        <th key={col} onClick={() => handleSort(col)}>
                          {col} {sortConfig.key === col ? (sortConfig.direction === "asc" ? "▲" : "▼") : "▲▼"}
                        </th>
                      ))}
                      <th>Удалить</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="basket_empty">
                          Корзина пуста
                        </td>
                      </tr>
                    ) : (
                      sortedItems.map((item, idx) => {
                        const idKey = item.id || item["Код"] || item["Артикул"];
                        const selectedIndex = item.selectedBatchIndex ?? 0;
                        const batch = item.batches?.[selectedIndex];
                        const qty = Number(inputValues[idKey] ?? item.quantity ?? 1);
                        const price = batch ? parseFloat(batch.price) : parseFloat(item["Цена"] || 0);
                        return (
                          <tr key={`${idKey}_${idx}`} className={idx % 2 === 0 ? "td_even" : "td_odd"}>
                            <td className="numeration_basket">{idx + 1}</td>
                            <td>{item["Производитель"] || ""}</td>
                            <td>{item["Наименование"]}</td>
                            <td>
                              <div className="counter_table">
                                <button
                                  onClick={() => {
                                    const newQty = Math.max(1, (Number(inputValues[idKey] ?? item.quantity) - 1));
                                    decreaseQuantity(idKey);
                                    handleQuantityChange(idKey, newQty.toString());
                                  }}
                                >
                                  -
                                </button>
                                  <input
                                    type="number"
                                    value={inputValues[idKey]}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      if (val === '') {
                                        setInputValues(prev => ({ ...prev, [idKey]: '' }));
                                        return;
                                      }
                                      const num = Number(val);
                                      if (!isNaN(num) && num > 0) {
                                        handleQuantityChange(idKey, num.toString());
                                      }
                                    }}
                                    onBlur={() => {
                                      if (inputValues[idKey] === '' || Number(inputValues[idKey]) <= 0) {
                                        handleQuantityChange(idKey, '1');
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (["-", "+", "e", "E"].includes(e.key)) e.preventDefault();
                                    }}
                                  />
                                <button
                                  onClick={() => {
                                    const newQty = (Number(inputValues[idKey] ?? item.quantity) + 1);
                                    increaseQuantity(idKey);
                                    handleQuantityChange(idKey, newQty.toString());
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>{price.toFixed(2)}</td>
                            <td>
                              {item.batches?.length ? (
                                <select
                                  value={selectedIndex}
                                  onChange={(e) => handleBatchChange(idKey, Number(e.target.value))}
                                >
                                  {item.batches.map((b, i) => (
                                    <option key={i} value={i}>
                                      {formatDate(b.expiry)}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                formatDate(item["Срок"])
                              )}
                            </td>
                            <td>{(qty * price).toFixed(2)}</td>
                            <td>
                              <button className="remove-btn" onClick={() => removeFromCart(idKey)}>
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
                      onClick={() => setShowClearCartModal(true)}
                      disabled={cartItems.length === 0}
                    >
                      <Trash2 size={18} style={{ marginRight: "6px" }} /> Удалить всё
                    </button>
                  </div>
                </div>
                <div className="detailed_inf">
                  <div className="detailed_rows">
                    <div className="detailed_row">
                      <p>{calculateTotalQuantity()} шт.</p>
                      <p>Общее количество</p>
                    </div>
                    <div className="detailed_row">
                      <p>{calculateTotal().toFixed(2)} сом</p>
                      <div className="detailed_btn">
                        <p>Итоговая сумма</p>
                        <button
                          disabled={cartItems.length === 0 || isSubmitting}
                          onClick={() => setShowConfirmModal(true)}
                        >
                          {isSubmitting ? "Загрузка..." : "Оформить"}
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
      {showFixModal && (
        <FixQuantityModal
          items={fixProducts}
          inputValues={inputValues}
          removeFromCart={removeFromCart}
          onFixQuantity={handleQuantityFix}
          onClose={() => setShowFixModal(false)}
        />
      )}

      {showErrorModal && (
        <OrderErrorModal
          message={apiErrorMessage}
          onClose={() => setShowErrorModal(false)}
        />
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
      {showClearCartModal && (
        <ConfirmClearCartModal
          onConfirm={() => {
            clearCart();
            setShowClearCartModal(false);
          }}
          onCancel={() => setShowClearCartModal(false)}
        />
      )}
    </div>
  );
}
export default OrderBasket;