import React, { useState } from 'react';
import axios from 'axios';

function RegistrationPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/auth/forget-password',
        { login: phone }
      );

      // Предполагается, что сервер возвращает сообщение об успехе
      setMessage('Код подтверждения отправлен на номер телефона.');
    } catch (err) {
      console.error('Ошибка восстановления пароля:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ошибка подключения к серверу');
      }
    }
  };

  return (
    <div className="registration gap">
      <div className='logo_login margin_bottom'>
        <div className='logo_img'>
          <div className='login_logo'>
            <img src="./logo.svg" alt="logo"/>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Восстановление пароля</h1>
          <p>Введите номер телефона</p>
        </div>

        <div className="forms registration_forms">
          <div className="form">
            <label htmlFor="number_phone">
              Номер телефона
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              name="phone"
              required
            />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {message && <p style={{ color: 'green' }}>{message}</p>}

          <button type="submit">Отправить</button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationPage;
