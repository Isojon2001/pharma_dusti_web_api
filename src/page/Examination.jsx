import React, { useRef, useState, useEffect } from 'react';
import { MoveLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

function Examination() {
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;
    if (value && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    const value = e.target.value;
    if (e.key === 'Backspace' && !value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="registration gap">
      <div className="logo_login margin_bottom">
        <div className="logo_img">
          <img src="./Logo.png" alt="logo" />
        </div>
        <h3>ДУСТИ</h3>
        <h3>Фарма</h3>
      </div>

      <form>
        <div className="examination_backspace">
          <Link to="/registration">
            <MoveLeft stroke="#232323" /> Назад
          </Link>
        </div>

        <div className="forms buttons">
          <div className="registration_paragraph">
            <h1>Проверка OTP</h1>
            <p>
              Введите проверочный код, который мы отправили на <br />
              ваш адрес электронной почты
            </p>
          </div>

          <div className="code-inputs">
            {[0, 1, 2, 3].map((i) => (
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

          <button type="submit">Войти</button>

          <p className="resend-info">
            {timer > 0
              ? `Повторно отправить код через ${timer} сек.`
              : 'Вы можете повторно отправить код'}
          </p>
        </div>
      </form>
    </div>
  );
}

export default Examination;
