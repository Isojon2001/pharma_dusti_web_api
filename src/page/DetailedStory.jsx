import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';
import CircularOrderStatus from '../components/CircularOrderStatus';

const STATUS_ORDER = [
  'Оформлено',
  'В обработке',
  'В сборке',
  'Готов к доставке',
  'В пути',
  'Доставлен',
];

const API_STATUS_TO_STEP_STATUS = {
  'Оформлено': 'Оформлено',
  'В обработке': 'В обработке',
  'К отгрузке': 'В сборке',
  'Отгружен': 'Готов к доставке',
  'В пути': 'В пути',
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
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
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
          throw new Error(`Ошибка сервера (customer): ${customerRes.status}`);
        }

        const customerData = await customerRes.json();
        const foundOrder = customerData.payload?.find(
          (order) => order.id === order_id
        );

        if (!foundOrder) {
          throw new Error('Заказ не найден в списке заказов');
        }

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
          throw new Error(`Ошибка сервера (status): ${statusRes.status}`);
        }

        const statusData = await statusRes.json();

        if (statusData?.code === 200 && statusData.payload) {
          setOrderDetails({
            ...statusData.payload,
            code: foundOrder.code,
          });
        } else {
          setOrderDetails(null);
        }
      } catch (error) {
        console.error('Ошибка при загрузке деталей заказа:', error);
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order_id, token]);

  const currentStatus = orderDetails
    ? API_STATUS_TO_STEP_STATUS[orderDetails.status] || null
    : null;

  const downloadReportFromServer = async (orderCode, format = 'pdf') => {
    const baseUrl = `http://api.dustipharma.tj:1212/api/v1/app/orders/reports/${orderCode}`;
    const url = `${baseUrl}?format=${format}`;

    setIsDownloading(true);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/octet-stream',
        },
      });

      if (!response.ok) {
        throw new Error(`Ошибка при получении отчёта (${response.status})`);
      }

      const blob = await response.blob();
      const extension = format === 'xlsx' ? 'xlsx' : 'pdf';
      saveAs(blob, `Заказ_${orderCode}.${extension}`);
    } catch (error) {
      console.error('Ошибка при загрузке отчёта:', error);
    } finally {
      setIsDownloading(false);
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
        </div>

        <div className="order_basket_step">
          {loading ? (
            <p>Загрузка...</p>
          ) : orderDetails ? (
            <CircularOrderStatus apiStatus={orderDetails.status} />
          ) : (
            <p>Данные заказа не найдены.</p>
          )}

          {!loading && orderDetails && (
            <div className="order_details_block">
              <h2>Детали заявки</h2>
              <div className="download_buttons">
                <button
                  onClick={() => downloadReportFromServer(orderDetails.code, 'pdf')}
                  disabled={isDownloading}
                  className="details_button"
                >
                  {isDownloading ? 'Загрузка...' : 'Скачать PDF'}
                </button>
                <button
                  onClick={() => downloadReportFromServer(orderDetails.code, 'xlsx')}
                  disabled={isDownloading}
                  className="details_button"
                >
                  {isDownloading ? 'Загрузка...' : 'Скачать Excel'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailedHistory;
