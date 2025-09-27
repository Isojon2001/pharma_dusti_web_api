import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegistrationPage() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const normalizePhone = (input) => input.replace(/\D/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedPhone = normalizePhone(phone);
    if (!cleanedPhone) {
      setError('Введите корректный номер телефона');
      return;
    }

    try {
      await axios.post('http://api.dustipharma.tj:1212/api/v1/app/auth/forget-password', {
        phone: cleanedPhone,
      });

      localStorage.setItem('userPhone', cleanedPhone);
      navigate('/setPassword');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки кода. Попробуйте позже.');
    }
  };

  return (
    <div className="registration gap">
      <div className="logo_login margin_bottom">
        <div className="logo_img">
          <img src="/logo.svg" alt="logo" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="forms registration_forms">
        <div className="registration_paragraph">
          <h1>Зарегистрироваться</h1>
          <p>Мы отправим код подтверждения для сброса пароля</p>
        </div>

        <div className="form">
          <label>Номер телефона</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <button type="submit" disabled={!phone.trim()}>
          Отправить код
        </button>
      </form>
    </div>
  );
}

export default RegistrationPage;
