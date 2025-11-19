import '../index.css';
import React from 'react';
import { Trash2, X } from 'lucide-react';


function OrderErrorModal({ items, inputValues = {}, onFixQuantity, onClose, removeFromCart }) {
  const handleRemove = (key) => {
    removeFromCart(key);
  };

  const handleConfirm = () => {
    items.forEach(item => {
      const key = item.id || item.Код || item.Артикул;
      const stock = Number(
        item.Остаток ??
        item.stock ??
        item.available ??
        0
      );
      const newQty = Math.max(stock - 20, 0);
      onFixQuantity(key, newQty);
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
                <th>№</th>
                <th>Производитель</th>
                <th>Наименование</th>
                <th>Кол-во</th>
                <th>Заказано</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="basket_empty">
                    Нет товаров для исправления
                  </td>
                </tr>
              ) : (
                  items.map((item, idx) => {
                    const key = item.id || item.Код || item.Артикул;
                    const stock = Math.max(Number(item.stock ?? item.Остаток ?? 0) - 20, 0);
                    const ordered = Number(inputValues[key] ?? item.ordered ?? 1);
                    return (
                      <tr key={key} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                        <td className="numeration_basket">{idx + 1}</td>
                        <td>{item.Производитель || ''}</td>
                        <td>{item.Наименование || ''}</td>
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
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
        <div className="modalss">
          <button onClick={handleConfirm} className="close-btn">
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
}
export default OrderErrorModal;