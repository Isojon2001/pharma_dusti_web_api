import '../index.css';
import React from 'react';
import { X } from 'lucide-react';

function OrderErrorModal({ message, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modals__close">
          <X strokeWidth={3} onClick={onClose} />
        </div>

        <h2>Ошибка оформления заказа</h2>
        <h3>{message}</h3>
        <div className="modalss">
          <button onClick={onClose} className="close-btn">Ок</button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;
