import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function DetailedHistory() {
  const { order_id } = useParams();
  const location = useLocation();
  const { token } = useAuth();

  const selectedItem = location.state?.selectedItem || null;

  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/customer`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data?.code === 200 && Array.isArray(data.payload)) {
          const foundOrder = data.payload.find(order => order.id.toString() === order_id.toString());
          if (foundOrder) {
            setCurrentOrder(foundOrder);
          } else {
            setCurrentOrder(null);
          }
        } else {
          setCurrentOrder(null);
        }
      } catch (error) {
        console.error('Ошибка при загрузке:', error);
        setCurrentOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [token, order_id]);

  const selectedOrderItem = React.useMemo(() => {
    if (!currentOrder?.items) return null;

    if (!selectedItem) return currentOrder.items[0] || null;

    return (
      currentOrder.items.find(
        item =>
          item.name === selectedItem.name &&
          item.expiration_date === selectedItem.expiration_date
      ) || null
    );
  }, [currentOrder, selectedItem]);

  const calculateTotal = () => {
    if (!currentOrder?.items) return 0;
    return currentOrder.items.reduce((sum, item) => {
      return sum + (item.price || 0) * (item.quantity || 0);
    }, 0);
  };

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Заказ оформлен!');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="DetailedHistory">
      <OrderHeader />
      <div className="DetailedHistory_content bg_history">
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/history-order">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Статус заявки</h1>
        </div>

        {loading ? (
          <p>Загрузка...</p>
        ) : currentOrder ? (
          <>
            <div className="detailed_info">
              <div className="users_detailed">
                <div className="user_order">
                  <div>
                    <h2>#{currentOrder.code}</h2>
                    <ul>
                      <li>
                        {currentOrder.status === 'pending' && 'В обработке'}
                        {currentOrder.status === 'assembled' && 'Собран'}
                        {currentOrder.status === 'in_transit' && 'В пути'}
                        {!['pending', 'assembled', 'in_transit'].includes(currentOrder.status) && currentOrder.status}
                      </li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h2>Детали заказа</h2>
                  {selectedOrderItem ? (
                    <div className="order_item_details">
                      <strong>Название препарата: <span>{selectedOrderItem.name}</span></strong>
                      <p>Кол-во: <span>{selectedOrderItem.quantity}</span></p>
                      <p>Сумма: <span>{(selectedOrderItem.price * selectedOrderItem.quantity).toFixed(2)} сом</span></p>
                    </div>
                  ) : (
                    <p>Выбранный товар не найден в заказе</p>
                  )}
                </div>
              </div>
            </div>

            <div className="detail_basket">
              <h2>Детали заказа</h2>
              <div className='detailed_inf'>
                <p>Итоговая сумма:</p>
                <div className='detailed_btn'>
                  <p>{calculateTotal().toFixed(2)} сом</p>
                  <button
                    disabled={!currentOrder.items.length || isSubmitting}
                    onClick={handleSubmitOrder}
                  >
                    {isSubmitting ? 'Загрузка...' : 'Оформить'}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p>Заказ не найден</p>
        )}
      </div>
    </div>
  );
}

export default DetailedHistory;
