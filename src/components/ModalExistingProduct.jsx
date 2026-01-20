import React, { useState } from 'react';

function ModalExistingProduct({ isOpen, onClose, selectedProduct, openNewModal }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [quantity, setQuantity] = useState(120);

  if (!isOpen) return null;

  return (
    <div className="sales-modal-overlay" onClick={onClose}>
      <div className="sales-modal-container" onClick={(e) => e.stopPropagation()}>
        <h1 className="sales-modal-title">Добавить товар</h1>

        <div className="sales-modal-btn sales-modal-btn-existing">
          <button onClick={openNewModal}>Новый товар</button>
          <button className="active">Существующий товар</button>
        </div>

        <div
          className="existing-product-header"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setIsExpanded(!isExpanded); }}
        >
          <label htmlFor=" selectedProduct">Товар</label>
          {selectedProduct.name} <span>{isExpanded ? '▲' : '▼'}</span>
        </div>

        {isExpanded && (
          <div className="existing-product-details">
            <p><b>Название:</b> <span>{selectedProduct.name}</span></p>
            <p><b>Производитель:</b> <span>{selectedProduct.manufacturer}</span></p>
            <p><b>Срок годности:</b> <span>{selectedProduct.expiryDate}</span></p>
            <p><b>Цена закупки:</b> <span>{selectedProduct.purchasePrice}</span></p>
            <p><b>Цена:</b> <span>{selectedProduct.price}</span></p>
            <p><b>Скидочная цена:</b> <span>{selectedProduct.discountPrice}</span></p>
          </div>
        )}

        <div className="sales-modal-field">
          <label htmlFor="existing_quantity">Кол-во</label>
          <input
            type="number"
            id="existing_quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="sales-modal-actions sales-existing-modal-actions">
          <button className="sales-modal-btn sales-modal-btn-cancel" onClick={onClose}>
            Отменить
          </button>
          <button className="sales-modal-btn sales-modal-btn-confirm">Продать</button>
        </div>
      </div>
    </div>
  );
}

export default ModalExistingProduct;
