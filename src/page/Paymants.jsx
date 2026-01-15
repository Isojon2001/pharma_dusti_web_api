import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoveLeft, Upload, FileText, Trash2 } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';

function Paymants() {
  const [activeTab, setActiveTab] = useState('contractor');

  return (
    <div className="profileOrder_content">
      <div className='paymants_content'>
      <OrderHeader />
      </div>
      <div className="profileOrder_header paymants_header">
        <div className="basket_back back_paymants">
          <Link to="/add-products-to-cart" className="back_link">
            <MoveLeft /> Назад
          </Link>
          <h1>Подключение к ePharma</h1>
        </div>
        <div className='paymants_line'>
        <div className="paymants_lines"></div>
        <div className="paymants_lines"></div>
        <div className="paymants_lines"></div>
        </div>
        <div className="cards">

        <div className="card">
          <h2>Личные данные</h2>
          <div className="form_grid">
            <div className="form_field">
              <label>ФИО</label>
              <input type="text" placeholder="Иванов Иван Иванович" />
            </div>
            <div className='form_fields'>              
            <div className="form_field form_contacts">
              <label>Контактный телефон</label>
              <input type="tel" placeholder="+998 90 123 45 67" />
            </div>

            <div className="form_field form_contacts">
              <label>Партнёр</label>
              <input type="text" placeholder="Имя партнёра" />
            </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="tabs">
              <button
                className={`tab ${activeTab === 'contractor' ? 'active' : ''}`}
                onClick={() => setActiveTab('contractor')}
              >
                Контрагент
              </button>

              <button
                className={`tab ${activeTab === 'manager' ? 'active' : ''}`}
                onClick={() => setActiveTab('manager')}
              >
                Менеджер
              </button>
            </div>
            {activeTab === 'contractor' && (
              <div className="cards">
              </div>
            )}

            {activeTab === 'manager' && (
              <div className="cards">
              </div>
            )}
          <h2>Документы</h2>
          <div className="doc_item loading">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="#5D6075"/>
            <path d="M22 10.75H18C14.58 10.75 13.25 9.41999 13.25 5.99999V1.99999C13.25 1.69999 13.43 1.41999 13.71 1.30999C13.99 1.18999 14.31 1.25999 14.53 1.46999L22.53 9.46999C22.74 9.67999 22.81 10.01 22.69 10.29C22.57 10.57 22.3 10.75 22 10.75ZM14.75 3.80999V5.99999C14.75 8.57999 15.42 9.24999 18 9.24999H20.19L14.75 3.80999Z" fill="#5D6075"/>
            </svg>

            <div className="doc_info">
              <p>ИНН</p>
              <span>Загружается</span>
              <div className="progress" />
            </div>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 3C17.2652 3 17.5196 3.10536 17.7071 3.29289C17.8946 3.48043 18 3.73478 18 4C18 4.26522 17.8946 4.51957 17.7071 4.70711C17.5196 4.89464 17.2652 5 17 5H16L15.997 5.071L15.064 18.142C15.0281 18.6466 14.8023 19.1188 14.4321 19.4636C14.0619 19.8083 13.5749 20 13.069 20H4.93C4.42414 20 3.93707 19.8083 3.56688 19.4636C3.1967 19.1188 2.97092 18.6466 2.935 18.142L2.002 5.072L2 5H1C0.734784 5 0.48043 4.89464 0.292893 4.70711C0.105357 4.51957 0 4.26522 0 4C0 3.73478 0.105357 3.48043 0.292893 3.29289C0.48043 3.10536 0.734784 3 1 3H17ZM11 0C11.2652 0 11.5196 0.105357 11.7071 0.292893C11.8946 0.48043 12 0.734784 12 1C12 1.26522 11.8946 1.51957 11.7071 1.70711C11.5196 1.89464 11.2652 2 11 2H7C6.73478 2 6.48043 1.89464 6.29289 1.70711C6.10536 1.51957 6 1.26522 6 1C6 0.734784 6.10536 0.48043 6.29289 0.292893C6.48043 0.105357 6.73478 0 7 0H11Z" fill="#6b7280"/>
            </svg>

          </div>

          <div className="doc_item dashed">
            <div className="doc_items">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="#5D6075"/>
            <path d="M22 10.75H18C14.58 10.75 13.25 9.41999 13.25 5.99999V1.99999C13.25 1.69999 13.43 1.41999 13.71 1.30999C13.99 1.18999 14.31 1.25999 14.53 1.46999L22.53 9.46999C22.74 9.67999 22.81 10.01 22.69 10.29C22.57 10.57 22.3 10.75 22 10.75ZM14.75 3.80999V5.99999C14.75 8.57999 15.42 9.24999 18 9.24999H20.19L14.75 3.80999Z" fill="#5D6075"/>
            </svg>
            <p>Свидетельство о регистрации</p>
            <span>Добавьте документы</span>
            </div>
            <button><Upload /></button>
          </div>

          <div className="doc_item dashed">
            <div className="doc_items">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="#5D6075"/>
            <path d="M22 10.75H18C14.58 10.75 13.25 9.41999 13.25 5.99999V1.99999C13.25 1.69999 13.43 1.41999 13.71 1.30999C13.99 1.18999 14.31 1.25999 14.53 1.46999L22.53 9.46999C22.74 9.67999 22.81 10.01 22.69 10.29C22.57 10.57 22.3 10.75 22 10.75ZM14.75 3.80999V5.99999C14.75 8.57999 15.42 9.24999 18 9.24999H20.19L14.75 3.80999Z" fill="#5D6075"/>
            </svg>
            <p>Паспорт (лицевая сторона)</p>
            <span>Добавьте документы</span>
            </div>
            <button><Upload /></button>
          </div>

          <div className="doc_item dashed">
            <div className="doc_items">              
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 22.75H9C3.57 22.75 1.25 20.43 1.25 15V9C1.25 3.57 3.57 1.25 9 1.25H14C14.41 1.25 14.75 1.59 14.75 2C14.75 2.41 14.41 2.75 14 2.75H9C4.39 2.75 2.75 4.39 2.75 9V15C2.75 19.61 4.39 21.25 9 21.25H15C19.61 21.25 21.25 19.61 21.25 15V10C21.25 9.59 21.59 9.25 22 9.25C22.41 9.25 22.75 9.59 22.75 10V15C22.75 20.43 20.43 22.75 15 22.75Z" fill="#5D6075"/>
            <path d="M22 10.75H18C14.58 10.75 13.25 9.41999 13.25 5.99999V1.99999C13.25 1.69999 13.43 1.41999 13.71 1.30999C13.99 1.18999 14.31 1.25999 14.53 1.46999L22.53 9.46999C22.74 9.67999 22.81 10.01 22.69 10.29C22.57 10.57 22.3 10.75 22 10.75ZM14.75 3.80999V5.99999C14.75 8.57999 15.42 9.24999 18 9.24999H20.19L14.75 3.80999Z" fill="#5D6075"/>
            </svg>
            <p>Паспорт (оборотная сторона)</p>
            <span>Добавьте документы</span>
            </div>
            <button><Upload /></button>
          </div>

          <button className="submit_btn">
            Отправить на проверку
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}

export default Paymants;
