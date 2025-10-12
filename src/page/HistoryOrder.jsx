import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, Calendar } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function HistoryOrder() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState({});
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

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
      .then(async data => {
        if (data.code === 200) {
          const fetchedOrders = data.payload || [];
          setOrders(fetchedOrders);
          setTotalOrders(data.total || 0);

          const statusesObj = {};
          await Promise.all(
            fetchedOrders.map(order =>
              fetch(`http://api.dustipharma.tj:1212/api/v1/app/orders/status/${order.id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(res => res.json())
                .then(statusData => {
                  if (statusData.code === 200 && statusData.payload?.status) {
                    statusesObj[order.id] = statusData.payload.status;
                  } else {
                    statusesObj[order.id] = 'unknown';
                  }
                })
                .catch(() => {
                  statusesObj[order.id] = 'unknown';
                })
            )
          );

          setOrderStatuses(statusesObj);
        } else {
          setOrders([]);
          setTotalOrders(0);
          setOrderStatuses({});
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки заказов:', err);
        setOrders([]);
        setTotalOrders(0);
        setOrderStatuses({});
        setLoading(false);
      });
  }, [token, page, limit]);

  const formatDateParts = (isoDate) => {
    const date = new Date(isoDate);
    date.setHours(date.getHours() - 5);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([]),
    };
  };

const getTotalPrice = (items = []) => {
  if (!Array.isArray(items)) return 0;

  return items.reduce((sum, item) => {
    if (!item) return sum;

    const price = parseFloat(item.price ?? item.Цена ?? 0);
    const quantity = parseFloat(item.quantity ?? item.Количество ?? 0);

    return sum + price * quantity;
  }, 0);
};


  const filteredOrders = orders.filter(order => {
    const currentStatus = orderStatuses[order.id] || 'pending';

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'К отгрузке' && currentStatus === 'К отгрузке') ||
      (filterStatus === 'Отгружен' && currentStatus === 'Отгружен') ||
      (filterStatus === 'Отгружен' && currentStatus === 'В пути') ||
      (filterStatus === 'Доставлен' && currentStatus === 'Доставлен');

    const matchesSearch = searchTerm.trim() === '' || order.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = selectedDate === '' || new Date(order.created_at).toISOString().slice(0, 10) === selectedDate;

    return matchesStatus && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(totalOrders / limit);

  return (
    <div className="HistoryOrder_content">
      <OrderHeader />
      <div className="results_cards">
        <div className="filters_section">
          <div className="examination_backspace">
            <Link to="/add-products-to-cart">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>

          <h1>История заказов</h1>

          <div className="history_filter">
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              Все
            </button>
            <div className="history_line"></div>
            <button
              className={filterStatus === 'К отгрузке' ? 'active' : ''}
              onClick={() => setFilterStatus('К отгрузке')}
            >
              В сборке
            </button>
            <div className="history_line"></div>
            <button
              className={filterStatus === 'Отгружен' ? 'active' : ''}
              onClick={() => setFilterStatus('Отгружен')}
            >
              Готов к доставке
            </button>
            <div className="history_line"></div>
            <button
              className={filterStatus === 'В пути' ? 'active' : ''}
              onClick={() => setFilterStatus('В пути')}
            >
              В пути
            </button>
            <div className="history_line"></div>
            <button
              className={filterStatus === 'Доставлен' ? 'active' : ''}
              onClick={() => setFilterStatus('Доставлен')}
            >
              Доставлен
            </button>
          </div>

          <div className="results_searching">
            <input
              type="text"
              placeholder="Введите #номер заказа"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="calendar_icon_wrapper">
              <span
                onClick={() => document.getElementById('datePicker').showPicker()}
                className="calendar_icon_clickable"
                title="Выбрать дату"
              >
                <Calendar />
              </span>

              <input
                id="datePicker"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="hidden_date_picker"
              />
            </div>
          </div>
        </div>

        <div className="orders_list">
          {loading ? (
            <p>Загрузка...</p>
          ) : filteredOrders.length === 0 ? (
            <p>Заказы не найдены</p>
          ) : (
            filteredOrders.map(order => {
              const { date, time } = formatDateParts(order.created_at);
              const total = getTotalPrice(order.items).toFixed(2);
              const itemCount = order.items?.length || 0;
              const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0);

              return (
                <div key={order.id} className="order_card">
                  <Link
                    to={`/detailed-history/${order.id}`}
                    className="history_infos"
                  >
                    <div className="history_info"><strong>Дата:</strong> {date}</div>
                    <div className="history_info"><strong>Время:</strong> {time}</div>
                    <div className="history_info"><strong>№ Заявки:</strong> #{order.code}</div>
                    <div className="history_info"><strong>Кол-во наименование:</strong> {itemCount} / {totalQuantity}</div>
                    <div className="history_info"><strong>Сумма:</strong> {total} Сомони</div>
                  </Link>
                  <div className="history_lines"></div>
                  <Link
                    to={`/detail-realisations/${order.id}`}
                    className="history_infos"
                  >
                    <div>
                      <h2>Детали реализации</h2>
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>

        <div className="pagination_controls">
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
  );
}

export default HistoryOrder;
