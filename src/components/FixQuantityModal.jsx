import '../index.css';
import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

function FixQuantityModal({ items, inputValues = {}, onFixQuantity, onClose, removeFromCart }) {
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const initial = {};
    items.forEach(item => {
      initial[item.idKey] = inputValues[item.idKey] ?? item.ordered ?? 1;
    });
    setQuantities(initial);
  }, [items, inputValues]);

  const handleChange = (id, value, stock) => {
    let qty = Number(value);
    if (isNaN(qty) || qty < 0) qty = 0;
    if (stock !== undefined && qty > stock) qty = stock;
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleRemove = (id) => {
    setQuantities(prev => ({ ...prev, [id]: 0 }));
    if (removeFromCart) removeFromCart(id);
  };

  const handleApply = () => {
    Object.entries(quantities).forEach(([id, qty]) => {
      onFixQuantity(id, qty);
      if (qty === 0 && removeFromCart) removeFromCart(id);
    });
    onClose();
  };

  return (
    <div className="modal-overlay modals__close">
      <div className="modals large">
        <div className="modals__closed">
          <X strokeWidth={3} onClick={onClose} />
        </div>

        <h2>Исправление количества</h2>
        <h3>Некоторые товары доступны в меньшем количестве</h3>

        <div className="table_scrollable error_modal_scroll">
          <table className="table_info larges">
            <thead>
              <tr className="table_infos">
                <th>№</th>
                <th>Наименование</th>
                <th>На складе</th>
                <th>Заказано</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="basket_empty">Нет товаров для исправления</td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.idKey} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                    <td className="numeration_basket">{idx + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.stock}</td>
                    <td>
                      <input
                        type="number"
                        value={quantities[item.idKey]}
                        min={0}
                        max={item.stock}
                        onChange={(e) => handleChange(item.idKey, e.target.value, item.stock)}
                        style={{ width: '60px' }}
                      />
                    </td>
                    <td>
                      <button className="remove-btn" onClick={() => handleRemove(item.idKey)}>
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="modalss">
          <button onClick={handleApply} className="close-btn">Исправить</button>
        </div>
      </div>
    </div>
  );
}
export default FixQuantityModal;