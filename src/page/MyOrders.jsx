import React, { useState, useEffect } from 'react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { MoveLeft, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function MyOrders() {
  const { token } = useAuth();
  const { addToCart, cartItems } = useCart();
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [loading, setLoading] = useState(false);

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
          <h1>Мой склад</h1>
        </div>

      <main className="products_mains myWarehouse_main">
        <div>
        {loading && products.length === 0 && <p>Загрузка продуктов...</p>}
          
          <div className='myWarehouse_nav'>
          <div className='myWarehouse_nav_buttons my_orders_btn'>
              <button onClick={() => window.location.href = './my-warehouse'}>Мои товары</button>
              <button onClick={() => window.location.href = './my-orders'}>Мои заказы</button>
          </div>
          <div>
          </div>
        </div>

        {!loading && products.length > 0 && (
          <>
            <table className="products_table myWarehouse_table myorders_table">
              <thead>
                <tr>
                  <th>Номер заказа</th>
                  <th>Товаров</th>
                  <th>Адрес Доставки</th>
                  <th>Сумма заказа</th>
                  <th>Статус заказа</th>
                  <th></th>
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
                      <td>{product['Цена']} сом</td>
                      <td>{product['Цена']} сом</td>
                      <td>
                      <Link to={`/paymants-status`} className="historys_infos">
                        <button>К обработке</button>
                      </Link>
                      </td>
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
        </div>
      </main>
          
        </div>
    </div>
  );
}

export default MyOrders;