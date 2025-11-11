import React, { useEffect, useState } from 'react';
import { CircleCheck, Clock3, Package, Truck, Route } from 'lucide-react';

// Порядок отображения статусов
const STATUS_ORDER = [
  'Оформлено',
  'В обработке',
  'В сборке',
  'Готов к доставке',
  'В пути',
  'Доставлен',
];

// Соответствие между API и визуальными статусами
const API_STATUS_TO_STEP_STATUS = {
  'Оформлено': 'Оформлено',
  'КОбработке': 'В обработке',
  'КСборке': 'В сборке',
  'ГотовКДоставке': 'Готов к доставке',
  'В пути': 'В пути',
  'Доставлен': 'Доставлен',
};

// Цвета статусов
const ACTIVE_COLOR = '#4CAF50';
const NEXT_COLOR = '#FFD700'; // 💛 Цвет следующего шага
const INACTIVE_COLOR = '#E0E0E0';

// Иконки для каждого статуса
const ICONS = {
  'Оформлено': <CircleCheck size={24} />,
  'В обработке': <Clock3 size={24} />,
  'В сборке': <Package size={24} />,
  'Готов к доставке': <Truck size={24} />,
  'В пути': <Route size={24} />,
  'Доставлен': <CircleCheck size={24} />,
};

// Параметры визуализации
const CENTER_X = 308;
const CENTER_Y = 170;
const RADIUS = 130;
const START_ANGLE = -200;
const END_ANGLE = 20;
const CIRCLE_RADIUS = 34;
const ICON_SIZE = 24;
const TEXT_FONT_SIZE = 16;

// Вспомогательные функции
function degreesToRadians(deg) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = degreesToRadians(angleDeg);
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function extractCurrentStatus(statusObj) {
  const statusKeysInOrder = [
    'Оформлено',
    'КОбработке',
    'КСборке',
    'ГотовКДоставке',
    'В пути',
    'Доставлен',
  ];

  for (let i = statusKeysInOrder.length - 1; i >= 0; i--) {
    const key = statusKeysInOrder[i];
    if (statusObj[key] === 'Да') {
      return API_STATUS_TO_STEP_STATUS[key] || 'Оформлено';
    }
  }

  return 'Оформлено';
}

