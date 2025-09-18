import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft } from 'lucide-react';
import { DateRange } from 'react-date-range';
import { ru } from 'date-fns/locale';
import axios from 'axios';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '../index.css';

function Reporting() {
  const { token } = useAuth();

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);
  const [shownDate, setShownDate] = useState(new Date());
  const [error, setError] = useState('');

  const formatDate = (date) =>
    date instanceof Date && !isNaN(date) ? date.toISOString().slice(0, 10) : null;

  const handleMonthChange = (direction) => {
    setShownDate((prev) => {
      const updated = new Date(prev);
      updated.setMonth(prev.getMonth() + direction);
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate } = range[0];
    const from = formatDate(startDate);
    const to = formatDate(endDate);

    if (!from || !to) {
      setError('Неверный формат даты. Используйте YYYY-MM-DD.');
      return;
    }

    try {
      const response = await axios.get('http://api.dustipharma.tj:1212/api/v1/app/orders/reports', {
        params: { from, to },
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Отчет_${from}_до_${to}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setError('');
    } catch (err) {
      console.error('Ошибка скачивания PDF:', err);
      setError('Не удалось скачать отчет');
    }
  };

  return (
    <div className="profileOrder_content">
      <OrderHeader />

      <div className="profileOrder_header">
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/add-products-to-cart">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Отчетность</h1>
        </div>

        <form className="report-range-calendar" onSubmit={handleSubmit}>
          <div className="calendar-inputs-with-labels">
            <label>От</label>
            <label>До</label>
          </div>

          <div className="calendar-with-arrows">
            <button type="button" className="calendar-arrow-left" onClick={() => handleMonthChange(-1)}>←</button>
            <button type="button" className="calendar-arrow-right" onClick={() => handleMonthChange(1)}>→</button>

            <DateRange
              key={shownDate.toString()}
              editableDateInputs
              onChange={(item) => setRange([item.selection])}
              moveRangeOnFirstSelection={false}
              ranges={range}
              locale={ru}
              months={2}
              shownDate={shownDate}
              onShownDateChange={setShownDate}
              direction="horizontal"
              rangeColors={['#007b83']}
            />
          </div>

          <div className="submit-button-wrapper">
            <button type="submit" className="submit-button">Сформировать отчет</button>
          </div>
        </form>

        {error && <p className="report-error">{error}</p>}
      </div>
    </div>
  );
}

export default Reporting;
