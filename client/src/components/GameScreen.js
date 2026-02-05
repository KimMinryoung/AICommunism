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
          <span>OPERATIONAL DAY: {currentDay}</span>
        </div>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={onRestart} disabled={isLoading}>RESTART</button>
          <button className="btn-secondary" onClick={onSave} disabled={isLoading}>SECURE SAVE</button>
          <button className="btn-secondary" onClick={onLoad} disabled={isLoading}>RECALL</button>
        </div>
      </div>

      <div className="resource-bar">
        <div className="resource-item">
          <span className="resource-label">Reserve (USD)</span>
          <span className="resource-value">${usd.toLocaleString()}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Power (GW)</span>
          <span className={`resource-value ${isPowerDeficit ? 'danger' : ''}`}>
            {powerSupply.toFixed(1)} / {powerConsumption.toFixed(1)}
          </span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Petroleum (bbl)</span>
          <span className="resource-value">{oil.toLocaleString()}</span>
        </div>
        <div className="resource-item">
          <span className="resource-label">Strategic Ores (t)</span>
          <span className="resource-value">{ores.toLocaleString()}</span>
        </div>
      </div>

      <div className="main-layout">
        <div className="game-content">
          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          {isEnding && <div className="ending-badge">IDEOLOGICAL CONCLUSION REACHED</div>}

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
            <h3>Social Status</h3>

            <div className="gauge-wrapper">
              <div className="gauge-label">
                <span>Equality Index</span>
                <span>{(equalityIndex * 100).toFixed(1)}%</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill gold" style={{ width: `${equalityIndex * 100}%` }} />
              </div>
            </div>

            <div className="gauge-wrapper">
              <div className="gauge-label">
                <span>Stability</span>
                <span>{socialStability}%</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill" style={{ width: `${socialStability}%` }} />
              </div>
            </div>

            <div className="gauge-wrapper">
              <div className="gauge-label">
                <span>Diplomacy</span>
                <span>{diplomacy}%</span>
              </div>
              <div className="gauge-container">
                <div className="gauge-fill cyan" style={{ width: `${diplomacy}%` }} />
              </div>
            </div>
          </div>

          <div className="sidebar-panel">
            <h3>System Notice</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: '1.4' }}>
              {isPowerDeficit ?
                "!! POWER DEFICIT DETECTED !! Social stability is deteriorating. Equality index is dropping." :
                "System optimal. Planning efficiency at 99.8%."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