function CircularOrderStatus({ apiStatus, onConfirm, orderId, timestamps = {}, token }) {
  const [localStatus, setLocalStatus] = useState(apiStatus);
  const [confirmationDate, setConfirmationDate] = useState(timestamps?.delivered_at || null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleShowModal = () => setShowConfirmModal(true);
  const handleCancelModal = () => setShowConfirmModal(false);

  // Автообновление статуса каждые 10 секунд
  useEffect(() => {
    setLocalStatus(apiStatus);
    if (timestamps?.delivered_at) {
      setConfirmationDate(timestamps.delivered_at);
    }

    if (!token || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `https://api.dustipharma.tj:1212/api/v1/app/orders/status/${orderId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (res.ok && data?.payload?.status) {
          const updatedStatus = data.payload.status;
          setLocalStatus(updatedStatus);

          if (updatedStatus.Доставлен === 'Да') {
            const deliveredDate =
              data.payload.status?.ДатаДоставлен || new Date().toLocaleString();
            setConfirmationDate(deliveredDate);
          }
        }
      } catch (err) {
        console.error('Ошибка при автообновлении статуса:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [token, orderId]);

  const rawStatus = extractCurrentStatus(localStatus);
  const currentIndex = STATUS_ORDER.indexOf(rawStatus);
  const totalSteps = STATUS_ORDER.length;
  const angleStep = (END_ANGLE - START_ANGLE) / (totalSteps - 1);

  const positions = STATUS_ORDER.map((_, i) => {
    const angle = START_ANGLE + angleStep * i;
    return polarToCartesian(CENTER_X, CENTER_Y, RADIUS, angle);
  });

  const isDelivered = rawStatus === 'Доставлен';

  // Подтверждение получения
  const handleConfirm = async () => {
    if (!token) {
      console.error('Токен не передан');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.dustipharma.tj:1212/api/v1/app/status/${orderId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        const apiDate = data?.payload?.ДатаДоставлен || new Date().toLocaleString();
        setLocalStatus((prev) => ({ ...prev, Доставлен: 'Да' }));
        setConfirmationDate(apiDate);
        if (onConfirm) onConfirm(apiDate);
      } else {
        console.error('Ошибка подтверждения:', data.message);
      }
    } catch (error) {
      console.error('Ошибка сети:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="STATUS_ORDERS">
      <svg width={600} height={300}>
        {/* Линии между статусами */}
        {positions.map((pos, i) => {
          if (i === positions.length - 1) return null;
          const nextPos = positions[i + 1];
          const isActive = i <= currentIndex;
          return (
            <path
              key={`arc-${i}`}
              d={`M ${pos.x} ${pos.y} A ${RADIUS} ${RADIUS} 0 0 1 ${nextPos.x} ${nextPos.y}`}
              stroke={isActive ? ACTIVE_COLOR : INACTIVE_COLOR}
              strokeWidth={10}
              fill="none"
            />
          );
        })}

        {/* Отрисовка каждого статуса */}
        {STATUS_ORDER.map((status, i) => {
          const pos = positions[i];
          const isRightSide = pos.x >= CENTER_X;
          const apiKey = Object.keys(API_STATUS_TO_STEP_STATUS).find(
            (k) => API_STATUS_TO_STEP_STATUS[k] === status
          );

          let isReached = localStatus[apiKey] === 'Да';
          if (status === 'В пути' && localStatus['Доставлен'] === 'Да') {
            isReached = true;
          }

          const nextIndex = currentIndex + 1;
          const isNext = i === nextIndex;
          const textOffset = isRightSide ? CIRCLE_RADIUS + 20 : -CIRCLE_RADIUS - 20;

          const circleColor = isReached
            ? ACTIVE_COLOR
            : isNext
            ? NEXT_COLOR
            : INACTIVE_COLOR;

          const textColor = isReached
            ? ACTIVE_COLOR
            : isNext
            ? NEXT_COLOR
            : 'gray';

          return (
            <g key={status} transform={`translate(${pos.x},${pos.y})`}>
              <circle r={CIRCLE_RADIUS} fill={circleColor} />
              <foreignObject
                x={-ICON_SIZE / 2}
                y={-ICON_SIZE / 2}
                width={ICON_SIZE + 10}
                height={ICON_SIZE + 10}
              >
                <div>
                  {React.cloneElement(ICONS[status], {
                    color: isReached || isNext ? 'white' : 'gray',
                    size: ICON_SIZE,
                  })}
                </div>
              </foreignObject>
              <text
                x={textOffset}
                y={6}
                textAnchor={isRightSide ? 'start' : 'end'}
                fill={textColor}
                fontWeight={isReached || isNext ? 'bold' : 'normal'}
                fontSize={TEXT_FONT_SIZE}>
                {status}
              </text>
            </g>
          );
        })}
      </svg>
      {!isDelivered &&
        STATUS_ORDER.indexOf(rawStatus) >= STATUS_ORDER.indexOf('Готов к доставке') &&
        STATUS_ORDER.indexOf(rawStatus) < STATUS_ORDER.indexOf('Доставлен') && (
          <>
            <button onClick={handleShowModal} className="confirm_button" disabled={isLoading}>
              {isLoading ? 'Подтверждение...' : 'Подтвердить получение'}
            </button>

            {showConfirmModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>Подтверждение получения заказа</h2>
                  <p>Вы действительно получили заказ?</p>
                  <div className="modal-buttons">
                    <button
                      onClick={() => {
                        handleConfirm();
                        setShowConfirmModal(false);
                      }}
                      className="confirm-btn">
                      Да
                    </button>
                    <button onClick={handleCancelModal} className="cancel-btn">
                      Отмена
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    </div>
  );
}

export default CircularOrderStatus;
