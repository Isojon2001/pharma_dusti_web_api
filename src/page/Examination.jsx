import React, { useRef, useState, useEffect } from 'react';
import { MoveLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

function Examination() {
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const phone = localStorage.getItem('userPhone');

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  useEffect(() => {
    // Автофокус на первый input
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

    inputsRef.current[index].value = value;

    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const code = inputsRef.current.map((input) => input.value).join('');

    if (code.length !== 6) {
      setError('Пожалуйста, введите 6-значный код');
      return;
    }

    try {
      const response = await axios.post(
        'http://api.dustipharma.tj:1212/api/v1/app/auth/validate-otp',
        {
          phone,
          code,
        }
      );

      if (response.status === 200) {
        localStorage.removeItem('userPhone');
        navigate('/reset-password'); // ✅ Следующий шаг
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Неверный код. Попробуйте ещё раз.');
      } else {
        setError('Ошибка подключения. Повторите попытку позже.');
      }
    }
  };

  return (
    <div className="registration gap">
      <div className="logo_login margin_bottom">
        <div className="logo_img">
          <div className="login_logo">
            <img src="./logo.svg" alt="logo" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="examination_backspace">
          <Link to="/registration">
            <MoveLeft stroke="#232323" /> Назад
          </Link>
        </div>

        <div className="forms buttons">
          <div className="registration_paragraph">
            <h1>Подтверждение кода</h1>
            <p>
              Введите код, отправленный на номер <br />
              <strong>{phone}</strong>
            </p>
          </div>

          <div className="code-inputs">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                ref={(el) => (inputsRef.current[i] = el)}
                onChange={(e) => handleChange(e, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
              />
            ))}
          </div>

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          <button type="submit">Подтвердить</button>
        </div>
      </form>
    </div>
  );
}

export default Examination;
