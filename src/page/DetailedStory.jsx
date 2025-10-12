import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import CircularOrderStatus from '../components/CircularOrderStatus';
import { useAuth } from '../context/AuthContext';
import { saveAs } from 'file-saver';

function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const customerRes = await fetch('http://api.dustipharma.tj:1212/api/v1/app/orders/customer', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!customerRes.ok) {
          throw new Error(`Ошибка при получении заказов: ${customerRes.status}`);
        }

        const customerData = await customerRes.json();
        const orders = customerData.payload || [];

        const foundOrder = orders.find((order) => String(order.id) === String(order_id));

        if (!foundOrder) {
          throw new Error('Заказ не найден.');
        }

        const statusRes = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!statusRes.ok) {
          throw new Error(`Ошибка при получении статуса заказа: ${statusRes.status}`);
        }

        const statusData = await statusRes.json();

        if (statusData.code === 200 && statusData.payload) {
          setOrderDetails({
            ...statusData.payload,
            code: foundOrder.code,
          });
        } else {
          throw new Error('Ошибка в данных статуса заказа');
        }

      } catch (err) {
        console.error(err);
        setError(err.message || 'Неизвестная ошибка');
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [order_id, token]);

  const downloadReport = async (format = 'pdf') => {
    if (!orderDetails) return;

    setIsDownloading(true);

    try {
      const url = `http://api.dustipharma.tj:1212/api/v1/app/orders/reports/${orderDetails.code}?format=${format}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/octet-stream',
        },
      });

      if (!res.ok) {
        throw new Error(`Ошибка при скачивании отчета (${res.status})`);
      }

      const blob = await res.blob();
      const ext = format === 'xlsx' ? 'xlsx' : 'pdf';
      saveAs(blob, `Заказ_${orderDetails.code}.${ext}`);
    } catch (err) {
      console.error(err);
      alert('Не удалось скачать файл.');
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
          ) : error ? (
            <p className="error_text">{error}</p>
          ) : orderDetails ? (
            <>
              <CircularOrderStatus
                apiStatus={orderDetails.status}
                token={token}
                orderId={order_id}
              />

              <div className="order_details_block">
                <h2>Детали заявки</h2>
                <div className="download_buttons">
                  <button
                    onClick={() => downloadReport('pdf')}
                    disabled={isDownloading}
                    className="details_button"
                  >
                    {isDownloading ? 'Загрузка...' : 'Скачать PDF'}
                  </button>
                  <button
                    onClick={() => downloadReport('xlsx')}
                    disabled={isDownloading}
                    className="details_button"
                  >
                    {isDownloading ? 'Загрузка...' : 'Скачать Excel'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p>Данные по заказу не найдены.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DetailedHistory;
