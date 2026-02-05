import React from 'react';

function ResourceBar({ resources }) {
  const {
    usd = 0,
    powerSupply = 0,
    powerConsumption = 0,
    oil = 0,
    food = 0,
    electronics = 0,
  } = resources || {};

  const isPowerDeficit = powerSupply < powerConsumption;

  return (
    <div className="resource-bar">
      <div className="resource-item">
        <span className="resource-label">국가 자산 (딸라)</span>
        <span className="resource-value">${usd.toLocaleString()}</span>
      </div>
      <div className="resource-item">
        <span className="resource-label">전력 (기가와트)</span>
        <span className={`resource-value ${isPowerDeficit ? 'danger' : ''}`}>
          {Math.floor(powerSupply)} / {Math.floor(powerConsumption)}
        </span>
      </div>
      <div className="resource-item">
        <span className="resource-label">석유 (배럴)</span>
        <span className="resource-value">{oil.toLocaleString()}</span>
      </div>
      <div className="resource-item">
        <span className="resource-label">식량 (톤)</span>
        <span className={`resource-value ${food < 50 ? 'danger' : ''}`}>
          {food.toLocaleString()}
        </span>
      </div>
      <div className="resource-item">
        <span className="resource-label">전자 부품</span>
        <span className="resource-value">{electronics.toLocaleString()}</span>
      </div>
    </div>
  );
}

export default ResourceBar;
