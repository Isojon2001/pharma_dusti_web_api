import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function ProfileOrder() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    Фирма: '',
    ВидКонтрагента: '',
    Наименование: '',
    Адрес: '',
    Телефон: '',
    МенеджерКонтрагента: ''
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setIsLoading(true);

    axios
      .get('https://api.dustipharma.tj:1212/api/v1/app/profile/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const currentUser = res?.data?.payload?.[0];

        if (currentUser) {
          setForm({
            Фирма: currentUser['Фирма'] || '',
            ВидКонтрагента: currentUser['ВидКонтрагента'] || '',
            "Ф.И.О Контрагента": currentUser['Наименование'] || '',
            Адрес: currentUser['Адрес'] || '',
            Телефон: currentUser['Телефон'] || '',
            "Торговый Представитель": currentUser['МенеджерКонтрагента'] || ''
          });
        } else {
          console.warn('Пользователь не найден');
        }
      })
      .catch((err) => {
        console.error('Ошибка при получении данных пользователя:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Здесь можно добавить логику сохранения если потребуется в будущем
    alert('Форма отправлена, но логика сохранения пока не реализована');
  };

  if (isLoading) {
    return <div>Загрузка профиля...</div>;
  }

  return (
    <div className='profileOrder_content'>
      <OrderHeader />
      <div className='profileOrder_header'>
        <div className='basket_back'>
          <div className='examination_backspace'>
            <Link to='/add-products-to-cart'>
              <MoveLeft stroke='#232323' /> Назад
            </Link>
          </div>
          <h1>Профиль</h1>
        </div>

        <form className='form_profile' onSubmit={handleSubmit}>
          {Object.entries(form).map(([key, value]) => (
            <div key={key} className='bg_form'>
              <label htmlFor={key}>{key}</label>
              <input
                type='text'
                name={key}
                id={key}
                value={value}
                onChange={handleChange}
              />
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}

export default ProfileOrder;
