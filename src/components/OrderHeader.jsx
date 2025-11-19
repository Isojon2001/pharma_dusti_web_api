import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import logo from '../assets/logo.svg';
import '../index.css';

function OrderHeader() {
  const { cartCount } = useCart();
  const [isHovering, setIsHovering] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const { token, logout } = useAuth();

  const API_URL = 'https://api.dustipharma.tj:1212/api/v1/app/profile/users';

  useEffect(() => {
    if (!token || userData || loading || !isHovering) return;

    setLoading(true);
    fetch(API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Ошибка при получении данных');
        return res.json();
      })
      .then((data) => {
        if (data?.payload?.length > 0) {
          setUserData(data.payload[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Ошибка загрузки профиля');
      })
      .finally(() => setLoading(false));
  }, [isHovering, token, userData, loading]);
  const hiddenPaths = ['/order-basket', '/price-list'];

  return (
    <div className="AddProductsToСart">
      <div className="logo_login">
        {!hiddenPaths.includes(location.pathname) && (
          <div className="logo_img">
            <Link to="/add-products-to-cart">
              <img src={logo} alt="logo" />
            </Link>
          </div>
        )}
      </div>

      <div className="products_profile">
        <Link to="/history-order" className="products_story">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="https://www.w3.org/2000/svg">
          <path d="M15 1.33989C16.5083 2.21075 17.7629 3.46042 18.6398 4.96519C19.5167 6.46997 19.9854 8.17766 19.9994 9.91923C20.0135 11.6608 19.5725 13.3758 18.72 14.8946C17.8676 16.4133 16.6332 17.6831 15.1392 18.5782C13.6452 19.4733 11.9434 19.9627 10.2021 19.998C8.46083 20.0332 6.74055 19.6131 5.21155 18.7791C3.68256 17.9452 2.39787 16.7264 1.48467 15.2434C0.571462 13.7604 0.0614093 12.0646 0.00500011 10.3239L0 9.99989L0.00500011 9.67589C0.0610032 7.94888 0.563548 6.26585 1.46364 4.79089C2.36373 3.31592 3.63065 2.09934 5.14089 1.25977C6.65113 0.420205 8.35315 -0.0137108 10.081 0.000330246C11.8089 0.0143713 13.5036 0.47589 15 1.33989ZM10 3.99989C9.75507 3.99992 9.51866 4.08985 9.33563 4.25261C9.15259 4.41537 9.03566 4.63964 9.007 4.88289L9 4.99989V9.99989L9.009 10.1309C9.0318 10.3044 9.09973 10.4689 9.206 10.6079L9.293 10.7079L12.293 13.7079L12.387 13.7899C12.5624 13.926 12.778 13.9998 13 13.9998C13.222 13.9998 13.4376 13.926 13.613 13.7899L13.707 13.7069L13.79 13.6129C13.9261 13.4375 13.9999 13.2219 13.9999 12.9999C13.9999 12.7779 13.9261 12.5623 13.79 12.3869L13.707 12.2929L11 9.58489V4.99989L10.993 4.88289C10.9643 4.63964 10.8474 4.41537 10.6644 4.25261C10.4813 4.08985 10.2449 3.99992 10 3.99989Z" fill="#0F7372"/>
          </svg>
          <p>История заказов</p>
        </Link>

              <Link to="/price-list" className="products_cart">
                  <FileText stroke="#0F7372"/>
            </Link>
              <Link to="/order-basket" className="products_cart">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="https://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M1 0C0.734784 0 0.48043 0.105357 0.292893 0.292893C0.105357 0.48043 0 0.734783 0 1C0 1.26522 0.105357 1.51957 0.292893 1.70711C0.48043 1.89464 0.734784 2 1 2H2.074L2.234 4.077L2.85 12.094C2.91088 12.8844 3.28216 13.6186 3.8827 14.1362C4.48325 14.6537 5.26424 14.9125 6.055 14.856L16.41 14.116C17.1097 14.066 17.7698 13.7725 18.2755 13.2863C18.7812 12.8002 19.1005 12.1522 19.178 11.455L19.994 4.11C20.0095 3.97024 19.9953 3.8288 19.9524 3.69489C19.9095 3.56099 19.8388 3.43764 19.745 3.33289C19.6512 3.22814 19.5364 3.14435 19.408 3.08699C19.2796 3.02963 19.1406 2.99999 19 3H4.157L3.997 0.923C3.97761 0.671866 3.86415 0.437301 3.67932 0.266185C3.49448 0.0950692 3.25188 7.83172e-06 3 0H1ZM5 18.5C5 18.1022 5.15804 17.7206 5.43934 17.4393C5.72064 17.158 6.10218 17 6.5 17H6.51C6.90782 17 7.28936 17.158 7.57066 17.4393C7.85196 17.7206 8.01 18.1022 8.01 18.5V18.51C8.01 18.9078 7.85196 19.2894 7.57066 19.5707C7.28936 19.852 6.90782 20.01 6.51 20.01H6.5C6.10218 20.01 5.72064 19.852 5.43934 19.5707C5.15804 19.2894 5 18.9078 5 18.51V18.5ZM15.5 17C15.1022 17 14.7206 17.158 14.4393 17.4393C14.158 17.7206 14 18.1022 14 18.5V18.51C14 18.9078 14.158 19.2894 14.4393 19.5707C14.7206 19.852 15.1022 20.01 15.5 20.01H15.51C15.9078 20.01 16.2894 19.852 16.5707 19.5707C16.852 19.2894 17.01 18.9078 17.01 18.51V18.5C17.01 18.1022 16.852 17.7206 16.5707 17.4393C16.2894 17.158 15.9078 17 15.51 17H15.5Z" fill="#0F7372"/>
              </svg>

              {cartCount > 0 && (
                <div className="cart-count-badge">
                  {cartCount}
                </div>
              )}
            </Link>
        <div
          className="products_user"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 10C14.2091 10 16 8.20914 16 6C16 3.79086 14.2091 2 12 2C9.79086 2 8 3.79086 8 6C8 8.20914 9.79086 10 12 10Z" fill="#0F7372" />
            <path d="M20 17.5C20 19.985 20 22 12 22C4 22 4 19.985 4 17.5C4 15.015 7.582 13 12 13C16.418 13 20 15.015 20 17.5Z" fill="#0F7372" />
          </svg>

          {isHovering && (
            <div
              className="user-modal"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="logo_moadl">
                <img src={logo} width="50" height="50" alt="logo" />
                <div>
                  <h2 className="user-modal__title">
                    {loading
                      ? 'Загрузка...'
                      : userData?.Наименование || 'Имя не указано'}
                  </h2>
                  <p>{userData?.Фирма || 'Регион не указан'}</p>
                </div>
              </div>

              {error && <p style={{ color: 'red' }}>{error}</p>}

              <div className="user-modal__field">
                <button className="user-modal__link" onClick={() => window.location.href = './Reporting'}>
                  Отчетность
                </button>
              </div>

              <div className="user-modal__field">
                <button className="user-modal__link" onClick={() => window.location.href = './profile-order'}>
                  Детали профиля
                </button>
              </div>

              <div className="user-modal__field">
                <button className="user-modal__link" onClick={() => window.location.href = 'tel:+992981305050'}>
                  Отправить отзыв
                </button>
              </div>

              <div className="modal_line"></div>
              <div><p>Свяжитесь с нами</p></div>
              <div className="user-modal__field">
                  <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="https://www.w3.org/2000/svg">
                  <path d="M10 0.5C4.48 0.5 0 4.98 0 10.5C0 16.02 4.48 20.5 10 20.5C15.52 20.5 20 16.02 20 10.5C20 4.98 15.52 0.5 10 0.5ZM14.64 7.3C14.49 8.88 13.84 12.72 13.51 14.49C13.37 15.24 13.09 15.49 12.83 15.52C12.25 15.57 11.81 15.14 11.25 14.77C10.37 14.19 9.87 13.83 9.02 13.27C8.03 12.62 8.67 12.26 9.24 11.68C9.39 11.53 11.95 9.2 12 8.99C12.0069 8.95819 12.006 8.92517 11.9973 8.8938C11.9886 8.86244 11.9724 8.83367 11.95 8.81C11.89 8.76 11.81 8.78 11.74 8.79C11.65 8.81 10.25 9.74 7.52 11.58C7.12 11.85 6.76 11.99 6.44 11.98C6.08 11.97 5.4 11.78 4.89 11.61C4.26 11.41 3.77 11.3 3.81 10.95C3.83 10.77 4.08 10.59 4.55 10.4C7.47 9.13 9.41 8.29 10.38 7.89C13.16 6.73 13.73 6.53 14.11 6.53C14.19 6.53 14.38 6.55 14.5 6.65C14.6 6.73 14.63 6.84 14.64 6.92C14.63 6.98 14.65 7.16 14.64 7.3Z" fill="#858585"/>
                  </svg>
                <button className="user-modal__link" onClick={() => window.open('https://t.me/Dustipharma', '_blank')}>
                  @Dustipharma
                </button>
              </div>
              <div className="user-modal__field">
                  <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="https://www.w3.org/2000/svg">
                  <path d="M3.62 8.29C5.06 11.12 7.38 13.43 10.21 14.88L12.41 12.68C12.68 12.41 13.08 12.32 13.43 12.44C14.55 12.81 15.76 13.01 17 13.01C17.55 13.01 18 13.46 18 14.01V17.5C18 18.05 17.55 18.5 17 18.5C7.61 18.5 0 10.89 0 1.5C0 0.95 0.45 0.5 1 0.5H4.5C5.05 0.5 5.5 0.95 5.5 1.5C5.5 2.75 5.7 3.95 6.07 5.07C6.18 5.42 6.1 5.81 5.82 6.09L3.62 8.29Z" fill="#858585"/>
                  </svg>
                <button className="user-modal__link" onClick={() => window.location.href = 'tel:+992981305050'}>
                  +992 98 130 5050
                </button>
              </div>
              <div className="user-modal__field">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20C8.23277 20.003 6.4966 19.5353 4.97002 18.645L0.00401546 20L1.35602 15.032C0.464974 13.5049 -0.00308163 11.768 1.52687e-05 10C1.52687e-05 4.477 4.47702 0 10 0ZM6.59202 5.3L6.39201 5.308C6.26271 5.31691 6.13636 5.35087 6.02002 5.408C5.91159 5.46951 5.81258 5.5463 5.72602 5.636C5.60602 5.749 5.53802 5.847 5.46502 5.942C5.09514 6.4229 4.89599 7.01331 4.89902 7.62C4.90102 8.11 5.02902 8.587 5.22902 9.033C5.63802 9.935 6.31102 10.89 7.19902 11.775C7.41302 11.988 7.62302 12.202 7.84902 12.401C8.95245 13.3724 10.2673 14.073 11.689 14.447L12.257 14.534C12.442 14.544 12.627 14.53 12.813 14.521C13.1042 14.5056 13.3885 14.4268 13.646 14.29C13.7769 14.2223 13.9047 14.1489 14.029 14.07C14.029 14.07 14.0714 14.0413 14.154 13.98C14.289 13.88 14.372 13.809 14.484 13.692C14.568 13.6053 14.638 13.5047 14.694 13.39C14.772 13.227 14.85 12.916 14.882 12.657C14.906 12.459 14.899 12.351 14.896 12.284C14.892 12.177 14.803 12.066 14.706 12.019L14.124 11.758C14.124 11.758 13.254 11.379 12.722 11.137C12.6663 11.1128 12.6067 11.0989 12.546 11.096C12.4776 11.0888 12.4084 11.0965 12.3432 11.1184C12.278 11.1403 12.2182 11.176 12.168 11.223C12.163 11.221 12.096 11.278 11.373 12.154C11.3315 12.2098 11.2744 12.2519 11.2088 12.2751C11.1433 12.2982 11.0723 12.3013 11.005 12.284C10.9398 12.2666 10.876 12.2446 10.814 12.218C10.69 12.166 10.647 12.146 10.562 12.11C9.98789 11.8599 9.45646 11.5215 8.98702 11.107C8.86102 10.997 8.74402 10.877 8.62402 10.761C8.23063 10.3842 7.88777 9.95799 7.60401 9.493L7.54501 9.398C7.50328 9.3338 7.46905 9.26501 7.44302 9.193C7.40502 9.046 7.50402 8.928 7.50402 8.928C7.50402 8.928 7.74702 8.662 7.86002 8.518C7.97002 8.378 8.06301 8.242 8.12302 8.145C8.24102 7.955 8.27802 7.76 8.21602 7.609C7.93602 6.925 7.64668 6.24467 7.34802 5.568C7.28902 5.434 7.11402 5.338 6.95502 5.319C6.90102 5.31233 6.84701 5.307 6.79302 5.303C6.65874 5.2953 6.52411 5.29664 6.39002 5.307L6.59202 5.3Z" fill="#858585"/>
                  </svg>
                <button className="user-modal__link" onClick={() => window.open('https://wa.me/992981305050', '_blank')}>
                  WhatsApp: +992 98 130 5050
                </button>
              </div>
              <div className="modal_line"></div>

              <div className="user-modal__actions">
                <button onClick={() => {
                  logout();
                  window.location.href = '/';
                }}>Выйти</button>
                <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="https://www.w3.org/2000/svg">
                  <path d="M14.1667 6.33333L12.9917 7.50833L15.1417 9.66667H6.66675V11.3333H15.1417L12.9917 13.4833L14.1667 14.6667L18.3334 10.5M3.33341 4.66667H10.0001V3H3.33341C2.41675 3 1.66675 3.75 1.66675 4.66667V16.3333C1.66675 17.25 2.41675 18 3.33341 18H10.0001V16.3333H3.33341V4.66667Z" fill="#4D4D4D"/>
                  </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderHeader;
