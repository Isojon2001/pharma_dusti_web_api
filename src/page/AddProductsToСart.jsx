import React, { useState, useEffect } from 'react';
import { Search, Clock3, CircleCheck, X, Truck, Package } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CircularOrderStatus from '../components/CircularOrderStatus';

const STATUS_ORDER = [
  'Оформлено',
  'В обработке',
  'В сборке',
  'Готов к доставке',
  'В пути',
  'Доставлен',
];

const API_STATUS_TO_STEP_STATUS = {
  'Оформлено': 'Оформлено',
  'КОбработке': 'В обработке',
  'КСборке': 'В сборке',
  'ГотовКДоставке': 'Готов к доставке',
  'В пути': 'В пути',
  'Доставлен': 'Доставлен',
};

const STATUS_COLOR_MAP = {
  'Оформлено': 'color-green',
  'В обработке': 'color-yellow',
  'В сборке': 'color-orange',
  'Готов к доставке': 'color-blue',
  'В пути': 'color-purple',
  'Доставлен': 'color-bright-green',
};

const getCurrentStatusFromApi = (statusObj) => {
  if (!statusObj) return 'Оформлено';

  if (statusObj.Доставлен === 'Да') return 'Доставлен';
  if (statusObj.ГотовКДоставке === 'Да') return 'Готов к доставке';
  if (statusObj.КСборке === 'Да') return 'В сборке';
  if (statusObj.КОбработке === 'Да') return 'В обработке';
  
  return 'Оформлено';
};

function OrderStep({ icon, label, stepKey, currentStatus, isLast }) {
  const currentStep = API_STATUS_TO_STEP_STATUS[currentStatus] || 'Оформлено';
  const stepIndex = STATUS_ORDER.indexOf(stepKey);
  const currentIndex = STATUS_ORDER.indexOf(currentStep);
  const isReached = stepIndex <= currentIndex;
  const colorClass = isReached ? STATUS_COLOR_MAP[stepKey] : 'color-gray';

  return (
    <div className={`order-step ${colorClass}`}>
      <div className="order-step-icon">{icon}</div>
      <span className="order-step-label">{label}</span>
      {!isLast && <div className="order-step-line" />}
    </div>
  );
}

