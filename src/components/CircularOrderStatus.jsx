import React, { useEffect, useState } from 'react';
import { CircleCheck, Clock3, Package, Truck, Route } from 'lucide-react';

const STATUS_ORDER = [
  'Оформлено',
  'В обработке',
  'В сборке',
  'Готов к доставке',
  'В пути',
  'Доставлен',
];

const API_STATUS_TO_STEP_STATUS = {
  'Оформлено': 'Оформлено',
  'КОбработке': 'В обработке',
  'КСборке': 'В сборке',
  'ГотовКДоставке': 'Готов к доставке',
  'В пути': 'В пути',
  'Доставлен': 'Доставлен',
};

const ACTIVE_COLOR = '#4CAF50';
const INACTIVE_COLOR = '#E0E0E0';

const ICONS = {
  'Оформлено': <CircleCheck size={24} />,
  'В обработке': <Clock3 size={24} />,
  'В сборке': <Package size={24} />,
  'Готов к доставке': <Truck size={24} />,
  'В пути': <Route size={24} />,
  'Доставлен': <CircleCheck size={24} />,
};

const CENTER_X = 308;
const CENTER_Y = 170;
const RADIUS = 130;
const START_ANGLE = -200;
const END_ANGLE = 20;

const CIRCLE_RADIUS = 34;
const ICON_SIZE = 24;
const TEXT_FONT_SIZE = 16;

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

  for (let key of statusKeysInOrder) {
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

  useEffect(() => {
    setLocalStatus(apiStatus);
    if (timestamps?.delivered_at) {
      setConfirmationDate(timestamps.delivered_at);
    }

    if (!token || !orderId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `http://api.dustipharma.tj:1212/api/v1/app/orders/status/${orderId}`,
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
            const deliveredDate = data.payload.status?.ДатаДоставлен || new Date().toLocaleString();
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

  const handleConfirm = async () => {
    if (!token) {
      console.error('Токен не передан');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://api.dustipharma.tj:1212/api/v1/app/status/${orderId}`,
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

        if (onConfirm) {
          onConfirm(apiDate);
        }
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
        {/* Линии между шагами */}
        {positions.map((pos, i) => {
          if (i === positions.length - 1) return null;
          const nextPos = positions[i + 1];
          const isActive = i < currentIndex;

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

        {/* Шаги и иконки */}
        {STATUS_ORDER.map((status, i) => {
          const pos = positions[i];
          const isRightSide = pos.x >= CENTER_X;

          const apiKey = Object.keys(API_STATUS_TO_STEP_STATUS).find(
            (k) => API_STATUS_TO_STEP_STATUS[k] === status
          );
          const isReached = localStatus[apiKey] === 'Да';

          const textOffset = isRightSide ? CIRCLE_RADIUS + 20 : -CIRCLE_RADIUS - 20;

          return (
            <g key={status} transform={`translate(${pos.x},${pos.y})`}>
              <circle r={CIRCLE_RADIUS} fill={isReached ? ACTIVE_COLOR : INACTIVE_COLOR} />
              <foreignObject
                x={-ICON_SIZE / 2}
                y={-ICON_SIZE / 2}
                width={ICON_SIZE + 10}
                height={ICON_SIZE + 10}
              >
                <div>
                  {React.cloneElement(ICONS[status], {
                    color: isReached ? 'white' : 'gray',
                    size: ICON_SIZE,
                  })}
                </div>
              </foreignObject>
              <text
                x={textOffset}
                y={6}
                textAnchor={isRightSide ? 'start' : 'end'}
                fill={isReached ? ACTIVE_COLOR : 'gray'}
                fontWeight={isReached ? 'bold' : 'normal'}
                fontSize={TEXT_FONT_SIZE}
              >
                {status}
              </text>
            </g>
          );
        })}
      </svg>

      {!isDelivered && (
        <button onClick={handleConfirm} className="confirm_button" disabled={isLoading}>
          {isLoading ? 'Подтверждение...' : 'Подтвердить получение'}
        </button>
      )}

      {isDelivered && confirmationDate && (
        <div className="confirmation_date">
          Подтверждено: {confirmationDate}
        </div>
      )}
    </div>
  );
}

export default CircularOrderStatus;