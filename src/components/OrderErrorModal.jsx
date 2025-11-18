import '../index.css';
import { Trash2 } from 'lucide-react';

function OrderErrorModal({ items, inputValues = {}, onFixQuantity, onClose, removeFromCart }) {
  return (
    <div className="modal-overlay">
      <div className="modals large">
        <h2>Ошибка оформления заказа</h2>
        <h3>Вы заказали товаров больше, чем есть на складе</h3>

        <div className="table_scrollable">
          <table className="table_info">
            <thead>
              <tr className="table_infos">
                <th>№</th>
                <th>Производитель</th>
                <th>Наименование</th>
                <th>Кол-во</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="basket_empty">
                    Нет товаров для исправления
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const key = item.id || item.Код || item.Артикул;
                  const value = inputValues[key] !== undefined ? inputValues[key] : item.ordered;

                  return (
                    <tr key={key} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                      <td className="numeration_basket">{idx + 1}</td>
                      <td>{item['Производитель'] || ''}</td>
                      <td>{item.name}</td>
                      <td>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => onFixQuantity(key, Number(e.target.value))}
                          className="counters_input"
                        />
                      </td>
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

        <div className="modalss">
          <button onClick={onClose} className="close-btn">
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;
