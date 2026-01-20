import React from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';

function PaymantsStatus() {
  return (
    <div className='profileOrder_content'>
      <div className='AddProductsToСarts'>
        <OrderHeader />
      </div>

      <div className='profileOrder_header paymantsHistory_header'>
        <div className='basket_back back_top'>
          <div className='examination_backspace'>
            <Link to='/add-products-to-cart'>
              <MoveLeft stroke='#232323' /> Назад
            </Link>
          </div>
          <h1>Статус заказа</h1>
        </div>
        <div className='status_card'>
          <div className='client_card detail_orders'>
            <div>
              <div className='clients_key'>
            <h2>#4b0655</h2>
                <ul>
                  <li>Уже у вас</li>
                </ul>
              </div>
            <h2>Детали заказа</h2>
            <div className='pay_info_card'>
              <div>
                <div>
                <p>Название:<span>B-норм капс №20</span></p>
                <p>Колчество:<span>2</span></p>
                <p>Сумма:<span>72:00</span></p>
                </div>
                <div className='line_orders'></div>
                                <div>
                <p>Название:<span>B-норм капс №20</span></p>
                <p>Колчество:<span>2</span></p>
                <p>Сумма:<span>72:00</span></p>
                </div>
                <div className='line_orders'></div>
                                <div>
                <p>Название:<span>B-норм капс №20</span></p>
                <p>Колчество:<span>2</span></p>
                <p>Сумма:<span>72:00</span></p>
                </div>
                <div className='line_orders'></div>
              </div>

            </div>
           </div>
          </div>
                <div>
                  <div className='bg_status_paymant'>
                    <h1>Итог заявки</h1>
                    <div>
                      <p>Адрес доставки<span>Ул Пушкина, 24/12 кв 42</span></p>
                      <p>Итоговая сума<span>330.00 сом</span></p>
                      <p>Скидка<span>0 сом</span></p>
                    </div>
                    <button>Завершить сборку</button>
                  </div>
                </div>
        </div>
      </div>
    </div>
  );
}

export default PaymantsStatus;