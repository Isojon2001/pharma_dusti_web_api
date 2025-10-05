import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';

const STATUS_ORDER = ['issued', 'pending', 'assembled', 'delivered', 'completed'];

const STATUS_COLOR_MAP = {
  issued: 'color-green',
  pending: 'color-yellow',
  assembled: 'color-orange',
  delivered: 'color-blue',
  completed: 'color-bright-green',
};

const STATUS_MAP = {
  pending: 'pending',
  assembled: 'assembled',
  in_transit: 'delivered',
  completed: 'completed',
  delivered: 'delivered',
  issued: 'issued',
};

function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          'http://api.dustipharma.tj:1212/api/v1/app/orders/customer',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        if (data?.code === 200 && Array.isArray(data.payload)) {
          const foundOrder = data.payload.find(
            (order) => order.id.toString() === order_id.toString()
          );
          setOrderDetails(foundOrder || null);
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

    fetchOrderData();
  }, [order_id, token]);

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

  const currentStatusKey = orderDetails
    ? STATUS_MAP[orderDetails.status] || 'issued'
    : 'issued';

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
        </div>

        <div className="order_basket_step">
          {loading ? (
            <p>Загрузка...</p>
          ) : orderDetails ? (
            <div className="detailed_info">
              <div className="users_detailed order_bg detailed_bg">
                <div className="active_order"></div>
                <div className="order_info">
                  <OrderStep
                    icon={<CircleCheck />}
                    label="Оформлено"
                    stepKey="issued"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<Clock3 />}
                    label="В обработке"
                    stepKey="pending"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<Package />}
                    label="В процессе сборки"
                    stepKey="assembled"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<Truck />}
                    label="В процессе доставки"
                    stepKey="delivered"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<CircleCheck />}
                    label="Доставлен"
                    stepKey="completed"
                    currentStatus={currentStatusKey}
                    isLast
                  />
                </div>

                <div className="report-buttons">
                  <button
                    onClick={() =>
                      downloadReportFromServer(orderDetails.code, 'pdf')
                    }
                  >
                    Скачать PDF
                  </button>
                  <button
                    onClick={() =>
                      downloadReportFromServer(orderDetails.code, 'xlsx')
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
