import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function SetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: loginByToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      const response = await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/auth/sign-in',
        { login, password }
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
      console.error('Ошибка входа:', err);
      if (err.response?.status === 401) {
        setError('Неверный номер телефона или пароль');
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
          <img src="./Logo.png" alt="logo" />
        </div>
        <h3>ДУСТИ</h3>
        <h3>Фарма</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Установите пароль</h1>
          <p>Войдите в учетную запись</p>
        </div>
        <div className="forms registration_forms">
          <div className="form eyes">
            <div className="form eyes">
            <label htmlFor="password">Новый пароль</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                name="password"
                required
              />
              <span onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
            <div className="form eyes">
            <label htmlFor="confirmpassword">Подтвердите пароль</label>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                name="confirmpassword"
                required
              />
              <span onClick={() => setShowConfirm((prev) => !prev)}>
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit" disabled={isDisabled}>
            Войти
          </button>
        </div>
      </form>
    </div>
  );
}

export default SetPassword;
