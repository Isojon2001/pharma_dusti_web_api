import React, { useState, useEffect } from 'react';
import { Search, Clock3, CircleCheck, X, Truck, Package } from 'lucide-react';
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
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 6, total: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedProductByCode, setSelectedProductByCode] = useState({});
  const [banner, setBanner] = useState(null);
  const [bannerLoading, setBannerLoading] = useState(true);

  const showTable = searchTerm.trim() !== '' || summa.trim() !== '' || category !== 'products';

  useEffect(() => {
    if (!token) return;
    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/categories/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCategories(res?.data?.payload?.data || []))
      .catch((err) => console.error('Ошибка загрузки категорий:', err));
    setBannerLoading(true);
    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/banners', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const banners = res?.data?.payload?.data || [];
        console.log('Баннеры от API:', banners);
        
        const activeBanner = banners.find(banner => banner.is_active) || banners[0];
        
        if (activeBanner) {
          setBanner({
            ...activeBanner,
            fullImageUrl: `http://api.dustipharma.tj:1212${activeBanner.poster_path}`
          });
        } else {
          setBanner(null);
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки баннера:', err);
        setBanner(null);
      })
      .finally(() => setBannerLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/orders/customer', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const orders = res?.data?.payload || [];
        setActiveOrder(orders.length > 0 ? orders[0] : null);
      })
      .catch((err) => {
        console.error('Ошибка загрузки заказов пользователя:', err);
        setActiveOrder(null);
      });
  }, [token]);

  const parseSummaRange = (summaStr) => {
    const nums = summaStr.match(/\d+/g) || [];
    if (nums.length === 0) return [0, Infinity];
    if (nums.length === 1) return [0, Number(nums[0])];
    return [Number(nums[0]), Number(nums[1])];
  };

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    const [minSumma, maxSumma] = parseSummaRange(summa);

    const params = { 
      page,
      size: 50
    };
    if (searchTerm.trim() !== '') params.name = searchTerm.trim();
    if (category !== 'products') params.category = category;
    if (minSumma > 0) params.min_price = minSumma;
    if (maxSumma !== Infinity) params.max_price = maxSumma;

    axios
      .get('http://api.dustipharma.tj:1212/api/v1/app/products/all', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
      .then((res) => {
        const newProducts = res?.data?.payload?.data || [];
        const newMeta = res?.data?.payload?.meta || { current_page: 1, last_page: 10 };

        console.log(`Загружено ${newProducts.length} продуктов на странице ${page}, всего: ${newMeta.total}`);

        setMeta(newMeta);
        setProducts((prev) => (page === 1 ? newProducts : [...prev, ...newProducts]));

        const allProducts = page === 1 ? newProducts : [...products, ...newProducts];
        const grouped = groupProductsByCode(allProducts);
        
        const defaultSelected = {};
        for (const code in grouped) {
          defaultSelected[code] = grouped[code][0]?.id;
        }
        setSelectedProductByCode(defaultSelected);
      })
      .catch((err) => {
        console.error('Ошибка загрузки продуктов:', err);
        if (page === 1) {
          setProducts([]);
          setMeta({ current_page: 1, last_page: 10, total: 0 });
          setSelectedProductByCode({});
        }
      })
      .finally(() => setLoading(false));
  }, [token, searchTerm, category, summa, page]);

  const loadMore = () => {
    if (page < meta.last_page && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const groupProductsByCode = (productsList) => {
    const grouped = {};
    
    productsList.forEach((product) => {
      const uniqueKey = `${product.Код || 'unknown'}-${product['Наименование']}-${product['Производитель']}`;
      
      if (!grouped[uniqueKey]) {
        grouped[uniqueKey] = [product];
      } else {
        const existingProduct = grouped[uniqueKey][0];
        if (product['Срок'] !== existingProduct['Срок']) {
          grouped[uniqueKey].push(product);
        }
      }
    });

    for (const key in grouped) {
      grouped[key].sort((a, b) => {
        const dateA = a['Срок'] && a['Срок'] !== '0001-01-01T00:00:00Z' ? new Date(a['Срок']) : new Date(0);
        const dateB = b['Срок'] && b['Срок'] !== '0001-01-01T00:00:00Z' ? new Date(b['Срок']) : new Date(0);
        return dateA - dateB;
      });
    }

    console.log('Сгруппированные продукты:', Object.keys(grouped).length, grouped);
    return grouped;
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0001-01-01T00:00:00Z') return '—';
    return new Date(dateStr).toLocaleDateString('ru-RU');
  };

  const handleQuantityChange = (code, value) => {
    const quantity = Math.max(1, parseInt(value) || 1);
    setQuantities((prev) => ({ ...prev, [code]: quantity }));
  };

  const handleAddToCart = (code) => {
    const productGroup = groupedProducts[code];
    if (!productGroup) return;

    const selectedId = selectedProductByCode[code];
    const selectedProduct = productGroup.find((p) => p.id === selectedId) || productGroup[0];
    const quantity = quantities[code] || 1;

    addToCart({ ...selectedProduct, quantity });
    setModalProductName(selectedProduct['Наименование'] || 'Товар');
    setShowModal(true);
    setAddedItems((prev) => ({ ...prev, [code]: true }));

    setTimeout(() => setShowModal(false), 2500);
  };

  const groupedProducts = groupProductsByCode(products);

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
            <div className="search-input-wrapper">
              <label htmlFor="products_search">Найти продукт</label>
              <input
                type="text"
                id="products_search"
                placeholder="Введите название продукта"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
              {searchTerm && (
                <button
                  className="clear-search-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setPage(1);
                  }}
                  aria-label="Очистить поиск"
                >
                  <X strokeWidth={3} />
                </button>
              )}
            </div>
          </div>

          <div className="line_cart"></div>

          <div className="products_category_block">
            <label htmlFor="products_category">Категории</label>
            <select
              id="products_category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
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
            <label htmlFor="products_summa">МНН</label>
            <input
              type="text"
              id="products_summa"
              placeholder="Введите название"
              value={summa}
              onChange={(e) => {
                setSumma(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="search_cart">
            <Search stroke="#FFF" />
          </div>
        </div>

        {loading && page === 1 && <p>Загрузка...</p>}

        {showTable && !loading && Object.keys(groupedProducts).length > 0 && (
          <>
            <div className="search-results-info">
              <p>Найдено продуктов: {meta.total}</p>
            </div>
            
            <table className="products_table">
              <thead>
                <tr>
                  <th className='products_names'>Название продукта</th>
                  <th>Производитель</th>
                  <th>Срок годности</th>
                  <th>Цена</th>
                  <th>Кол-во</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedProducts).map(([code, productGroup], index) => {
                  const selectedId = selectedProductByCode[code] || productGroup[0].id;
                  const selectedProduct = productGroup.find((p) => p.id === selectedId) || productGroup[0];
                  const quantity = quantities[code] || 1;
                  const isAdded = addedItems[code];

                  return (
                    <tr key={code} className={index % 2 === 0 ? 'even-row' : 'odd-row'}>
                      <td><strong>{selectedProduct['Наименование']}</strong></td>
                      <td>{selectedProduct['Производитель'] || 'Неизвестен'}</td>
                      <td>
                        {productGroup.length > 1 ? (
                          <select
                            value={selectedId}
                            onChange={(e) =>
                              setSelectedProductByCode((prev) => ({
                                ...prev,
                                [code]: e.target.value,
                              }))
                            }
                            disabled={isAdded}
                          >
                            {productGroup.map((product) => (
                              <option key={product.id} value={product.id}>
                                {formatDate(product['Срок'])}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{formatDate(productGroup[0]['Срок'])}</span>
                        )}
                      </td>
                      <td>{selectedProduct['Цена']} сом</td>
                      <td>
                        <div className="quantity-wrapper">
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(code, quantity - 1)}
                            disabled={quantity <= 1 || isAdded}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(code, e.target.value)}
                            disabled={isAdded}
                            className="quantity-input"
                          />
                          <button
                            type="button"
                            className="quantity-btn"
                            onClick={() => handleQuantityChange(code, quantity + 1)}
                            disabled={isAdded}
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
                          onClick={() => handleAddToCart(code)}
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

            {page < meta.last_page && (
              <div className="load-more-container">
                <button 
                  className="load-more-btn" 
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? 'Загрузка...' : `Показать ещё (${meta.total - Object.keys(groupedProducts).length} из ${meta.total})`}
                </button>
              </div>
            )}
          </>
        )}

        {showTable && !loading && Object.keys(groupedProducts).length === 0 && (
          <p className="no-results-text">Продукты не найдены</p>
        )}

        {!showTable && !loading && (
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
                    <div className='active_order'>
                      <h1>Код заказа:</h1>
                      <h2>{activeOrder?.code || '—'}</h2>
                    </div>

                    <div className="order_info">
                      <OrderStep icon={<CircleCheck />} label="Оформлено" stepKey="issued" currentStatus={activeOrder?.status} isLast={false} />
                      <OrderStep icon={<Clock3 />} label="В обработке" stepKey="pending" currentStatus={activeOrder?.status} isLast={false} />
                      <OrderStep icon={<Package />} label="В процессе сборки" stepKey="assembled" currentStatus={activeOrder?.status} isLast={false} />
                      <OrderStep icon={<Truck />} label="В процессе доставки" stepKey="delivered" currentStatus={activeOrder?.status} isLast={false} />
                      <OrderStep icon={<CircleCheck />} label="Доставлен" stepKey="completed" currentStatus={activeOrder?.status} isLast={true} />
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
              {bannerLoading ? (
                <div>
                  <p>Загрузка баннера...</p>
                </div>
              ) : banner ? (
                <a 
                  href="http://api.dustipharma.tj:1212/api/uploads/a52be164-3b1c-4123-976d-29a1102f77ce.pdf" 
                  download 
                  rel="noopener noreferrer"
                >
                  <img 
                    src={banner.fullImageUrl} 
                    alt={banner.title || 'Баннер'} 
                    width="580" 
                    height="290" 
                    style={{ borderRadius: '16px', cursor: 'pointer' }}
                    onError={(e) => {
                      console.error('Ошибка загрузки изображения баннера');
                      e.target.style.display = 'none';
                    }}
                    crossOrigin="anonymous"
                  />
                </a>
              ) : (
                <div>
                  <p>Баннер не найден</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function OrderStep({ icon, label, stepKey, currentStatus, isLast }) {
  const statusOrder = ['issued', 'pending', 'assembled', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus?.toLowerCase());
  const stepIndex = statusOrder.indexOf(stepKey);

  const isReached = stepIndex <= currentIndex;

  const colorClassMap = {
    issued: 'color-green',
    pending: 'color-yellow',
    assembled: 'color-orange',
    delivered: 'color-blue',
    completed: 'color-bright-green',
  };

  const stepClass = `
    order-step 
    ${isReached ? colorClassMap[stepKey] : 'color-gray'}
  `.trim();

  return (
    <div className={stepClass}>
      <div className="order-step-icon">{icon}</div>
      <span className="order-step-label">{label}</span>
      {!isLast && <div className="order-step-line" />}
    </div>
  );
}

export default AddProductsToCart;