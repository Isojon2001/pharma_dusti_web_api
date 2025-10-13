import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck, Route } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import CircularOrderStatus from '../components/CircularOrderStatus';

const normalizeDate = (dateStr) => {
  if (!dateStr || dateStr === '01.01.0001 0:00:00' || dateStr.trim() === '') {
    return '—';
  }
  return dateStr;
};

function DetailRealisations() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token || !order_id) {
      setLoading(false);
      setErrorMsg('Неверные данные запроса');
      return;
    }

    const fetchDetails = async () => {
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok || data.code !== 200 || !data.payload) {
          throw new Error('Заказ не найден');
        }

        const rawStatus = data.payload.status || {};

        const timestamps = {
          created_at: normalizeDate(rawStatus.ДатаОформлено),
          processed_at: normalizeDate(rawStatus.ДатаКОбработке),
          assembled_at: normalizeDate(rawStatus.ДатаКСборке),
          ready_at: normalizeDate(rawStatus.ДатаГотовКДоставке),
          in_transit_at: normalizeDate(rawStatus.ДатаВПути),
          delivered_at: normalizeDate(rawStatus.ДатаДоставлен),
        };

        setOrderDetails({
          id: data.payload.order_id,
          status: rawStatus,
          timestamps,
        });
      } catch (err) {
        console.error('Ошибка при загрузке:', err);
        setErrorMsg(err.message || 'Ошибка загрузки');
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [order_id, token]);

  const handleStatusConfirm = (confirmedDate) => {
    setOrderDetails((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: { ...prev.status, Доставлен: 'Да' },
        timestamps: {
          ...prev.timestamps,
          delivered_at: normalizeDate(confirmedDate || new Date().toLocaleString()),
        },
      };
    });
  };

  const stages = [
    { label: 'Оформлен', icon: <CircleCheck size={24} />, date: orderDetails?.timestamps.created_at },
    { label: 'Обработан', icon: <Clock3 size={24} />, date: orderDetails?.timestamps.processed_at },
    { label: 'Сборка', icon: <Package size={24} />, date: orderDetails?.timestamps.assembled_at },
    { label: 'Готов к доставке', icon: <Truck size={24} />, date: orderDetails?.timestamps.ready_at },
    { label: 'В пути', icon: <Route size={24} />, date: orderDetails?.timestamps.in_transit_at },
    { label: 'Доставлен', icon: <CircleCheck size={24} />, date: orderDetails?.timestamps.delivered_at },
  ];

  return (
    <div className="DetailedHistory">
      <OrderHeader />
      <div className="DetailedHistory_content bg_detailed">
        <div className="basket_back">
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
            <p style={{ color: 'red' }}>{errorMsg}</p>
          ) : orderDetails ? (
            <>
              <CircularOrderStatus
                apiStatus={orderDetails.status}
                timestamps={orderDetails.timestamps}
                orderId={orderDetails.id}
                token={token}
                onConfirm={handleStatusConfirm}
              />

              <div className="date_realisations">
                <h2>Дата и время реализации</h2>
              </div>

              <div className="order_stages_icons">
                {stages.map(({ label, icon, date }) => (
                  <div className="stage_block" key={label}>
                    <div className="stage_icon">{icon}</div>
                    <div className="stage_label">{label}</div>
                    <div className="stage_time">{date}</div>
                  </div>
                ))}
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
