import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, Calendar } from 'lucide-react';
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

  const formatDateParts = (isoDate) => {
    const date = new Date(isoDate);
    date.setHours(date.getHours() - 5);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getTotalPrice = (items = []) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && order.status === 'pending') ||
      (filterStatus === 'assembled' && order.status === 'assembled') ||
      (filterStatus === 'in_transit' && order.status === 'in_transit');

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
            <button className={filterStatus === 'all' ? 'active' : ''} onClick={() => setFilterStatus('all')}>Все</button>
            <div className="history_line"></div>
            <button className={filterStatus === 'pending' ? 'active' : ''} onClick={() => setFilterStatus('pending')}>В обработке</button>
            <div className="history_line"></div>
            <button className={filterStatus === 'assembled' ? 'active' : ''} onClick={() => setFilterStatus('assembled')}>Заказ собран</button>
            <div className="history_line"></div>
            <button className={filterStatus === 'in_transit' ? 'active' : ''} onClick={() => setFilterStatus('in_transit')}>В пути</button>
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
  );
}

export default HistoryOrder;
