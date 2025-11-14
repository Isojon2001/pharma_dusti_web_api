import React from 'react';
import '../index.css';

function ConfirmClearCartModal({ onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Подтверждение Удаления</h2>
        <p>Вы уверены что хотите удалить всё?</p>
        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-btn">Да</button>
          <button onClick={onCancel} className="cancel-btn">Нет</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmClearCartModal;