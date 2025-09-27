import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../index.css';

function RegistrationPage() {
  const [phone, setPhone] = useState('+992');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const normalizePhone = (input) => {
    const digits = input.replace(/\D/g, '');
    return '+992' + digits.replace(/^992/, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setShowModal(false);

    if (!phone.trim() || phone.trim() === '+992') {
      return showErrorModal('Пожалуйста, введите номер телефона');
    }

    const cleanedPhone = normalizePhone(phone);

    try {
      await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/auth/forget-password',
        { phone: cleanedPhone }
      );

      localStorage.setItem('userPhone', cleanedPhone);
      setMessage('Код подтверждения отправлен на номер телефона.');

      navigate('/examination');
    } catch (err) {
      console.error('Ошибка отправки:', err);

      if (err.response?.status === 404) {
        showErrorModal('Номер не найден в системе');
      } else if (typeof err.response?.data === 'string') {
        showErrorModal(err.response.data);
      } else {
        showErrorModal('Ошибка сервера. Повторите попытку позже.');
      }
    }
  };

  const showErrorModal = (msg) => {
    setError(msg);
    setShowModal(true);

    setTimeout(() => {
      setShowModal(false);
      setError('');
    }, 4000);
  };

  return (
    <div className="registration gap">
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>{error}</h2>
            <p>Обратитесь в техподдержку Дусти Фарма</p>

            <div className="user-modal__field">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10 0.5C4.48 0.5 0 4.98 0 10.5C0 16.02 4.48 20.5 10 20.5C15.52 20.5 20 16.02 20 10.5C20 4.98 15.52 0.5 10 0.5ZM14.64 7.3C14.49 8.88 13.84 12.72 13.51 14.49C13.37 15.24 13.09 15.49 12.83 15.52C12.25 15.57 11.81 15.14 11.25 14.77C10.37 14.19 9.87 13.83 9.02 13.27C8.03 12.62 8.67 12.26 9.24 11.68C9.39 11.53 11.95 9.2 12 8.99C12.0069 8.95819 12.006 8.92517 11.9973 8.8938C11.9886 8.86244 11.9724 8.83367 11.95 8.81C11.89 8.76 11.81 8.78 11.74 8.79C11.65 8.81 10.25 9.74 7.52 11.58C7.12 11.85 6.76 11.99 6.44 11.98C6.08 11.97 5.4 11.78 4.89 11.61C4.26 11.41 3.77 11.3 3.81 10.95C3.83 10.77 4.08 10.59 4.55 10.4C7.47 9.13 9.41 8.29 10.38 7.89C13.16 6.73 13.73 6.53 14.11 6.53C14.19 6.53 14.38 6.55 14.5 6.65C14.6 6.73 14.63 6.84 14.64 6.92C14.63 6.98 14.65 7.16 14.64 7.3Z" fill="#858585"/> 
              </svg>
              <button className="user-modal__link" onClick={() => window.open('https://t.me/Dustipharma', '_blank')}>
                @Dustipharma
              </button>
            </div>

            <div className="user-modal__field">
              <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M3.62 8.29C5.06 11.12 7.38 13.43 10.21 14.88L12.41 12.68C12.68 12.41 13.08 12.32 13.43 12.44C14.55 12.81 15.76 13.01 17 13.01C17.55 13.01 18 13.46 18 14.01V17.5C18 18.05 17.55 18.5 17 18.5C7.61 18.5 0 10.89 0 1.5C0 0.95 0.45 0.5 1 0.5H4.5C5.05 0.5 5.5 0.95 5.5 1.5C5.5 2.75 5.7 3.95 6.07 5.07C6.18 5.42 6.1 5.81 5.82 6.09L3.62 8.29Z" fill="#858585"/> 
              </svg>
              <button className="user-modal__link" onClick={() => window.location.href = 'tel:+992981305050'}>
                +992 98 130 5050
              </button>
            </div>

            <div className="user-modal__field">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M10 0.5C4.48 0.5 0 4.98 0 10.5C0 16.02 4.48 20.5 10 20.5C15.52 20.5 20 16.02 20 10.5C20 4.98 15.52 0.5 10 0.5ZM14.64 7.3C14.49 8.88 13.84 12.72 13.51 14.49C13.37 15.24 13.09 15.49 12.83 15.52C12.25 15.57 11.81 15.14 11.25 14.77C10.37 14.19 9.87 13.83 9.02 13.27C8.03 12.62 8.67 12.26 9.24 11.68C9.39 11.53 11.95 9.2 12 8.99C12.0069 8.95819 12.006 8.92517 11.9973 8.8938C11.9886 8.86244 11.9724 8.83367 11.95 8.81C11.89 8.76 11.81 8.78 11.74 8.79C11.65 8.81 10.25 9.74 7.52 11.58C7.12 11.85 6.76 11.99 6.44 11.98C6.08 11.97 5.4 11.78 4.89 11.61C4.26 11.41 3.77 11.3 3.81 10.95C3.83 10.77 4.08 10.59 4.55 10.4C7.47 9.13 9.41 8.29 10.38 7.89C13.16 6.73 13.73 6.53 14.11 6.53C14.19 6.53 14.38 6.55 14.5 6.65C14.6 6.73 14.63 6.84 14.64 6.92C14.63 6.98 14.65 7.16 14.64 7.3Z" fill="#858585"/> 
              </svg>
              <button className="user-modal__link" onClick={() => window.open('https://wa.me/992981305050', '_blank')}>
                WhatsApp: +992 98 130 5050
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Логотип */}
      <div className='logo_login margin_bottom'>
        <div className='logo_img'>
          <div className='login_logo'>
            <img src="./logo.svg" alt="logo" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Зарегистрироваться</h1>
          <p>Введите номер телефона</p>
        </div>

        <div className="forms registration_forms">
          <div className="form">
            <label htmlFor="number_phone">Номер телефона</label>
            <input
              type="tel"
              id="number_phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+992xxxxxx"
              required
            />
          </div>

          {message && <p style={{ color: 'green' }}>{message}</p>}

          <button type="submit">Отправить</button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationPage;
