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
import ConfirmClearCartModal from '../components/ConfirmClearCartModal';
import ConfirmOrderModal from '../components/ConfirmOrderModal';

function OrderBasket() {
  const { cartItems, increaseQuantity, decreaseQuantity, clearCart, removeFromCart, updateQuantity, updateBatchIndex } = useCart();
  const { token } = useAuth();
  const [inputValues, setInputValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [exceededProducts, setExceededProducts] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showClearCartModal, setShowClearCartModal] = useState(false);

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

  const formatDate = (dateStr) => (!dateStr || dateStr === '0001-01-01T00:00:00Z') ? '—' : new Date(dateStr).toLocaleDateString('ru-RU');

const handleQuantityChange = (id, value) => {
  const num = Number(value);
  setInputValues(prev => ({ ...prev, [id]: value }));
  if (!isNaN(num) && num >= 1) updateQuantity(id, num);
};

const handleBatchChange = (id, batchIndex) => updateBatchIndex(id, batchIndex);
  
  function handleRemoveFromCart(key) {
  removeFromCart(key);
}
  const calculateTotal = () => cartItems.reduce((sum, item) => {
    const selectedIndex = item.selectedBatchIndex ?? 0;
    const batch = item.batches?.[selectedIndex];
    const price = batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
    const qty = Number(inputValues[item.id || item['Код']] ?? item.quantity ?? 1);
    return sum + (isNaN(qty) ? 0 : price * qty);
  }, 0);

  const calculateTotalQuantity = () => cartItems.reduce((total, item) => {
    const qty = Number(inputValues[item.id || item['Код']] ?? item.quantity ?? 1);
    return total + (isNaN(qty) ? 0 : qty);
  }, 0);

  const groupCartItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      const batchIndex = item.selectedBatchIndex ?? 0;
      const batch = item.batches?.[batchIndex];
      const key = `${item['Код'] || item.id}_${batchIndex}`;
      const qty = Number(inputValues[item.id || item['Код']] ?? item.quantity ?? 1);
      if (!grouped[key]) {
        grouped[key] = {
          product_code: item['Код'] || item.id,
          name: item['Наименование'],
          price: batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0),
          expiry: batch?.expiry || item['Срок'] || null,
          quantity: qty,
        };
      } else {
        grouped[key].quantity += qty;
      }
    });
    return Object.values(grouped);
  };
  const checkStock = () => {
  const exceeded = [];

  cartItems.forEach(item => {
    const idKey = item.id || item['Код'] || item['Артикул'];
    const batch = item.batches?.[item.selectedBatchIndex ?? 0];
    const stock = Number(batch?.quantity ?? item["Количество"] ?? 0);
    const ordered = Number(inputValues[idKey] ?? item.quantity ?? 1);

    if (ordered > stock) {
      exceeded.push({
        ...item,
        idKey,
        ordered,
        stock
      });
    }
  });

  return exceeded;
};

  const handleQuantityFix = (productId, newQty) => {
    setInputValues(prev => ({ ...prev, [productId]: newQty }));
    updateQuantity(productId, newQty);
  };

