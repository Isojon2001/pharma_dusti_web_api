import React from 'react';

function ModalSales({ isOpen, onClose, product }) {
  if (!isOpen) return null;

  return (
    <div className="sales-modal-overlay" onClick={onClose}>
      <div
        className="sales-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="sales-modal-title">Продажа</h1>

        {product && (
          <div className="sales-modal-body">

            <div className="sales-modal-field sales_names">
              <label htmlFor="sales_name">Название:</label>
              <input
                type="text"
                name="sales_name"
                id="sales_name"
              />
            </div>

            <div className="sales-modal-field">
              <label htmlFor="sales_quantity">Количество</label>
              <input
                type="number"
                name="sales_quantity"
                id="sales_quantity"
              />
            </div>

            <div className="sales-modal-field">
              <label htmlFor="sales_price">Цена</label>
              <input
                type="text"
                name="sales_price"
                id="sales_price"
              />
            </div>

          </div>
        )}

        <div className="sales-modal-actions">
          <button
            className="sales-modal-btn sales-modal-btn-cancel"
            onClick={onClose}
          >
          	Отменить
          </button>

          <button className="sales-modal-btn sales-modal-btn-confirm">
            Продать
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalSales;
