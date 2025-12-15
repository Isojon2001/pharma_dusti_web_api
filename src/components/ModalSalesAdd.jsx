import React, { useState } from 'react';
import ModalExistingProduct from './ModalExistingProduct';

function ModalSalesAdd({ isOpen, onClose }) {
  const [isExistingModalOpen, setIsExistingModalOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="sales-modal-overlay" onClick={onClose}>
        <div className="sales-modal-container" onClick={(e) => e.stopPropagation()}>
          <h1 className="sales-modal-title">Добавить товар</h1>

          <div className="sales-modal-btn">
            <button>Новый товар</button>
            <button onClick={() => setIsExistingModalOpen(true)}>Существующий товар</button>
          </div>

          <div className="sales-modal-body">
            <div className="sales-modal-field">
              <label htmlFor="sales_name">Наименование</label>
              <input type="text" id="sales_name" />
            </div>
            <div className="sales-modal-field">
              <label htmlFor="sales_manufacturer">Производитель</label>
              <input type="text" id="sales_manufacturer" />
            </div>
            <div className="sales-modal-field">
              <label htmlFor="sales_expiry">Срок годности</label>
              <input type="text" id="sales_expiry" />
            </div>
            <div className="sales-modal-field">
              <label htmlFor="sales_purchase_price">Цена закупки</label>
              <input type="text" id="sales_purchase_price" />
            </div>
            <div className="sales-modal-field">
              <label htmlFor="sales_price">Цена</label>
              <input type="text" id="sales_price" />
            </div>
            <div className="sales-modal-field">
              <label htmlFor="sales_discount">Скидочная цена</label>
              <input type="text" id="sales_discount" />
            </div>
            <div className="sales-modal-field">
              <label htmlFor="sales_quantity">Кол-во</label>
              <input type="text" id="sales_quantity" />
            </div>
          </div>

          <div className="sales-modal-actions sales-add-modal-actions">
            <button className="sales-modal-btn sales-modal-btn-cancel" onClick={onClose}>Отменить</button>
            <button className="sales-modal-btn sales-modal-btn-confirm">Добавить</button>
          </div>
        </div>
      </div>

      <ModalExistingProduct
        isOpen={isExistingModalOpen}
        onClose={() => setIsExistingModalOpen(false)}
        openNewModal={() => setIsExistingModalOpen(false)}
        selectedProduct={{
          name: 'Артхрал тб №30',
          manufacturer: '1',
          expiryDate: '01.12.2026',
          purchasePrice: '33.00',
          price: '33.00',
          discountPrice: '44.00',
        }}
      />
    </>
  );
}

export default ModalSalesAdd;
