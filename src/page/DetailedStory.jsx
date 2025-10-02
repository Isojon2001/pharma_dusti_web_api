import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!token || !order_id) return;

      setLoading(true);

      try {
        const ordersRes = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/customer`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const ordersData = await ordersRes.json();
        console.log('Все заказы от API:', ordersData);

        if (ordersData?.code === 200 && Array.isArray(ordersData.payload)) {
          const foundOrder = ordersData.payload.find(
            (order) => order.id.toString() === order_id.toString()
          );

          if (foundOrder) {
            console.log('Найденный заказ:', foundOrder);
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
  
  const shouldShowName = (currentIndex) => {
    if (currentIndex === 0) return true;
    
    const currentItem = groupedItems[currentIndex];
    const previousItem = groupedItems[currentIndex - 1];
    
    return currentItem.name !== previousItem.name;
  };

  const mapStatusToKey = (status) => {
    if (!status) return '';
    console.log('Статус из orders/customer:', status);
    const normalized = status.toLowerCase().trim();
    const statusMap = {
      'pending': 'pending',
      'assembled': 'assembled', 
      'in_transit': 'delivered',
      'completed': 'completed',
      'delivered': 'delivered',
      'issued': 'issued'
    };

    const mappedKey = statusMap[normalized] || 'pending';
    console.log('Сопоставленный ключ:', mappedKey);
    
    return mappedKey;
  };

  const currentStatusKey = mapStatusToKey(orderDetails?.status);

  console.log('Финальный статус для отображения:', {
    originalStatus: orderDetails?.status,
    mappedKey: currentStatusKey
  });

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
                <div className="order_bg users_detailed detailed_bg">
                    {orderDetails ? (
                      <>
                        <div className='active_order'>
                          <h1>Статус заказа:</h1>
                        </div>
                <div className="order_info">
                  <OrderStep 
                    icon={<CircleCheck />} 
                    label="Оформлено" 
                    stepKey="issued" 
                    currentStatus={currentStatusKey} 
                    isLast={false} 
                  />
                  <OrderStep 
                    icon={<Clock3 />} 
                    label="В обработке" 
                    stepKey="pending" 
                    currentStatus={currentStatusKey} 
                    isLast={false} 
                  />
                  <OrderStep 
                    icon={<Package />} 
                    label="К отгрузке" 
                    stepKey="assembled" 
                    currentStatus={currentStatusKey} 
                    isLast={false} 
                  />
                  <OrderStep 
                    icon={<Truck />} 
                    label="В процессе доставки" 
                    stepKey="delivered" 
                    currentStatus={currentStatusKey} 
                    isLast={false} 
                  />
                  <OrderStep 
                    icon={<CircleCheck />} 
                    label="Доставлен" 
                    stepKey="completed" 
                    currentStatus={currentStatusKey} 
                    isLast={true} 
                  />
                </div>
                {currentStatusKey === 'delivered' && (
                  <button>Подтвердить получение</button>
                )}
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
          ) : (
            <p>Данные заказа не найдены.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStep({ icon, label, stepKey, currentStatus, isLast }) {
  const statusOrder = ['issued', 'pending', 'assembled', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const stepIndex = statusOrder.indexOf(stepKey);

  console.log('OrderStep:', { 
    stepKey, 
    label,
    currentStatus, 
    currentIndex, 
    stepIndex,
    isReached: stepIndex <= currentIndex
  });

  const isReached = stepIndex <= currentIndex && currentIndex !== -1;

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