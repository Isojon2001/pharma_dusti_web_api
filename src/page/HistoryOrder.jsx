import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function HistoryOrder() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/customer?page=${page}&limit=${limit}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setOrders(data.payload || []);
          setTotalOrders(data.total || 0);
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки заказов:', err);
        setOrders([]);
        setTotalOrders(0);
        setLoading(false);
      });
  }, [token, page, limit]);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return `${date.toLocaleDateString()} | ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getTotalPrice = (items = []) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  };

  const mapStatusToDisplay = (status) => {
    if (!status) return 'Неизвестно';
    
    const normalized = status.toLowerCase().trim();

    const statusMap = {
      'оформлено': 'Оформлено',
      'в обработке': 'В обработке',
      'к отгрузке': 'К отгрузке',
      'в процессе сборки': 'В процессе сборки',
      'в процессе доставки': 'В процессе доставки',
      'доставлен': 'Доставлен',
      'обработан': 'В обработке',
      'собран': 'К отгрузке',
      'доставляется': 'В процессе доставки',
      'завершен': 'Доставлен',
      'выполнен': 'Доставлен',
      'issued': 'Оформлено',
      'pending': 'В обработке',
      'assembled': 'К отгрузке',
      'delivered': 'В процессе доставки',
      'completed': 'Доставлен',
      'in_transit': 'В процессе доставки'
    };

    return statusMap[normalized] || status;
  };

  const mapStatusToFilterKey = (status) => {
    if (!status) return 'other';
    
    const normalized = status.toLowerCase().trim();

    const statusMap = {
      'оформлено': 'pending',
      'в обработке': 'pending',
      'к отгрузке': 'assembled',
      'в процессе сборки': 'assembled',
      'в процессе доставки': 'in_transit',
      'доставлен': 'completed',
      'обработан': 'pending',
      'собран': 'assembled',
      'доставляется': 'in_transit',
      'завершен': 'completed',
      'выполнен': 'completed',
      'issued': 'pending',
      'pending': 'pending',
      'assembled': 'assembled',
      'delivered': 'in_transit',
      'completed': 'completed',
      'in_transit': 'in_transit'
    };

    return statusMap[normalized] || 'other';
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all') {
      const orderFilterKey = mapStatusToFilterKey(order.status);
      if (filterStatus !== orderFilterKey) return false;
    }

    if (searchTerm.trim() !== '') {
      return order.code.toLowerCase().includes(searchTerm.toLowerCase());
    }

    return true;
  });

  const totalPages = Math.ceil(totalOrders / limit);

  return (
    <div className='HistoryOrder_content'>
      <OrderHeader />
      <div className='basket_back bg_history'>
        <div className="examination_backspace">
          <Link to="/add-products-to-cart">
            <MoveLeft stroke="#232323" /> Назад
          </Link>
        </div>

        <div>
          <h1>История заказов</h1>
          <div className='history_filter'>
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              Все
            </button>
            <div className='history_line'></div>
            <button
              className={filterStatus === 'pending' ? 'active' : ''}
              onClick={() => setFilterStatus('pending')}
            >
              В обработке
            </button>
            <div className='history_line'></div>
            <button
              className={filterStatus === 'assembled' ? 'active' : ''}
              onClick={() => setFilterStatus('assembled')}
            >
              К отгрузке
            </button>
            <div className='history_line'></div>
            <button
              className={filterStatus === 'in_transit' ? 'active' : ''}
              onClick={() => setFilterStatus('in_transit')}
            >
              В процессе доставки
            </button>
          </div>

          <div className='results_searching'>
            <input
              type="text"
              placeholder='Введите #номер заказа'
              name="search_history"
              id="search_history"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            {loading ? (
              <p>Загрузка...</p>
            ) : filteredOrders.length === 0 ? (
              <p>Заказы не найдены</p>
            ) : (
              filteredOrders.map(order => (
                <Link
                  key={order.id}
                  to={`/detailed-history/${order.id}`}
                  className="users_order"
                >
                  <div className="user_order">
                    <div>
                      <h2>#{order.code}</h2>
                      <ul>
                        <li>{mapStatusToDisplay(order.status)}</li>
                      </ul>
                    </div>
                    <div>
                      <p>{formatDate(order.created_at)}</p>
                    </div>
                  </div>
                  <p>
                    Итоговая сумма: <span>{getTotalPrice(order.items).toFixed(2)} сом</span>
                  </p>
                </Link>
              ))
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
                Назад
              </button>
              <span>Страница {page} из {totalPages}</span>
              <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                Вперед
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryOrder;