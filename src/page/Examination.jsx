import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Examination() {
  const inputsRef = useRef([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const phone = localStorage.getItem('userPhone');
  const newPassword = localStorage.getItem('newPassword');

  useEffect(() => {
    if (!phone || !newPassword) {
      navigate('/registration');
    } else {
      if (inputsRef.current[0]) {
        inputsRef.current[0].focus();
      }
    }
  }, [phone, newPassword, navigate]);

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

    setIsSubmitting(true);

    try {
      await axios.post('https://api.dustipharma.tj:1212/api/v1/app/auth/reset-password', {
        phone,
        code,
        new_password: newPassword,
      });

      localStorage.removeItem('newPassword');
      localStorage.removeItem('otpCode');

      navigate('/');
    } catch (err) {
      setError('Неверный или просроченный код подтверждения');
    } finally {
      setIsSubmitting(false);
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
          <h1>Подтверждение кода</h1>
          <p>Введите 6-значный код, отправленный на номер <br /><strong>{phone}</strong></p>
        </div>

        <div className="code-inputs">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              maxLength={1}
              ref={(el) => (inputsRef.current[i] = el)}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              disabled={isSubmitting}
              autoComplete="one-time-code"
              required
            />
          ))}
        </div>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Подтверждаем...' : 'Подтвердить'}
        </button>
      </form>
    </div>
  );
}

export default Examination;
