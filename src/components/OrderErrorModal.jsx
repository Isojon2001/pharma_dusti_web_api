import '../index.css';
import React from 'react';
import { X, AlertCircle } from 'lucide-react';

function OrderErrorModal({ message, onClose, onRetry, showRetry = false }) {
  // Проверяем, является ли это ошибкой о долге
  const isDebtError = message && (
    message.toLowerCase().includes('долг') || 
    message.toLowerCase().includes('задолженность') ||
    message.toLowerCase().includes('просроченный') ||
    message.toLowerCase().includes('просроченный долг')
  );

  // Бирюзовый цвет для фирменного стиля
  const tealColor = '#14b8a6'; // teal-500
  const tealLight = '#ccfbf1'; // teal-100
  const tealDark = '#0f766e'; // teal-700

  if (isDebtError) {
    // Специальный дизайн для уведомления о долге в стиле документа
    return (
      <div className="modal-overlay" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="modal" style={{ 
          maxWidth: '500px',
          padding: '40px',
          backgroundColor: '#ffffff',
          border: `2px solid ${tealColor}`,
          borderRadius: '8px',
          position: 'relative'
        }}>
          {/* Кнопка закрытия - размещена в правом верхнем углу, но не перекрывает логотип */}
          <div style={{ 
            position: 'absolute', 
            top: '15px', 
            right: '15px',
            zIndex: 10
          }}>
            <X 
              strokeWidth={2.5} 
              onClick={onClose} 
              style={{ 
                color: '#999',
                cursor: 'pointer',
                width: '24px',
                height: '24px'
              }} 
            />
          </div>

          {/* Логотип */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            marginBottom: '20px',
            marginTop: '10px' // Добавляем отступ сверху, чтобы логотип не был слишком близко к краю
          }}>
            <img 
              src="/logo.svg" 
              alt="Дусти Фарма" 
              style={{ 
                height: '60px', 
                width: 'auto',
                filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.1))`
              }} 
              onError={(e) => {
                // Если логотип не найден, скрываем его
                e.target.style.display = 'none';
              }}
            />
          </div>

          {/* Название компании */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '10px' 
          }}>
            <h3 style={{ 
              margin: 0, 
              color: tealColor, 
              fontSize: '18px',
              fontWeight: '600',
              letterSpacing: '1px',
              textTransform: 'uppercase'
            }}>
              ДУСТИ ФАРМА
            </h3>
          </div>

          {/* Заголовок */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '30px' 
          }}>
            <h2 style={{ 
              margin: 0, 
              color: tealColor, 
              fontSize: '24px',
              fontWeight: 'bold',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              УВЕДОМЛЕНИЕ О ЗАДОЛЖЕННОСТИ
            </h2>
          </div>

          {/* Сообщение */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px',
            backgroundColor: tealLight,
            borderRadius: '8px',
            border: `1px solid ${tealColor}`
          }}>
            <p style={{ 
              margin: 0, 
              color: tealDark,
              fontSize: '16px',
              lineHeight: '1.6',
              fontWeight: '500'
            }}>
              Ваш заказ отклонён по причине превышения лимита кредита или просрочки оплаты кредита. Пожалуйста обратитесь к своему менеджеру.
            </p>
          </div>

          {/* Кнопка */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={onClose} 
              className="close-btn" 
              style={{ 
                backgroundColor: tealColor,
                color: 'white',
                minWidth: '150px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = tealDark}
              onMouseOut={(e) => e.target.style.backgroundColor = tealColor}
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Стандартный дизайн для других ошибок
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '500px' }}>
        <div className="modals__close">
          <X strokeWidth={3} onClick={onClose} />
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '16px',
          justifyContent: 'center'
        }}>
          <AlertCircle 
            size={32} 
            color="#ef4444" 
            strokeWidth={2}
          />
          <h2 style={{ 
            margin: 0, 
            color: '#ef4444',
            fontSize: '20px'
          }}>
            Ошибка оформления заказа
          </h2>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fca5a5'
        }}>
          <p style={{ 
            margin: 0, 
            whiteSpace: 'pre-line',
            lineHeight: '1.6',
            color: '#1f2937',
            fontSize: '15px'
          }}>
            {message}
          </p>
        </div>

        <div className="modalss" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {showRetry && onRetry && (
            <button onClick={onRetry} className="close-btn" style={{ backgroundColor: '#4CAF50', color: 'white' }}>
              Повторить попытку
            </button>
          )}
          <button onClick={onClose} className="close-btn" style={{ 
            backgroundColor: '#ef4444',
            color: 'white',
            minWidth: '100px'
          }}>
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderErrorModal;
