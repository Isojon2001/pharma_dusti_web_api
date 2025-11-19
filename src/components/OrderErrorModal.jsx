import '../index.css';
import React from 'react';
import { Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

function OrderErrorModal({ items, inputValues = {}, onFixQuantity, onClose, removeFromCart }) {
  const [displayItems, setDisplayItems] = useState(items);

  useEffect(() => {
    setDisplayItems(items);
  }, [items]);

  const handleRemove = (key) => {
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
  const handleConfirm = () => {
  displayItems.forEach(item => {
    const key = item.id || item.Код || item.Артикул;
    const stock = Number(item.Остаток ?? item.stock ?? item.available ?? 0);
    const fixedQuantity = stock - 5;

    console.log("FIX KEY:", key, "→", fixedQuantity);

    onFixQuantity(key, fixedQuantity);
  });

  onClose();
};


  return (
    <div className="modal-overlay modals__close">
      <div className="modals large">
        <div className="modals__closed">
          <X strokeWidth={3} onClick={onClose} />
        </div>
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
      const stock = Number(item.Остаток ?? item.stock ?? item.available ?? 0);
      const ordered = Number(inputValues[key] ?? item.ordered ?? 1);

      return (
        <React.Fragment key={key}>
          <tr className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
            <td className="numeration_basket">{idx + 1}</td>
            <td>{item['Производитель'] || ''}</td>
            <td>{item['Наименование'] || ''}</td>
            <td>{stock}</td>
            <td>{ordered}</td>
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
          {stock === 0 && (
            <tr className="no-stock-row">
              <td colSpan="6" style={{ color: 'red', fontStyle: 'italic', paddingLeft: '20px' }}>
                Нет в наличии
              </td>
            </tr>
          )}
        </React.Fragment>
      );
    })
  )}
</tbody>

          </table>
        </div>


        <div className="modalss">
          <button onClick={handleConfirm} className="close-btn">Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;
