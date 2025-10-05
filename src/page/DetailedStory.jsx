import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';

const STATUS_ORDER = [
  'Оформлено',
  'В обработке',
  'В процессе сборки',
  'В процессе Доставки',
  'Доставлен',
];

const API_STATUS_TO_STEP_STATUS = {
  'Оформлено': 'Оформлено',
  'В обработке': 'В обработке',
  'К отгрузке': 'В процессе сборки',
  'Отгружён': 'В процессе Доставки',
  'Доставлен': 'Доставлен',
};

const STATUS_COLOR_MAP = {
  'Оформлено': 'color-green',
  'В обработке': 'color-yellow',
  'В процессе сборки': 'color-orange',
  'В процессе Доставки': 'color-blue',
  'Доставлен': 'color-bright-green',
};

function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrderStatus = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.status}`);
        }

        const data = await res.json();

        if (data?.code === 200 && data.payload) {
          setOrderDetails(data.payload);
        } else {
          setOrderDetails(null);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderStatus();
  }, [order_id, token]);

  const currentStatus = orderDetails
    ? API_STATUS_TO_STEP_STATUS[orderDetails.status] || null
    : null;

  const downloadReportFromServer = async (orderCode, format = 'pdf') => {
    try {
      const response = await fetch(
        `http://api.dustipharma.tj:1212/api/v1/app/orders/reports/${orderCode}?format=${format}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Ошибка при получении отчёта с сервера');
      }

      const blob = await response.blob();
      const extension = format === 'xlsx' ? 'xlsx' : 'pdf';
      saveAs(blob, `Заказ_${orderCode}.${extension}`);
    } catch (error) {
      console.error('Ошибка при загрузке отчёта:', error);
    }
  };

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
          <h1>Статус заявки</h1>
          {/* Текущий статус на русском */}
          <h2>Текущий статус: {orderDetails?.status || 'нет данных'}</h2>
        </div>

        <div className="order_basket_step">
          {loading ? (
            <p>Загрузка...</p>
          ) : orderDetails ? (
            <div className="detailed_info">
              <div className="users_detailed order_bg detailed_bg">
                <div className="active_order"></div>
                <div className="order_info">
                  {STATUS_ORDER.map((status, index) => (
                    <OrderStep
                      key={status}
                      icon={
                        index === 0 || index === STATUS_ORDER.length - 1 ? (
                          <CircleCheck />
                        ) : index === 1 ? (
                          <Clock3 />
                        ) : index === 2 ? (
                          <Package />
                        ) : (
                          <Truck />
                        )
                      }
                      label={status}
                      stepKey={status}
                      currentStatus={currentStatus}
                      isLast={index === STATUS_ORDER.length - 1}
                    />
                  ))}
                </div>

                <div className="report-buttons">
                  <button
                    onClick={() =>
                      downloadReportFromServer(orderDetails.order_id, 'pdf')
                    }
                  >
                    Скачать PDF
                  </button>
                  <button
                    onClick={() =>
                      downloadReportFromServer(orderDetails.order_id, 'xlsx')
                    }
                  >
                    Скачать Excel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p>Данные заказа не найдены.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStep({ icon, label, stepKey, currentStatus, isLast = false }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const stepIndex = STATUS_ORDER.indexOf(stepKey);
  const isReached = stepIndex !== -1 && currentIndex !== -1 && stepIndex <= currentIndex;

  return (
    <div
      className={`order-step ${
        isReached ? STATUS_COLOR_MAP[stepKey] : 'color-gray'
      }`}
    >
      <div className="order-step-icon">{icon}</div>
      <span className="order-step-label">{label}</span>
      {!isLast && <div className="order-step-line" />}
    </div>
  );
}

export default DetailedHistory;