function AddProductsToCart() {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const [orderStatusById, setOrderStatusById] = useState(null);
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

  const handlePrevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banner.length) % banner.length);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const highlighted = text.replace(regex, '<mark class="highlight">$1</mark>');
    return highlighted;
  };

  const handleNextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banner.length);
  };

  useEffect(() => {
    if (!token) return;
    setBannerLoading(true);
    axios
      .get('https://api.dustipharma.tj:1212/api/v1/app/banners', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const banners = res?.data?.payload?.data || [];
        const activeBanners = banners.filter((banner) => banner.is_active);

        const enrichedBanners = activeBanners.map((banner) => ({
          ...banner,
          fullImageUrl: `https://api.dustipharma.tj:1212${banner.poster_path}`,
          fullFileUrl: `https://api.dustipharma.tj:1212${banner.file_path}`,
        }));

        setBanner(enrichedBanners);
      })
      .catch((err) => {
        console.error('Ошибка загрузки баннеров:', err);
        setBanner([]);
      })
      .finally(() => setBannerLoading(false));
  }, [token]);

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    if (!banner || banner.length === 0) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banner.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [banner]);

  useEffect(() => {
    if (!token) return;

    axios
      .get('https://api.dustipharma.tj:1212/api/v1/app/orders/customer', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(async (res) => {
        const orders = res?.data?.payload || [];
        if (orders.length === 0) {
          setActiveOrder(null);
          return;
        }

        const latestOrder = orders[0];

        try {
          const statusRes = await axios.get(
            `https://api.dustipharma.tj:1212/api/v1/app/orders/status/${latestOrder.id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const statusData = statusRes?.data?.payload?.status;
          
          const currentStatus = getCurrentStatusFromApi(statusData);

          setActiveOrder({
            ...latestOrder,
            status: currentStatus,
            statusData: statusData
          });

          console.log('Статус заказа:', {
            rawStatus: statusData,
            calculatedStatus: currentStatus
          });

        } catch (statusErr) {
          console.error('Ошибка при загрузке статуса по ID:', statusErr);
          setActiveOrder(latestOrder);
        }
      })
      .catch((err) => {
        console.error('Ошибка загрузки заказов пользователя:', err);
        setActiveOrder(null);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    axios
      .get('https://api.dustipharma.tj:1212/api/v1/app/categories/all', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const allCategories = res?.data?.payload?.data || [];
        setCategories(allCategories);
      })
      .catch((err) => {
        console.error('Ошибка загрузки категорий:', err);
        setCategories([]);
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
      size: 10
    };
    
    let nameQuery = searchTerm.trim();
    if (category !== 'products') {
      const selectedCategory = categories.find((cat) => cat.key === category);
      if (selectedCategory) {
        nameQuery = nameQuery ? `${nameQuery} ${selectedCategory.name}` : selectedCategory.name;
      }
    }
    if (nameQuery !== '') {
      params.name = nameQuery;
    }
    if (minSumma > 0) params.min_price = minSumma;
    if (maxSumma !== Infinity) params.max_price = maxSumma;
    
    console.log('Запрашиваем продукты с параметрами:', params);

    axios
      .get('https://api.dustipharma.tj:1212/api/v1/app/products/all', {
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

const loadMore = async () => {
  if (page >= meta.last_page || loading) return;
  const currentScroll = window.scrollY;
  setPage(prev => prev + 1);
  requestAnimationFrame(() => {
    setTimeout(() => {
      window.scrollTo({ top: currentScroll, behavior: 'instant' });
    }, 100);
  });
};


  const groupProductsByCode = (productsList) => {
    const grouped = {};

    productsList.forEach((product) => {
      const uniqueKey = `${product.Код || 'unknown'}-${product['Наименование']}-${product['Производитель']}`;

      if (!grouped[uniqueKey]) {
        grouped[uniqueKey] = [];
      }

      const formattedDate = formatDate(product['Срок']);

      const isDuplicate = grouped[uniqueKey].some(
        (p) => formatDate(p['Срок']) === formattedDate
      );

      if (!isDuplicate) {
        grouped[uniqueKey].push(product);
      }
    });

    for (const key in grouped) {
      grouped[key].sort((a, b) => {
        const dateA = a['Срок'] && a['Срок'] !== '0001-01-01T00:00:00Z' ? new Date(a['Срок']) : new Date(0);
        const dateB = b['Срок'] && b['Срок'] !== '0001-01-01T00:00:00Z' ? new Date(b['Срок']) : new Date(0);
        return dateA - dateB;
      });
    }

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
      <div className='AddProductsToСarts'>
      <OrderHeader />
      </div>
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
                      <td>
                        <strong
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(selectedProduct['Наименование'], searchTerm),
                          }}
                        />
                      </td>
                      <td>{selectedProduct['Производитель'] || 'Пусто'}</td>
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
                {activeOrder && activeOrder.status !== 'Доставлен' ? (
                  <CircularOrderStatus 
                    apiStatus={activeOrder.statusData}
                    orderId={activeOrder.id}
                    token={token}
                  />
                ) : (
                  <div className="no_active_order">
                    <h1>Нет активных заказов</h1>
                    <p>Сделайте новый заказ и здесь будет отображаться статус активного заказа</p>
                  </div>
                )}
              </div>
            </div>
            <div className='banners_products'>
              {bannerLoading ? (
                <div><p>Загрузка баннеров...</p></div>
              ) : banner && banner.length > 0 ? (
                <a
                  href={banner[currentBannerIndex].fullFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  <img
                    src={banner[currentBannerIndex].fullImageUrl}
                    alt={banner[currentBannerIndex].title || 'Баннер'}
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
                <div><p>Баннеры не найдены</p></div>
              )}
              <div className="banner-controls">
                <button onClick={handlePrevBanner}>&lt;</button>
                <button onClick={handleNextBanner}>&gt;</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AddProductsToCart;