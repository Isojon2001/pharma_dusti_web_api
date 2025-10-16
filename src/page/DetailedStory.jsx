import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MoveLeft,
  CircleCheck,
  Clock3,
  Package,
  Truck,
  Route,
} from 'lucide-react';
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

  const normalizeDate = (dateStr) => {
    if (
      !dateStr ||
      dateStr === '01.01.0001 0:00:00' ||
      dateStr.trim() === ''
    ) {
      return '—';
    }
    return dateStr;
  };

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrderDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const customerRes = await fetch(
          'https://api.dustipharma.tj:1212/api/v1/app/orders/customer',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!customerRes.ok) {
          throw new Error(`Ошибка при получении заказов: ${customerRes.status}`);
        }

        const customerData = await customerRes.json();
        const orders = customerData.payload || [];

        const foundOrder = orders.find(
          (order) => String(order.id) === String(order_id)
        );

        if (!foundOrder) {
          throw new Error('Заказ не найден.');
        }

        const statusRes = await fetch(
          `https://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!statusRes.ok) {
          throw new Error(
            `Ошибка при получении статуса заказа: ${statusRes.status}`
          );
        }

        const statusData = await statusRes.json();

        if (statusData.code === 200 && statusData.payload) {
          const rawStatus = statusData.payload.status || {};

          const timestamps = {
            created_at: normalizeDate(rawStatus.ДатаОформлено),
            processed_at: normalizeDate(rawStatus.ДатаКОбработке),
            assembled_at: normalizeDate(rawStatus.ДатаКСборке),
            ready_at: normalizeDate(rawStatus.ДатаГотовКДоставке),
            in_transit_at: normalizeDate(rawStatus.ДатаВПути),
            delivered_at: normalizeDate(rawStatus.ДатаДоставлен),
          };

          setOrderDetails({
            ...statusData.payload,
            code: foundOrder.code,
            timestamps,
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
      const url = `https://api.dustipharma.tj:1212/api/v1/app/orders/reports/${orderDetails.code}?format=${format}`;
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

              {orderDetails.timestamps && (
                <>
                  <div className="date_realisations">
                    <h2>Дата и время реализации</h2>
                  </div>

                  <div className="order_stages_icons">
                    {[
                      {
                        label: 'Оформлен',
                        icon: <CircleCheck size={24} />,
                        date: orderDetails.timestamps.created_at,
                      },
                      {
                        label: 'Обработан',
                        icon: <Clock3 size={24} />,
                        date: orderDetails.timestamps.processed_at,
                      },
                      {
                        label: 'Сборка',
                        icon: <Package size={24} />,
                        date: orderDetails.timestamps.assembled_at,
                      },
                      {
                        label: 'Готов к доставке',
                        icon: <Truck size={24} />,
                        date: orderDetails.timestamps.ready_at,
                      },
                      {
                        label: 'В пути',
                        icon: <Route size={24} />,
                        date: orderDetails.timestamps.in_transit_at,
                      },
                      {
                        label: 'Доставлен',
                        icon: <CircleCheck size={24} />,
                        date: orderDetails.timestamps.delivered_at,
                      },
                    ].map(({ label, icon, date }) => (
                      <div className="stage_block" key={label}>
                        <div className="stage_icon">{icon}</div>
                        <div className="stage_label">{label}</div>
                        <div className="stage_time">{date}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
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
