import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const phone = localStorage.getItem('userPhone');

  useEffect(() => {
    if (!phone) {
      navigate('/registration');
    }
  }, [phone, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Введите пароль и подтвердите его');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    localStorage.setItem('newPassword', password);

    navigate('/Examination');
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
          <h1>Установите пароль</h1>
          <p>Создайте новый пароль для номера <br /><strong>{phone}</strong></p>
          <p>Введите пароль (минимум 4 символа)</p>
        </div>

        <div className="form eyes">
          <label>Новый пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form eyes">
          <label>Подтвердите пароль</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <button type="submit" disabled={!password || !confirmPassword}>
          Далее
        </button>
      </form>
    </div>
  );
}

export default SetPassword;
