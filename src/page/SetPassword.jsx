import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: loginByToken } = useAuth();

  const phone = localStorage.getItem('userPhone');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!phone) {
      setError('Номер телефона не найден. Попробуйте сначала.');
      return;
    }

    try {
      const response = await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/auth/set-password',
        { phone, password }
      );

      const { token, ...user } = response.data.payload || {};

      if (!token || !user) {
        setError('Некорректный ответ от сервера');
        return;
      }

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      loginByToken(user, token);
      navigate('/dashboard');

    } catch (err) {
      console.error('Ошибка при установке пароля:', err);
      if (err.response?.status === 400) {
        setError(err.response.data.message || 'Некорректные данные');
      } else {
        setError('Ошибка подключения к серверу');
      }
    }
  };

  const isDisabled = !password || !confirmPassword || password !== confirmPassword;

  return (
    <div className="registration gap">
      <div className="logo_login margin_bottom">
        <div className="logo_img">
          <img src="/logo.svg" alt="logo" />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Установите пароль</h1>
          <p>Создайте новый пароль для входа</p>
        </div>

        <div className="forms registration_forms">

          {/* Новый пароль */}
          <div className="form eyes">
            <label>Новый пароль</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowPassword(prev => !prev)}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="form eyes">
            <label>Подтвердите пароль</label>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span onClick={() => setShowConfirm(prev => !prev)}>
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          <button type="submit" disabled={isDisabled}>
            Установить пароль
          </button>
        </div>
      </form>
    </div>
  );
}

export default SetPassword;
