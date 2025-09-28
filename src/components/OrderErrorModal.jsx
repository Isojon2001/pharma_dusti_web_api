import React from 'react';

function OrderErrorModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h1>❌</h1>
        <h2>Ошибка оформления заказа</h2>
        <p>{message}</p>
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default OrderErrorModal;