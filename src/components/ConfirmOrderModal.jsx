
import React from 'react';
import '../index.css';

function ConfirmOrderModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Подтверждение заказа</h2>
        <p>Вы уверены, что хотите оформить заказ?</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-btn">Да, оформить</button>
          <button onClick={onCancel} className="cancel-btn">Отмена</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmOrderModal;
