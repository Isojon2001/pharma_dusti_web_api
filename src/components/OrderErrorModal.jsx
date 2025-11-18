import '../index.css';

function OrderErrorModal({ items, inputValues = {}, onFixQuantity, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal large">
        <h2>Ошибка оформления заказа</h2>
        <h3>Вы заказали товаров больше, чем есть на складе</h3>
        <div className="table_scrollable">
          <table className="table_info">
            <thead>
              <tr className="table_infos">
                <th>№</th>
                <th>Наименование</th>
                <th>Заказано</th>
                <th>Изменить до</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="basket_empty">Нет товаров для исправления</td>
                </tr>
              ) : (
                items.map((item, idx) => {
                  const key = item.id || item.Код || item.Артикул;
                  const value = inputValues[key] !== undefined ? inputValues[key] : item.ordered;

                  return (
                    <tr key={key} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                      <td className="numeration_basket">{idx + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.ordered}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={item.stock}
                          value={value}
                          onChange={(e) => onFixQuantity(key, Number(e.target.value))}
                          className="counter_input"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="close-btn">Закрыть</button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;
