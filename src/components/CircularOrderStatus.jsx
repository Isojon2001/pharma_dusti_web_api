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
  'В обработке': 'В обработке',
  'В сборке': 'В сборке',
  'Готов к доставке': 'Готов к доставке',
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
    angleDeg,
  };
}

function CircularOrderStatus({ apiStatus, onConfirm }) {
  const [localStatus, setLocalStatus] = useState(apiStatus);

  useEffect(() => {
    setLocalStatus(apiStatus);
  }, [apiStatus]);

  const rawStatus = API_STATUS_TO_STEP_STATUS[localStatus] || 'Оформлено';
  const currentStatus = rawStatus === 'В пути' ? 'Готов к доставке' : rawStatus;
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const totalSteps = STATUS_ORDER.length;
  const angleStep = (END_ANGLE - START_ANGLE) / (totalSteps - 1);

  const positions = STATUS_ORDER.map((_, i) => {
    const angle = START_ANGLE + angleStep * i;
    return polarToCartesian(CENTER_X, CENTER_Y, RADIUS, angle);
  });

  const isDelivered = rawStatus === 'Доставлен';

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      setLocalStatus('Доставлен');
    }
  };

  return (
    <div className="STATUS_ORDERS">
      <svg width={600} height={300}>
        {/* Линии между точками */}
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

        {/* Иконки и подписи */}
        {STATUS_ORDER.map((status, i) => {
          const pos = positions[i];
          const isActive = STATUS_ORDER[i] === currentStatus;
          const isRightSide = pos.x >= CENTER_X;

          const isReached =
            rawStatus === 'В пути' && status === 'В пути'
              ? false
              : i <= currentIndex;

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
                fill={isActive ? ACTIVE_COLOR : 'gray'}
                fontWeight={isActive ? 'bold' : 'normal'}
                fontSize={TEXT_FONT_SIZE}
              >
                {status}
              </text>
            </g>
          );
        })}
      </svg>

      {!isDelivered && (
        <button onClick={handleConfirm} className="confirm_button">
          Подтвердить получение
        </button>
      )}
    </div>
  );
}

export default CircularOrderStatus;
