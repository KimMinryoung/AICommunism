import React, { useState } from 'react';

function ResourceBar({ resources }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    usd = 0,
    powerSupply = 0,
    powerConsumption = 0,
    oil = 0,
    food = 0,
    electronics = 0,
    militaryStrength = 0,
    gdpGrowth = 0,
  } = resources || {};

  const isPowerDeficit = powerSupply < powerConsumption;
  const isFoodCritical = food < 50;
  const isMoneyLow = usd < 5000;

  // 핵심 지표 (항상 표시)
  const coreResources = [
    {
      id: 'usd',
      icon: '💰',
      label: '국가 자산',
      value: `$${usd.toLocaleString()}`,
      danger: isMoneyLow,
    },
    {
      id: 'power',
      icon: '⚡',
      label: '전력',
      value: `${Math.floor(powerSupply)}/${Math.floor(powerConsumption)}`,
      danger: isPowerDeficit,
    },
    {
      id: 'food',
      icon: '🌾',
      label: '식량',
      value: food.toLocaleString(),
      danger: isFoodCritical,
    },
  ];

  // 부가 지표 (확장 시 표시)
  const extendedResources = [
    {
      id: 'oil',
      icon: '🛢️',
      label: '석유',
      value: oil.toLocaleString(),
      danger: false,
    },
    {
      id: 'electronics',
      icon: '🔧',
      label: '전자 부품',
      value: electronics.toLocaleString(),
      danger: false,
    },
    {
      id: 'military',
      icon: '🛡️',
      label: '군사력',
      value: `${militaryStrength}%`,
      danger: militaryStrength < 20,
    },
    {
      id: 'gdp',
      icon: '📈',
      label: 'GDP 성장',
      value: `${gdpGrowth >= 0 ? '+' : ''}${gdpGrowth.toFixed(1)}%`,
      danger: gdpGrowth < -5,
    },
  ];

  return (
    <div className={`resource-bar ${isExpanded ? 'expanded' : ''}`}>
      {coreResources.map((res) => (
        <div key={res.id} className="resource-item">
          <span className="resource-label">
            <span className="resource-icon">{res.icon}</span> {res.label}
          </span>
          <span className={`resource-value ${res.danger ? 'danger' : ''}`}>
            {res.value}
          </span>
        </div>
      ))}

      {extendedResources.map((res) => (
        <div key={res.id} className={`resource-item mobile-hidden`}>
          <span className="resource-label">
            <span className="resource-icon">{res.icon}</span> {res.label}
          </span>
          <span className={`resource-value ${res.danger ? 'danger' : ''}`}>
            {res.value}
          </span>
        </div>
      ))}

      <button
        className="resource-expand-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▲ 접기' : '▼ 더 보기'}
      </button>
    </div>
  );
}

export default ResourceBar;
