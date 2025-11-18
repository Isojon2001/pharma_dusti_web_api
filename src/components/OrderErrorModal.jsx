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
                {['№','Производитель','Наименование','Кол-во','Заказано','Действие'].map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="basket_empty">Нет товаров для исправления</td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const key = item.id || item.Код || item.Артикул;
                  const value = Number(inputValues[key] ?? item.ordered ?? 1);
                  const stock = Number(item.batches?.[item.selectedBatchIndex ?? 0]?.quantity ?? item["Количество"] ?? 0);

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
                            min={1}
                          />
                          <button onClick={() => onFixQuantity(key, value + 1)}>+</button>
                        </div>
                      </td>
                      <td>{`${value}`}</td>
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
          <button onClick={onClose} className="close-btn">Подтвердить</button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;
