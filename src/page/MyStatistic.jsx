import React, { useState, useEffect } from 'react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { MoveLeft, Trash2 } from 'lucide-react';
import MiniChart from "../components/MiniChart";
import { DateRange } from 'react-date-range';
import { ru } from 'date-fns/locale';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function MyStatistic() {
  const { token } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [loading, setLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [dateRange, setDateRange] = useState([
  {
    startDate: new Date(2025, 11, 3),
    endDate: new Date(2026, 0, 3),
    key: 'selection'
  }
]);
  const formatInputDate = (date) => {
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
};


  useEffect(() => {
    const newQuantities = {};
    const newAddedItems = {};
    cartItems.forEach(item => {
      newQuantities[item.id] = item.quantity;
      newAddedItems[item.id] = true;
    });
    setQuantities(prev => ({ ...prev, ...newQuantities }));
    setAddedItems(prev => ({ ...prev, ...newAddedItems }));
  }, [cartItems]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const handleQuantityChange = (id, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [id]: quantity }));
  };

  const handleAddToCart = (id, product) => {
    const quantity = quantities[id] || 1;
    addToCart({ ...product, quantity });
    setAddedItems((prev) => ({ ...prev, [id]: true }));
  };

  const loadProducts = async (currentPage = 1) => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await axios.get(
        'https://api.dustipharma.tj:1212/api/v1/app/products/all',
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page: currentPage, size: 19 },
        }
      );

      const payload = res?.data?.payload;
      const data = payload?.data || [];
      const meta = payload?.meta;

      setProducts((prev) => {
        const combined = [...prev, ...data];
        const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
        return unique;
      });

      if (meta && meta.current_page >= meta.last_page) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      console.error('Ошибка при загрузке продуктов:', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadProducts(1);
  }, [token]);

  const handleLoadMore = async () => {
    const currentScroll = window.scrollY;
    const nextPage = page + 1;
    setPage(nextPage);
    await loadProducts(nextPage);
    setTimeout(() => {
      window.scrollTo(0, currentScroll);
    }, 0);
  };

  return (
    <div className="AddProductsToCart_content">
        <OrderHeader />
        <div>
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/add-products-to-cart">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Статистика</h1>
        </div>
        <div className="stats_date_inputs">
  <div className="date_input" onClick={() => setCalendarOpen(!calendarOpen)}>
    <label>От</label>
    <input
      type="text"
      readOnly
      value={formatInputDate(dateRange[0].startDate)}
    />
  </div>

  <div className="date_input" onClick={() => setCalendarOpen(!calendarOpen)}>
    <label>До</label>
    <input
      type="text"
      readOnly
      value={formatInputDate(dateRange[0].endDate)}
    />
  </div>
</div>

{calendarOpen && (
  <div className="stats_calendar_popup">
    <DateRange
      months={2}
      direction="horizontal"
      moveRangeOnFirstSelection={false}
      rangeColors={['#0F7372']}
      ranges={dateRange}
      onChange={(item) => {
        setDateRange([item.selection]);
      }}
      locale={ru}
      weekdayDisplayFormat="EEEEEE"
      monthDisplayFormat="LLLL, yyyy"
    />
  </div>
)}
        <div className='statistics_bars Mystatistics_bars'>
          <div className='statistics_charts'>
            <MiniChart
              title="Количество продаж"
              value={248492}
              labels={["авг", "сен", "окт"]}
              data={[120, 110, 150]}
            />
            <div className='stats_line'></div>
            <MiniChart
              title="Выручка"
              value={294892}
              suffix="сомони"
              labels={["окт", "ноя", "дек"]}
              data={[140, 130, 170]}
            />
            <div className='stats_line'></div>
          </div>
          <div>
           <div>Топ товаров</div>
            <div className='top_products'>
                                  <p>
                        <span>1</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>Парацетамол</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>224345</span>
                    </p>
                    <p>
                        <span>1</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>Парацетамол</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>224345</span>
                    </p>
                    <p>
                        <span>1</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>Парацетамол</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>224345</span>
                    </p>
                    <p>
                        <span>1</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>Парацетамол</span>
                        <svg width="3" height="3" viewBox="0 0 3 3" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="1.5" cy="1.5" r="1.5" fill="#838383"/>
                            </svg>
                        <span>224345</span>
                    </p>
            </div>
          </div>
        </div>



      <main className="products_mains myWarehouse_main">
        <div className='myWarehouse_nav myStatistic_nav'>
          <div className='myWarehouse_nav_buttons my_orders_btn'>
                        <div className='myWarehouse_search myStatistic_search'>
              <input type="text" name="search_mywarehouse" placeholder='Поиск по статистике' id="search_mywarehouse"/>
            </div>
          </div>
        </div>
        {loading && products.length === 0 && <p>Загрузка продуктов...</p>}

        {!loading && products.length > 0 && (
          <>
            <table className="products_table myWarehouse_table mystatistic_table">
              <thead>
                <tr>
                  <th>Название продукта</th>
                  <th>Продажи оффлайн</th>
                  <th>Продажи Duston EPharma</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => {
                  const id = product.id;
                  const quantity = quantities[id] || 1;
                  const isAdded = addedItems[id];
                    const rowClass = index % 2 === 0 ? 'row_even' : 'row_odd';
                  return (
                    <tr key={id} className={rowClass}>
                      <td>{product['Наименование']}</td>
                      <td>{product['Производитель'] || ''}</td>
                      <td>{formatDate(product['Срок'])}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {hasMore && !loading && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Показать ещё
                </button>
              </div>
            )}

            {!hasMore && <p className="no-more-text">Все товары загружены</p>}
          </>
        )}

        {!loading && products.length === 0 && (
          <p className="no-results-text">Нет доступных продуктов</p>
        )}
      </main>
          
        </div>
    </div>
  );
}

export default MyStatistic;