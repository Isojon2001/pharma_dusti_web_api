import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, X, Calendar } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';

function formatDateOnly(dateStr) {
  if (!dateStr) return '—';
  return dateStr.slice(0, 20);
}
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

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', limit);

    if (searchTerm.trim() !== '') {
      params.append('code', searchTerm.trim());
    }

    if (filterStatus !== 'all') {
      params.append('status', filterStatus);
    }

    if (selectedDate) {
      params.append('date_from', selectedDate);
      params.append('date_to', selectedDate);
    }

    return params.toString();
  };

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    const query = buildQueryParams();

    fetch(`https://api.dustipharma.tj:1212/api/v1/app/orders/customer?${query}`, {
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
              fetch(`https://api.dustipharma.tj:1212/api/v1/app/orders/status/${order.id}`, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              })
                .then(res => res.json())
                .then(statusData => {
                  statusesObj[order.id] = statusData.payload?.status || 'unknown';
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
  }, [token, page, limit, searchTerm, filterStatus, selectedDate]);

  const getTotalPrice = (items = []) => {
    if (!Array.isArray(items)) return 0;

    return items.reduce((sum, item) => {
      if (!item) return sum;

      const price = parseFloat(item.price ?? item.Цена ?? 0);
      const quantity = parseFloat(item.quantity ?? item.Количество ?? 0);

      return sum + price * quantity;
    }, 0);
  };

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
            {['all', 'К отгрузке', 'Отгружен', 'В пути', 'Доставлен'].map(status => (
              <React.Fragment key={status}>
                <button
                  className={filterStatus === status ? 'active' : ''}
                  onClick={() => {
                    setPage(1);
                    setFilterStatus(status);
                  }}
                >
                  {status === 'all' ? 'Все' :
                   status === 'К отгрузке' ? 'В обработке' :
                   status === 'Отгружен' ? 'Готов к доставке' :
                   status === 'В пути' ? 'В пути' :
                   'Доставлен'}
                </button>
                <div className="history_line"></div>
              </React.Fragment>
            ))}
          </div>
          <div className="results_searching">
            <input
              type="text"
              placeholder="Введите номер заказа"
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
            />
            <div className="calendar_icon_wrapper">
              <span
                onClick={() => document.getElementById('datePicker').showPicker()}
                className={`calendar_icon_clickable ${selectedDate ? 'date-selected' : ''}`}
                title="Выбрать дату"
              >
                <Calendar />
              </span>

              <input
                id="datePicker"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setPage(1);
                  setSelectedDate(e.target.value);
                }}
                className={`hidden_date_picker ${selectedDate ? 'selected' : ''}`}
              />

              {selectedDate && (
                <span
                  className="clear_date_icon"
                  onClick={() => {
                    setPage(1);
                    setSelectedDate('');
                  }}
                  title="Очистить дату"
                >
                  <X />
                </span>
              )}
                </div>
          </div>
        </div>

        <div className="orders_list">
          {loading ? (
            <p>Загрузка...</p>
          ) : orders.length === 0 ? (
            <p>Заказы не найдены</p>
          ) : (
            orders.map(order => {
              const total = getTotalPrice(order.items).toFixed(2);
              const itemCount = order.items?.length || 0;
              const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0);

              return (
                <div key={order.id} className="order_card">
                  <Link to={`/detailed-history/${order.id}`} className="history_infos">
                    <div className="history_info"><strong>Дата и время:</strong> {formatDateOnly(order.created_at)}</div>
                    <div className="history_info"><strong>№ Заявки:</strong> #{order.code}</div>
                    <div className="history_info"><strong>Кол-во наименование:</strong> {itemCount} / {totalQuantity}</div>
                    <div className="history_info"><strong>Сумма:</strong> {total} Сомони</div>
                  </Link>
                  <div className="history_lines"></div>
                  <Link to={`/detail-realisations/${order.id}`} className="history_infos">
                    <div><h2>Детали реализации</h2></div>
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {searchTerm.trim() === '' && selectedDate === '' && filterStatus === 'all' && (
          <div className="pagination_controls">
            <button onClick={() => setPage(prev => Math.max(prev - 1, 1))} disabled={page === 1}>
              Назад
            </button>
            <span>Страница {page} из {totalPages}</span>
            <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
              Вперед
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryOrder;
