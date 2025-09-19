import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
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
      navigate('/add-products-to-cart');
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
    <div className="registration">
      <div className='logo_login'>
        <div className='login_logo'>   
        <img src="./logo.svg" alt="logo"/>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="registration_paragraph">
          <h1>Авторизация</h1>
          <p>Войдите в учетную запись</p>
        </div>

        <div className="forms">
          <div className="form">
           <label htmlFor="login" >
              Номер телефона
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
            />
          </div>

          <div className="form eyes">
            <label htmlFor="password">
              Пароль
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              name="password"
              required
            />
            <span onClick={togglePassword}>
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="registration_forgot">
            <a href="./registration">Забыли пароль?</a>
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <button type="submit">Войти</button>
        </div>
      </form>
      <div className='registration_acc'>
        <p>Нет учетной записи?</p>
        <Link to="/registration">Зарегистрироваться</Link>
      </div>
    </div>
  );
}

export default LoginPage;
