import React, { useState, useEffect } from 'react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function PriceList() {
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const [loading, setLoading] = useState(false);

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
          params: { page: currentPage },
        }
      );

      const payload = res?.data?.payload;
      const data = payload?.data || [];
      const meta = payload?.meta;

      console.log('Загружена страница:', currentPage);
      console.log('Полученные товары:', data.map(p => p['Наименование']));

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

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProducts(nextPage);
  };

  return (
    <div className="AddProductsToCart_content">
      <div className="AddProductsToСarts">
        <OrderHeader />
      </div>

      <main className="products_mains">
        <h1>
          Выберите товар из списка и добавьте в <span className="colors">корзину</span>
        </h1>

        {loading && products.length === 0 && <p>Загрузка продуктов...</p>}

        {!loading && products.length > 0 && (
          <>
            <table className="products_table">
              <thead>
                <tr>
                  <th>Название продукта</th>
                  <th>Производитель</th>
                  <th>Срок годности</th>
                  <th>Цена</th>
                  <th>Кол-во</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const id = product.id;
                  const quantity = quantities[id] || 1;
                  const isAdded = addedItems[id];

                  return (
                    <tr key={id}>
                      <td>{product['Наименование']}</td>
                      <td>{product['Производитель'] || 'Пусто'}</td>
                      <td>{formatDate(product['Срок'])}</td>
                      <td>{product['Цена']} сом</td>
                      <td>
                        <div className="quantity-wrapper">
                          <button
                            onClick={() => handleQuantityChange(id, quantity - 1)}
                            disabled={quantity <= 1 || isAdded}
                          >
                            −
                          </button>
                          <input
                            className="quantity-input"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(id, e.target.value)}
                            disabled={isAdded}
                          />
                          <button
                            onClick={() => handleQuantityChange(id, quantity + 1)}
                            disabled={isAdded}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
                          onClick={() => handleAddToCart(id, product)}
                          disabled={isAdded}
                        >
                          {isAdded ? 'Добавлено' : 'Добавить в корзину'}
                        </button>
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

            {!hasMore && (
              <p className="no-more-text">Все товары загружены</p>
            )}
          </>
        )}

        {!loading && products.length === 0 && (
          <p className="no-results-text">Нет доступных продуктов</p>
        )}
      </main>
    </div>
  );
}

export default PriceList;
