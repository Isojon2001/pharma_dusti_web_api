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
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const [shownDate, setShownDate] = useState(new Date());
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState('');
  const { token } = useAuth();

  const formatDate = (date) => {
    if (!(date instanceof Date) || isNaN(date)) return null;
    return date.toISOString().slice(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { startDate, endDate } = range[0];

    const from = formatDate(startDate);
    const to = formatDate(endDate);

    if (!from || !to) {
      setError("⚠️ Неверный формат даты. Используйте YYYY-MM-DD.");
      return;
    }

    try {
      const res = await axios.get('http://api.dustipharma.tj:1212/api/v1/app/orders/reports', {
        params: { from, to },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReportData(res.data);
      setError('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка запроса';
      setError(`⚠️ ${msg}`);
      setReportData(null);
    }
  };

  const handleMonthChange = (direction) => {
    setShownDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
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
            <div className="input-label">
              <label>От</label>
            </div>
            <div className="input-label">
              <label>До</label>
            </div>
          </div>

          <div className="calendar-with-arrows">
            <button
              type="button"
              className="calendar-arrow-left"
              onClick={() => handleMonthChange(-1)}
            >
              ←
            </button>
            <button
              type="button"
              className="calendar-arrow-right"
              onClick={() => handleMonthChange(1)}
            >
              →
            </button>

            <DateRange
              key={shownDate.toString()}
              editableDateInputs={true}
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
            <button type="submit" className="submit-button">
              Сформировать отчет
            </button>
          </div>
        </form>

        {error && <p className="report-error">{error}</p>}

        {reportData && (
          <div className="report-results">
            <h2>Результаты отчета</h2>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reporting;
