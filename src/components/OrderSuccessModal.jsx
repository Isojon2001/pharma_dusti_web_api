import React from 'react';

function OrderSuccessModal({ onClose }) {
  return (
    <div class="order-success__overlay">
      <div class="order-success__content">
        <div class="order-success__icon">
          <svg width="61" height="60" viewBox="0 0 61 60" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M30.5 5C44.3 5 55.5 16.2 55.5 30C55.5 43.8 44.3 55 30.5 55C16.7 55 5.5 43.8 5.5 30C5.5 16.2 16.7 5 30.5 5ZM27 38L43 22L40.5 19.5L27 33L21 27L18.5 29.5L27 38Z" fill="#4BB543"></path></svg>
        </div>
        <h2 class="order-success__title">Заказ оформлен</h2>
        <p class="order-success__message">Спасибо за ваш заказ!</p>
        <p class="order-success__message">Наши менеджеры скоро с вами свяжуться</p>
        <button class="order-success__button" onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}

export default OrderSuccessModal;
