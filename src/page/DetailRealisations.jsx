import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck, Route } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import CircularOrderStatus from '../components/CircularOrderStatus';

function DetailRealisations() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token || !order_id) {
      console.warn('Нет токена или order_id:', token, order_id);
      setLoading(false);
      setErrorMsg('Неверные данные запроса');
      return;
    }

    const fetchOrderDetails = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const customerRes = await fetch(
          'http://api.dustipharma.tj:1212/api/v1/app/orders/customer',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!customerRes.ok) {
          throw new Error(`Ошибка сервера при customer: ${customerRes.status}`);
        }
        const customerData = await customerRes.json();
        console.log('customerData:', customerData);

        const orderList = customerData.payload;
        if (!Array.isArray(orderList)) {
          throw new Error('customerData.payload не массив');
        }

        const foundOrder = orderList.find(o => String(o.id) === String(order_id));
        if (!foundOrder) {
          throw new Error('Заказ не найден в списке');
        }
        console.log('foundOrder:', foundOrder);

        const statusRes = await fetch(
          `http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!statusRes.ok) {
          throw new Error(`Ошибка сервера при status: ${statusRes.status}`);
        }
        const statusData = await statusRes.json();
        console.log('statusData:', statusData);

        if (statusData.code === 200 && statusData.payload && statusData.payload.status) {
          const rawStatus = statusData.payload.status;

          const normalizeDate = (dateStr) => {
            if (!dateStr || dateStr === '01.01.0001 0:00:00' || dateStr.trim() === '') {
              return '—';
            }
            return dateStr;
          };

          const normalizedStatus = {
            created_at: normalizeDate(rawStatus.ДатаОформлено),
            processed_at: normalizeDate(rawStatus.ДатаКОбработке),
            assembled_at: normalizeDate(rawStatus.ДатаКСборке),
            ready_at: normalizeDate(rawStatus.ДатаГотовКДоставке),
            in_transit_at: '—',
            delivered_at: normalizeDate(rawStatus.ДатаДоставлен),
          };

          setOrderDetails({
            ...statusData.payload,
            code: foundOrder.code,
            status: normalizedStatus,
          });
        } else {
          throw new Error('statusData.payload отсутствует или код ≠ 200');
        }
      } catch (err) {
        console.error('Ошибка при загрузке деталей заказа:', err);
        setErrorMsg(err.message || 'Ошибка загрузки');
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order_id, token]);

  return (
    <div className="DetailedHistory">
      <OrderHeader />
      <div className="DetailedHistory_content bg_detailed">
        <div className="basket_back ">
          <div className="examination_backspace">
            <Link to="/history-order">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Детали реализации</h1>
        </div>

        <div className="order_basket_step detail_realisations">
          {loading ? (
            <p>Загрузка...</p>
          ) : errorMsg ? (
            <p>{errorMsg}</p>
          ) : orderDetails ? (
            <>
              <CircularOrderStatus apiStatus={orderDetails.status} />
              <div className='date_realisations'>
                <h2>Дата и время реализации</h2>
              </div>
              <div className="order_stages_icons">
                <div className="stage_block">
                  <div className="stage_icon"><CircleCheck size={24} /></div>
                  <div className="stage_label">Оформлен</div>
                  <div className="stage_time">{orderDetails.status.created_at}</div>
                </div>
                <div className="stage_block">
                  <div className="stage_icon"><Clock3 size={24} /></div>
                  <div className="stage_label">Обработан</div>
                  <div className="stage_time">{orderDetails.status.processed_at}</div>
                </div>
                <div className="stage_block">
                  <div className="stage_icon"><Package size={24} /></div>
                  <div className="stage_label">Сборка</div>
                  <div className="stage_time">{orderDetails.status.assembled_at}</div>
                </div>
                <div className="stage_block">
                  <div className="stage_icon"><Truck size={24} /></div>
                  <div className="stage_label">Готов к доставке</div>
                  <div className="stage_time">{orderDetails.status.ready_at}</div>
                </div>
                <div className="stage_block">
                  <div className="stage_icon"><Route size={24} /></div>
                  <div className="stage_label">В пути</div>
                  <div className="stage_time">{orderDetails.status.in_transit_at}</div>
                </div>
                <div className="stage_block">
                  <div className="stage_icon"><CircleCheck size={24} /></div>
                  <div className="stage_label">Доставлен</div>
                  <div className="stage_time">{orderDetails.status.delivered_at}</div>
                </div>
              </div>
            </>
          ) : (
            <p>Данные заказа не найдены.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailRealisations;
