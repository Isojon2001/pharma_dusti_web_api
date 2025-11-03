import React, { useState, useEffect } from 'react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function PriceList() {
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
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

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const loadAllProducts = async () => {
      try {
        const firstRes = await axios.get(
          'https://api.dustipharma.tj:1212/api/v1/app/products/all',
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { page: 1 },
          }
        );

        const meta = firstRes?.data?.payload?.meta;
        const totalPages = meta?.last_page || 1;
        let all = firstRes?.data?.payload?.data || [];

        for (let p = 2; p <= totalPages; p++) {
          const res = await axios.get(
            'https://api.dustipharma.tj:1212/api/v1/app/products/all',
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { page: p },
            }
          );
          const data = res?.data?.payload?.data || [];
          all = [...all, ...data];
        }

        all.sort((a, b) =>
          (a['Наименование'] || '').localeCompare(b['Наименование'] || '', 'ru', {
            sensitivity: 'base',
          })
        );

        setProducts(all);
      } catch (err) {
        console.error('Ошибка при загрузке всех продуктов:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAllProducts();
  }, [token]);

  const groupByFirstLetter = (list) => {
    const grouped = {};
    list.forEach((product) => {
      const name = product['Наименование'] || '';
      const firstLetter = name.trim().charAt(0).toUpperCase();
      const letter = /^[A-ZА-ЯЁ]/i.test(firstLetter) ? firstLetter : '#';
      if (!grouped[letter]) grouped[letter] = [];
      grouped[letter].push(product);
    });
    return grouped;
  };

  const visibleProducts = products.slice(0, visibleCount);
  const groupedProducts = groupByFirstLetter(visibleProducts);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 50);
  };

  return (
    <div className="AddProductsToCart_content">
      <div className="AddProductsToСarts">
        <OrderHeader />
      </div>

      <main className="products_mains">
        <h1>
          Прайс-лист <span className="colors">по алфавиту</span>
        </h1>

        {loading && <p>Загрузка всех продуктов...</p>}

        {!loading && Object.keys(groupedProducts).length > 0 && (
          <>
            {Object.keys(groupedProducts)
              .sort((a, b) => a.localeCompare(b, 'ru'))
              .map((letter) => (
                <div key={letter} className="alphabet-group">
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
                      {groupedProducts[letter].map((product) => {
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
                                  className='quantity-input'
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
                </div>
              ))}

            {visibleCount < products.length && (
              <div className="load-more-container">
                <button className="load-more-btn" onClick={handleLoadMore}>
                  Показать ещё ({products.length - visibleCount} осталось)
                </button>
              </div>
            )}
          </>
        )}

        {!loading && Object.keys(groupedProducts).length === 0 && (
          <p className="no-results-text">Нет доступных продуктов</p>
        )}
      </main>
    </div>
  );
}

export default PriceList;
