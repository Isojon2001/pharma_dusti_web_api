import React from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';

function PaymantsClient() {
  return (
    <div className='profileOrder_content'>
      <div className='AddProductsToСarts'>
        <OrderHeader />
      </div>

      <div className='profileOrder_header'>
        <div className='basket_back back_top'>
          <div className='examination_backspace'>
            <Link to='/add-products-to-cart'>
              <MoveLeft stroke='#232323' /> Назад
            </Link>
          </div>
          <h1>Реквизиты клиента</h1>
        </div>

        <div className='client_cards'>
          <div className='client_card'>
            <div>
              
            <h2>Кошелек Duston Pay</h2>
            <div>
              <p>Номер кошелька <span>98 765 43 21</span></p>
            </div>
           </div>
          </div>

          <div className='client_card'>
            <h2>Банковская карта</h2>
            <div>
              <div>
                <p>Тип карты<span>Корти Милли</span></p>
                <p>Номер карты<span>4111 **** **** 1234</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymantsClient;
