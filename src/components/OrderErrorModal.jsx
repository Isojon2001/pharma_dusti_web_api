import '../index.css';
import { Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

function OrderErrorModal({ items, inputValues = {}, onFixQuantity, onClose, removeFromCart }) {
  const [displayItems, setDisplayItems] = useState(items);

  useEffect(() => {
    setDisplayItems(items);
  }, [items]);

  const handleRemove = (key) => {
    console.log('Removing item with key:', key);
    if (removeFromCart) {
      removeFromCart(key);
      
      const updatedItems = displayItems.filter(item => {
        const itemKey = item.id || item.Код || item.Артикул;
        return itemKey !== key;
      });
      setDisplayItems(updatedItems);
      
      if (updatedItems.length === 0) {
        onClose();
      }
    }
  };

  return (
    <div className="modal-overlay modals__close">
      <div className="modals large">
        <h2>Ошибка оформления заказа</h2>
        <h3>Вы заказали товаров больше, чем есть на складе</h3>

        <div className="table_scrollable error_modal_scroll">
          <table className="table_info larges">
            <thead>
              <tr className="table_infos">
                {['№','Производитель','Наименование','Кол-во','Заказано','Действие'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="basket_empty">
                    Нет товаров для исправления
                  </td>
                </tr>
              ) : (
                displayItems.map((item, idx) => {
                  const key = item.id || item.Код || item.Артикул;
                  const value = Number(inputValues[key] ?? item.ordered ?? 1);

                  return (
                    <tr key={key} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                      <td className="numeration_basket">{idx + 1}</td>
                      <td>{item['Производитель'] || ''}</td>
                      <td>{item['Наименование'] || ''}</td>
                      <td>
                        <div className="counter_table">
                          <button onClick={() => onFixQuantity(key, Math.max(1, value - 1))}>-</button>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => onFixQuantity(key, Math.max(1, Number(e.target.value)))}
                            className="counters_input"
                          />
                          <button onClick={() => onFixQuantity(key, value + 1)}>+</button>
                        </div>
                      </td>
                      <td>{value}</td>
                      <td>
                        <button
                          className="remove-btn"
                          onClick={() => handleRemove(key)}
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

        <div className="modals__closed">
          <X strokeWidth={3} onClick={onClose} />
        </div>

        <div className="modalss">
          <button onClick={onClose} className="close-btn">Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;