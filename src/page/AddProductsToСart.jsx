import React, { useState, useEffect } from 'react';
import { Search, Clock3, CircleCheck, Truck, Package } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

function AddProductsToCart() {
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [showModal, setShowModal] = useState(false);
  const [modalProductName, setModalProductName] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('products');
  const [summa, setSumma] = useState('');
  const [quantities, setQuantities] = useState({});
  const [addedItems, setAddedItems] = useState({});

  useEffect(() => {
    if (!token) return;

    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/products/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setProducts(res?.data?.payload?.data || []))
      .catch((err) => console.error('Ошибка загрузки продуктов:', err));

    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/categories/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res?.data?.payload?.data || []))
      .catch((err) => console.error('Ошибка загрузки категорий:', err));

    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/orders/customer', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const orders = res?.data?.payload || [];
        if (orders.length > 0) {
          const active = orders[orders.length - 1];
          setActiveOrder(active);
        } else {
          setActiveOrder(null);
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки заказов пользователя:', err);
        setActiveOrder(null);
      });
  }, [token]);

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const getFilteredProducts = () => {
    const term = searchTerm.toLowerCase();
    const [min = 0, max = Infinity] = (summa.match(/\d+/g) || []).map(Number);

    return products.filter((product) => {
      const name = product['Наименование']?.toLowerCase() || '';
      const price = parseFloat(product['Цена']) || 0;
      const productCategoryKey = product.category || product.key || '';

      return (
        name.includes(term) &&
        (category === 'products' || productCategoryKey === category) &&
        price >= min &&
        price <= max
      );
    });
  };

  const handleQuantityChange = (productId, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({
      ...prev,
      [productId]: quantity,
    }));
  };

  const handleAddToCart = (product) => {
    const productKey = product.id || product['Код'] || product['Артикул'];
    if (!productKey) {
      console.warn('Пропущен уникальный ключ товара:', product);
      return;
    }

    const quantity = quantities[productKey] || 1;

    addToCart({ ...product, id: productKey, quantity });
    setModalProductName(product['Наименование'] || 'Товар');
    setShowModal(true);
    setAddedItems((prev) => ({ ...prev, [productKey]: true }));

    setTimeout(() => setShowModal(false), 2500);
  };

  const filteredProducts = getFilteredProducts();
  const showTable = searchTerm.trim() !== '' || summa.trim() !== '';

  return (
    <div className="AddProductsToCart_content">
      <OrderHeader />
      {showModal && (
        <div className="cart-modal">
          <div className="cart-modal-content">
            <p>
              <strong>{modalProductName}</strong> добавлен в корзину
            </p>
          </div>
        </div>
      )}

      <main className="products_main">
        <h1>
          Найдите продукты и добавьте в <span className="colors">корзину</span>
        </h1>

        <div className="products_name">
          <div className="products_info">
            <label htmlFor="products_search">Найти продукт</label>
            <input
              type="text"
              id="products_search"
              placeholder="Введите название продукта"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="line_cart"></div>

          <div className="products_category_block">
            <label htmlFor="products_category">Категории</label>
            <select
              id="products_category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="products">Все</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.key}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="line_cart"></div>

          <div className="summa_block">
            <label htmlFor="products_summa">Сумма</label>
            <input
              type="text"
              id="products_summa"
              placeholder="0 сом – 5000 сом"
              value={summa}
              onChange={(e) => setSumma(e.target.value)}
            />
          </div>

          <div className="search_cart">
            <Search stroke="#FFF" />
          </div>
        </div>

        {showTable && (
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
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const productKey = product.id || product['Код'] || product['Артикул'];
                  return (
                    <tr key={productKey || index} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td><strong>{product['Наименование']}</strong></td>
                      <td>{product['Производитель'] || 'Неизвестен'}</td>
                      <td>{formatDate(product['Срок'])}</td>
                      <td>{product['Цена']} сом</td>
                      <td>
                        <div className="quantity-wrapper">
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() =>
                            handleQuantityChange(productKey, (quantities[productKey] || 1) - 1)
                          }
                          disabled={quantities[productKey] <= 1 || addedItems[productKey]}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={quantities[productKey] || 1}
                          onChange={(e) => handleQuantityChange(productKey, e.target.value)}
                          disabled={addedItems[productKey]}
                          className="quantity-input"
                        />
                        <button
                          type="button"
                          className="quantity-btn"
                          onClick={() =>
                            handleQuantityChange(productKey, (quantities[productKey] || 1) + 1)
                          }
                          disabled={addedItems[productKey]}
                        >
                          +
                        </button>
                      </div>
                      </td>
                      <td>
                        <button
                          className={`add-to-cart-btn ${addedItems[productKey] ? 'added' : ''}`}
                          onClick={() => handleAddToCart(product)}
                          disabled={addedItems[productKey]}
                        >
                          {addedItems[productKey] ? 'Добавлено' : 'Добавить в корзину'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-results">
                    Нет совпадений
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {!showTable && (
          <div className="order">
            <div className="orders">
              <div className="ored_active">
                <h1>Активный заказ</h1>
                <Link to={`/history-order`}>
                  <p>История заказов</p>
                </Link>
              </div>
              <div className="order_bg">
                {activeOrder ? (
                  <>
                    <div>
                      <h2>{activeOrder?.code || '—'}</h2>
                      <p>
                        Статус: <strong>{activeOrder?.status || 'Неизвестен'}</strong>
                      </p>
                      <p>
                        Ожидаемое время доставки: <span>{activeOrder?.delivery_time || 'Неизвестен'}</span>
                      </p>
                      <p>
                        Курьер: <span>{activeOrder?.courier || 'Неизвестен'}</span>
                      </p>
                    </div>

                    <div className="order_info">
                      <OrderStep icon={<Clock3 />} label="В обработке" stepKey="processing" currentStatus={activeOrder?.status} />
                      <OrderStep icon={<Truck />} label="Заказ собран" stepKey="assembled" currentStatus={activeOrder?.status} />
                      <OrderStep icon={<Package />} label="Доставлено" stepKey="delivered" currentStatus={activeOrder?.status} />
                      <OrderStep icon={<CircleCheck />} label="Выполнено" stepKey="completed" currentStatus={activeOrder?.status} />
                    </div>
                  </>
                ) : (
                  <div className="no_active_order">
                    <h1>Нет активных заказов</h1>
                    <p>Сделайте новый заказ и здесь будет отображаться статус активного заказа</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <img src="./Frame 2131328827.png" width="580" height="290" alt="cart" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderStep({ icon, label, stepKey, currentStatus }) {
  const statusOrder = ['processing', 'assembled', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus?.toLowerCase());
  const stepIndex = statusOrder.indexOf(stepKey);

  let stepClass = 'step-pending';
  if (stepIndex < currentIndex) stepClass = 'step-done';
  else if (stepIndex === currentIndex) stepClass = 'step-active';

  return (
    <div className={`oredrs_info ${stepClass}`}>
      <div className="oredrs_bg">{icon}</div>
      <p>{label}</p>
    </div>
  );
}

export default AddProductsToCart;
