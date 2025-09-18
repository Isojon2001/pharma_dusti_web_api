import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login: loginByToken } = useAuth();

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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

  return (
    <div className="registration gap">
      <div className='logo_login margin_bottom'>
        <div className='logo_img'>   
        <img src="./Logo.png" alt="logo"/>
        </div>
        <h3>ДУСТИ</h3>
        <h3>Фарма</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Регистрация</h1>
          <p>Войдите в учетную запись</p>
        </div>

        <div className="forms registration_forms">
          <div className="form">
            <label htmlFor="number_phone">
              Номер телефона
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              required
            />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit">Войти</button>
        </div>
      </form>
    </div>
  );
}

export default RegistrationPage;