const handleSubmitOrder = async () => {
  if (!token || cartItems.length === 0 || isSubmitting) return;
  const exceeded = checkStock();
if (exceeded.length > 0) {
  setExceededProducts(exceeded);
  setShowErrorModal(true);
  return;
}

  try {
    setIsSubmitting(true);
    await axios.post('https://api.dustipharma.tj:1212/api/v1/app/orders', { items: groupCartItems(cartItems) }, { headers: { Authorization: `Bearer ${token}` } });
    setShowSuccessModal(true);
    clearCart();
  } catch {
    setShowErrorModal(true);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const sortedItems = [...cartItems].sort((a, b) => {
    const getVal = (item) => {
      switch (sortConfig.key) {
        case '№': return item.id || item['Код'] || item['Артикул'];
        case 'Производитель': return item['Производитель'] || '';
        case 'Наименование': return item['Наименование'] || '';
        case 'Кол-во': return Number(inputValues[item.id || item['Код']] ?? item.quantity ?? 1);
        case 'Цена': {
          const batch = item.batches?.[item.selectedBatchIndex ?? 0];
          return batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
        }
        case 'Срок годности': {
          const dates = item.batches?.map(b => b.expiry && b.expiry !== '0001-01-01T00:00:00Z' ? new Date(b.expiry).getTime() : Infinity) || [];
          const minDate = Math.min(...dates, item['Срок'] ? new Date(item['Срок']).getTime() : Infinity);
          return isFinite(minDate) ? minDate : Infinity;
        }
        case 'Сумма': {
          const batch = item.batches?.[item.selectedBatchIndex ?? 0];
          const price = batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
          return price * Number(inputValues[item.id || item['Код']] ?? item.quantity ?? 1);
        }
        default: return '';
      }
    };
    const aVal = getVal(a), bVal = getVal(b);
    if (typeof aVal === 'number' && typeof bVal === 'number') return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
  });
  return (
    <div className="OrderBasket_content">
      <div className="basket_backs">
        <OrderHeader />
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/add-products-to-cart"><MoveLeft stroke="#232323" /> Назад</Link>
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
                    {sortedItems.length === 0 ? <tr><td colSpan="8" className="basket_empty">Корзина пуста</td></tr> :
                      sortedItems.map((item, idx) => {
                        const idKey = item.id || item['Код'] || item['Артикул'];
                        const selectedIndex = item.selectedBatchIndex ?? 0;
                        const batchesSorted = (item.batches || []).slice().sort((a,b)=>new Date(a.expiry||Infinity)-new Date(b.expiry||Infinity));
                        const batch = batchesSorted[selectedIndex];
                        const qty = Number(inputValues[idKey] ?? item.quantity ?? 1);
                        const price = batch ? parseFloat(batch.price) : parseFloat(item['Цена'] || 0);
                        return (
                          <tr key={`${idKey}_${idx}`} className={idx % 2 === 0 ? 'td_even':'td_odd'}>
                            <td className="numeration_basket">{idx+1}</td>
                            <td>{item['Производитель']||''}</td>
                            <td>{item['Наименование']}</td>
                            <td>
                              <div className="counter_table">
                                <button onClick={()=>decreaseQuantity(idKey)}>-</button>
                                <input type="number" value={inputValues[idKey]??item.quantity??1} min={1} onChange={(e)=>handleQuantityChange(idKey,e.target.value)}/>
                                <button onClick={()=>increaseQuantity(idKey)}>+</button>
                              </div>
                            </td>
                            <td>{price.toFixed(2)}</td>
                            <td>
                              {batchesSorted.length>0 ? <select value={selectedIndex} onChange={(e)=>handleBatchChange(idKey, Number(e.target.value))}>
                                {batchesSorted.map((b,i)=><option key={b.expiry||i} value={i}>{formatDate(b.expiry)}</option>)}
                              </select> : formatDate(item['Срок'])}
                            </td>
                            <td>{(price*qty).toFixed(2)}</td>
                            <td><button className="remove-btn" onClick={()=>removeFromCart(idKey)} title="Удалить из корзины"><Trash2 size={20}/></button></td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>
              <div className="detail_basket">
                <div>
                  <h2>Детали заказа</h2>
                  <div className="detailed_btn">
                    <button onClick={()=>setShowClearCartModal(true)} disabled={cartItems.length===0}><Trash2 size={18} style={{marginRight:'6px'}}/>Удалить всё</button>
                  </div>
                </div>
                <div className="detailed_inf">
                  <div className="detailed_rows">
                    <div className="detailed_row"><p>{calculateTotalQuantity()} шт.</p><p>Общее количество</p></div>
                    <div className="detailed_row">
                      <p>{calculateTotal().toFixed(2)} сом</p>
                      <div className="detailed_btn">
                        <p>Итоговая сумма</p>
                        <button disabled={cartItems.length===0||isSubmitting} onClick={()=>setShowConfirmModal(true)}>{isSubmitting?'Загрузка...':'Оформить'}</button>
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
  <OrderErrorModal
    removeFromCart={removeFromCart}
    items={exceededProducts}
    onFixQuantity={handleQuantityFix}
    inputValues={inputValues}
    onClose={() => setShowErrorModal(false)}
  />
)}
      {showSuccessModal && <OrderSuccessModal onClose={()=>setShowSuccessModal(false)}/>}
      {showConfirmModal && <ConfirmOrderModal onConfirm={()=>{setShowConfirmModal(false); handleSubmitOrder();}} onCancel={()=>setShowConfirmModal(false)}/>}
      {showClearCartModal && <ConfirmClearCartModal onConfirm={()=>{clearCart(); setShowClearCartModal(false);}} onCancel={()=>setShowClearCartModal(false)}/>}
    </div>
  )
}

export default OrderBasket;
