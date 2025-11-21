import '../index.css';
import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

function FixQuantityModal({ items, inputValues = {}, onFixQuantity, onClose, removeFromCart }) {
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const initial = {};

    items.forEach(item => {
      const stock = Number(item.stock ?? item["Количество"] ?? 0);
      const ordered = Number(item.ordered ?? inputValues[item.idKey] ?? 1);
      const newQty = Math.max(1, Math.min(ordered, stock));
      initial[item.idKey] = newQty;
    });

    setQuantities(initial);
  }, [items, inputValues]);

  const handleChange = (id, value, stock) => {
    let qty = Number(value);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (stock !== undefined && qty > stock) qty = stock;
    setQuantities(prev => ({ ...prev, [id]: qty }));
  };

  const handleRemove = (id) => {
    setQuantities(prev => ({ ...prev, [id]: 0 }));
    if (removeFromCart) removeFromCart(id);
  };

  const handleApply = () => {
    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty < 1) {
        if (removeFromCart) removeFromCart(id);
      } else {
        onFixQuantity(id, qty);
      }
    });

    onClose();
  };

  return (
    <div className="modal-overlay modals__close">
      <div className="modals large">
        <div className="modals__closed">
          <X strokeWidth={3} onClick={onClose} />
        </div>

        <h2>Ошибка при оформлении заказа</h2>
        <h3>Некоторые товары вы заказали больше, чем есть на складе</h3>

        <div className="table_scrollable error_modal_scroll">
          <table className="table_info larges">
            <thead>
              <tr className="table_infos">
                <th>№</th>
                <th>Производитель</th>
                <th>Наименование</th>
                <th>Кол-во</th>
                <th>Заказано</th>
                <th className='remove-btns'>Действие</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="basket_empty">Нет товаров для исправления</td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const stock = Number(item.stock ?? item["Количество"] ?? 0);
                  const qty = quantities[item.idKey] ?? stock;

                  return (
                    <tr key={item.idKey} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                      <td className="numeration_basket">{idx + 1}</td>
                      <td>{item.manufacturer || ''}</td>
                      <td>{item.name}</td>
                      <td>
                        {isNaN(qty) || qty < 1 ? (
                          <span>Нет в наличии</span>
                        ) : (
                          <input
                            type="number"
                            value={qty}
                            min={1}
                            max={stock}
                            disabled
                            onChange={(e) => handleChange(item.idKey, e.target.value, stock)}
                            style={{ textAlign: 'center' }}
                          />
                        )}
                      </td>
                      <td>{inputValues[item.idKey] ?? item.ordered ?? 0}</td>
                      <td className='remove-btns'>
                        <button className="remove-btn" onClick={() => handleRemove(item.idKey)}>
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

        <div className="modalss">
          <button onClick={handleApply} className="close-btn">Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

export default FixQuantityModal;
