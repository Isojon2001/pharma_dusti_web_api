import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderStatus, setOrderStatus] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!token || !order_id) return;

      setLoading(true);

      try {
        const statusRes = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order_id}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const statusData = await statusRes.json();

        if (statusData?.code === 200 && statusData.payload) {
          setOrderStatus(statusData.payload.status);
        } else {
          setOrderStatus(null);
          console.warn('Ошибка при получении статуса заказа:', statusData);
        }

        const ordersRes = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/customer`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = await ordersRes.json();

        if (ordersData?.code === 200 && Array.isArray(ordersData.payload)) {
          const foundOrder = ordersData.payload.find(
            (order) => order.id.toString() === order_id.toString()
          );

          if (foundOrder) {
            setOrderDetails(foundOrder);
          } else {
            setOrderDetails(null);
            console.warn('Заказ с таким ID не найден.');
          }
        } else {
          setOrderDetails(null);
          console.warn('Ошибка при получении списка заказов:', ordersData);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setOrderStatus(null);
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [order_id, token]);

  const getTotalPrice = (items) => {
    if (!items) return 0;
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

const groupItems = (items) => {
  const grouped = {};

  items.forEach((item) => {
    const expiry = item.expiration_date;

    if (!expiry) return;

    const expiryYear = new Date(expiry).getFullYear();

    if (expiryYear < 2024 || expiryYear > 2030) return;

    const key = `${item.name}_${expiry}`;

    if (!grouped[key]) {
      grouped[key] = { ...item };
    }
  });

  return Object.values(grouped).sort(
    (a, b) => new Date(a.expiration_date) - new Date(b.expiration_date)
  );
};


  const groupedItems = orderDetails?.items ? groupItems(orderDetails.items) : [];
  const activeOrder = orderDetails ? { ...orderDetails, status: orderStatus } : null;

  const mapStatusToKey = (status) => {
    if (!status) return '';
    const normalized = status.toLowerCase();

    switch (normalized) {
      case 'оформлено':
        return 'issued';
      case 'в обработке':
        return 'pending';
      case 'в процессе сборки':
        return 'assembled';
      case 'в процессе доставки':
        return 'delivered';
      case 'доставлен':
        return 'completed';
      case 'к отгрузке':
        return 'pending';
      default:
        return '';
    }
  };

  const currentStatusKey = mapStatusToKey(orderStatus);

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
        <div className='order_basket_step'>
          {loading ? (
            <p>Загрузка...</p>
          ) : orderDetails ? (
            <div className="detailed_info">
              <div className="users_detailed">
                <div className="user_order">
                  <div>
                    <h2>#{orderDetails.code || '—'}</h2>
                  </div>
                </div>

                <div>
                  <h2>Детали заказа</h2>
                  {groupedItems.map((item, index) => (
                    <div key={index}>
                      <p>Наименование товара: <span>{item.name}</span></p>
                      <p>Кол-во товара: <span>{item.quantity}</span></p>
                      <p>Сумма товара : <span>{(item.price).toFixed(2)} сом</span></p>
                      {item.expiration_date && (
                        <p>Срок годности: <span>{item.expiration_date}</span></p>
                      )}
                      <div className="detailed_line"></div>
                    </div>
                  ))}
                  <h3>Общая сумма: <span>{getTotalPrice(orderDetails.items).toFixed(2)} сом</span></h3>
                </div>
              </div>
            </div>
          ) : (
            <p>Данные заказа не найдены.</p>
          )}
          <div className="order_bg detailed_bg">
            {activeOrder ? (
              <>
                <div className='active_order'>
                  <h1>Статус заказа:</h1>
                </div>

                <div className="order_info">
                  <OrderStep icon={<CircleCheck />} label="Оформлено" stepKey="issued" currentStatus={currentStatusKey} isLast={false} />
                  <OrderStep icon={<Clock3 />} label="В обработке" stepKey="pending" currentStatus={currentStatusKey} isLast={false} />
                  <OrderStep icon={<Package />} label="В процессе сборки" stepKey="assembled" currentStatus={currentStatusKey} isLast={false} />
                  <OrderStep icon={<Truck />} label="В процессе доставки" stepKey="delivered" currentStatus={currentStatusKey} isLast={false} />
                  <OrderStep icon={<CircleCheck />} label="Доставлен" stepKey="completed" currentStatus={currentStatusKey} isLast={true} />
                </div>
                <button>Потвердить получении</button>
              </>
            ) : (
              <div className="no_active_order">
                <h1>Нет активных заказов</h1>
                <p>Сделайте новый заказ и здесь будет отображаться статус активного заказа</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderStep({ icon, label, stepKey, currentStatus, isLast }) {
  const statusOrder = ['issued', 'pending', 'assembled', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepKey);

  const isReached = stepIndex <= currentIndex;

  const colorClassMap = {
    issued: 'color-green',
    pending: 'color-yellow',
    assembled: 'color-orange',
    delivered: 'color-blue',
    completed: 'color-bright-green',
  };

  const stepClass = `
    order-step 
    ${isReached ? colorClassMap[stepKey] : 'color-gray'}
  `.trim();

  return (
    <div className={stepClass}>
      <div className="order-step-icon">{icon}</div>
      <span className="order-step-label">{label}</span>
      {!isLast && <div className="order-step-line" />}
    </div>
  );
}

export default DetailedHistory;
