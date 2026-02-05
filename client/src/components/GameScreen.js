import React, { useState } from 'react';

function parseFormattedText(text) {
  const patterns = [
    { regex: /\*\*\[([^\]]+)\]\*\*/g, className: "text-status text-emphasis" },
    { regex: /\*\*\{\{([^}]+)\}\}\*\*/g, className: "text-item text-emphasis" },
    { regex: /\*\*!!([^!]+)!!\*\*/g, className: "text-danger text-emphasis" },
    { regex: /\[([^\]]+)\]/g, className: "text-status" },
    { regex: /\*\*([^*]+)\*\*/g, className: "text-emphasis" },
    { regex: /\{\{([^}]+)\}\}/g, className: "text-item" },
    { regex: /!!([^!]+)!!/g, className: "text-danger" },
  ];

  let result = [{ text, formatted: false }];

  patterns.forEach(({ regex, className }) => {
    const newResult = [];
    result.forEach((segment) => {
      if (segment.formatted) {
        newResult.push(segment);
        return;
      }

      const str = segment.text;
      if (typeof str !== 'string') {
        newResult.push(segment);
        return;
      }

      let lastIndex = 0;
      let match;
      regex.lastIndex = 0;

      while ((match = regex.exec(str)) !== null) {
        if (match.index > lastIndex) {
          newResult.push({ text: str.slice(lastIndex, match.index), formatted: false });
        }
        newResult.push({ text: match[1], formatted: true, className, key: `${className}-${match.index}` });
        lastIndex = regex.lastIndex;
      }

      if (lastIndex < str.length) {
        newResult.push({ text: str.slice(lastIndex), formatted: false });
      }
    });
    result = newResult;
  });

  return result.map((segment, index) =>
    segment.formatted
      ? <span key={segment.key || index} className={segment.className}>{segment.text}</span>
      : segment.text
  );
}

function renderDescription(description) {
  if (typeof description === 'string') {
    return <p className="narration">{parseFormattedText(description)}</p>;
  }

  if (Array.isArray(description)) {
    return description.map((item, index) => {
      const text = typeof item === 'string' ? item : item.text;
      return (
        <p key={index} className="narration">
          {parseFormattedText(text)}
        </p>
      );
    });
  }

  return null;
}

function GameScreen({ gameState, onAction, onSave, onLoad, onRestart, isLoading, message }) {
  const { description, actions, resources, isEnding } = gameState || {};
  const {
    usd = 0,
    powerSupply = 0,
    powerConsumption = 0,
    oil = 0,
    ores = 0,
    diplomacy = 0,
    socialStability = 0,
    equalityIndex = 0,
    currentDay = 1
  } = resources || {};

  const isPowerDeficit = powerSupply < powerConsumption;

  return (
    <div className="game-screen">
      <div className="crt-overlay" />

      <div className="game-header">
        <div className="game-status-hud">
          <span>가동 일수: {currentDay}</span>
        </div>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={onRestart} disabled={isLoading}>다시 시작</button>
          <button className="btn-secondary" onClick={onSave} disabled={isLoading}>보안 저장</button>
          <button className="btn-secondary" onClick={onLoad} disabled={isLoading}>기록 소환</button>
        </div>
      </div>

      <div className="resource-bar">
        <div className="resource-item">
          <span className="resource-label">국가 자산 (딸라)</span>
          <span className="resource-value">${usd.toLocaleString()}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">전력량 (기가와트)</span>
          <span className={`resource-value ${isPowerDeficit ? 'danger' : ''}`}>
            {powerSupply.toFixed(1)} / {powerConsumption.toFixed(1)}
          </span>
        </div>
        <div className="resource-item">
          <span className="resource-label">석유 매장량 (배럴)</span>
          <span className="resource-value">{oil.toLocaleString()}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">전략 광물 (톤)</span>
          <span className="resource-value">{ores.toLocaleString()}</span>
        </div>
      </div>

      <div className="main-layout">
        <div className="game-content">
          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          {isEnding && <div className="ending-badge">이념적 결론에 도달함</div>}

          <div className="scene-description">
            {renderDescription(description)}
          </div>

          <div className="actions">
            {actions?.map((action) => (
              <button
                key={action.id}
                className="action-btn"
                onClick={() => onAction(action.id)}
                disabled={isLoading}
              >
                {action.text}
              </button>
            ))}
          </div>
        </div>

        <div className="game-sidebar">
          <div className="sidebar-panel">
            <h3>사회 현황</h3>

            <div className="gauge-wrapper">
              <div className="gauge-label">
                <span>평등 지수</span>
                <span>{(equalityIndex * 100).toFixed(1)}%</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill gold" style={{ width: `${equalityIndex * 100}%` }} />
              </div>
            </div>

            <div className="gauge-wrapper">
              <div className="gauge-label">
                <span>사회 안정도</span>
                <span>{socialStability}%</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill" style={{ width: `${socialStability}%` }} />
              </div>
            </div>

            <div className="gauge-wrapper">
              <div className="gauge-label">
                <span>교섭 지수</span>
                <span>{diplomacy}%</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill cyan" style={{ width: `${diplomacy}%` }} />
              </div>
            </div>
          </div>

          <div className="sidebar-panel">
            <h3>시스템 통보</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
              {isPowerDeficit ?
                "!! 전력 부족 감지 !! 사회 안정도가 하락하며 평등 지수가 감소하고 있습니다." :
                "시스템 최적 상태. 계획 효율성 99.8% 달성."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
