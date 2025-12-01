import '../index.css';
import React from 'react';

function FixQuantityModal({ items = [], changes = [], onClose, message }) {
    const changesMap = {};
    changes.forEach(change => {
        changesMap[change.Код] = change.Количество;
    });

    return (
        <div className="modal-overlay modals__close">
      <div className="modals large">
        <h2 style={{ marginBottom: "10px" }}>
          Часть товаров была обработана
        </h2>
        <h3 style={{ fontWeight: 400, marginBottom: "25px" }}>
          Рекомендуем ознакомиться с обновлённым списком перед подтверждением.
        </h3>
        <div className="table_scrollable error_modal_scroll">
          <table className="table_info larges">
            <thead>
              <tr className="table_infos">
                <th>№</th>
                <th>Производитель</th>
                <th>Наименование</th>
                <th>Количество</th>
                <th>Срок годности</th>
                <th>Цена</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="6" className="basket_empty">
                    Нет данных для отображения
                  </td>
                </tr> 
              ) : (
                items.map((item, idx) => {
                    const changedQuantity = changesMap[item.product_code];
                    return (
                      <tr key={idx} className={idx % 2 === 0 ? 'td_even' : 'td_odd'}>
                        <td className="numeration_basket">{idx + 1}</td>
                        <td>{item.manufacturer || ""}</td>
                        <td>{item.name}</td>
                        <td>
                          {changedQuantity !== undefined
                            ? (Number(changedQuantity) === 0 ? "Нет в наличии" : changedQuantity)
                            : (Number(item.quantity) === 0 ? "Нет в наличии" : item.quantity)}
                        </td>
                        <td>
                          {item.expiration_date
                            ? new Date(item.expiration_date).toLocaleDateString('ru-RU')
                            : "—"}
                        </td>
                        <td>{Number(item.price || 0).toFixed(2)}</td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
        <div className="modalss">
          <button
            style={{ marginTop: "25px" }}
            onClick={onClose}
            className="close-btn"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
    );
}
export default FixQuantityModal;