import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !order_id) return;

    fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.code === 200 && data.payload) {
          setOrder(data.payload);
        } else {
          console.warn('Пустой ответ от сервера или ошибка:', data);
          setOrder(null);
        }
      })
      .catch(err => {
        console.error('Ошибка загрузки данных:', err);
      });
  }, [order_id, token]);

  useEffect(() => {
    if (!token || !order_id) return;

    fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/customer`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data?.code === 200 && Array.isArray(data.payload)) {
          const foundOrder = data.payload.find(o => o.id.toString() === order_id.toString());
          if (foundOrder) {
            setOrderCode(foundOrder.code);
          } else {
            console.warn('Заказ с таким ID не найден в списке');
          }
        } else {
          console.warn('Ошибка получения списка заказов:', data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки списка заказов:', err);
        setLoading(false);
      });
  }, [order_id, token]);

  const getTotalPrice = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <div className='DetailedHistory'>
      <OrderHeader />
      <div className='DetailedHistory_content bg_history'>
        <div className='basket_back'>
          <div className="examination_backspace">
            <Link to="/history-order">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Статус заявки</h1>
        </div>

        {loading ? (
          <p>Загрузка...</p>
        ) : order ? (
          <div className='detailed_info'>
            <div className="users_detailed">
              <div className="user_order">
                <div>
                  <h2>#{orderCode || '—'}</h2>
                  <ul>
                    <li>{order.status}</li>
                  </ul>
                </div>
              </div>

              <div>
                <h2>Детали заказа</h2>
                {order.items?.map((item, index) => (
                  <div key={index}>
                    <p>Название: <span>{item.name}</span></p>
                    <p>Количество: <span>{item.quantity}</span></p>
                    <p>Сумма: <span>{(item.price * item.quantity).toFixed(2)}</span></p>
                    <div className='detailed_line'></div>
                  </div>
                ))}
              </div>
            </div>

            <div className='detail_basket'>
              <h2>Детали заказа</h2>
              <div>
                <p>Итоговая сумма</p>
                <p>{getTotalPrice(order.items).toFixed(2)} сом</p>
              </div>
              <div>
                <p>Срок доставки</p>
                <p>1–3 дня</p>
              </div>
              <button>Оформить</button>
            </div>
          </div>
        ) : (
          <p>Данные заказа не найдены</p>
        )}
      </div>
    </div>
  );
}

export default DetailedHistory;
