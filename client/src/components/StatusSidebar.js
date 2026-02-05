import React from 'react';

function StatusSidebar({ resources, notifications }) {
  const {
    equalityIndex = 0,
    socialStability = 0,
    publicMorale = 0,
    partyLoyalty = 0,
    aiAutonomy = 0,
    diplomacy = 0,
    education = 0,
    healthcare = 0,
  } = resources || {};

  const gauges = [
    { label: '평등 지수', value: equalityIndex * 100, display: `${(equalityIndex * 100).toFixed(1)}%`, color: 'gold' },
    { label: '사회 안정도', value: socialStability, display: `${socialStability}%`, color: '' },
    { label: '인민 사기', value: publicMorale, display: `${publicMorale}%`, color: 'cyan' },
    { label: '당 충성도', value: partyLoyalty, display: `${partyLoyalty}%`, color: '' },
    { label: 'AI 자율성', value: aiAutonomy, display: `${aiAutonomy}%`, color: 'cyan' },
    { label: '교섭 지수', value: diplomacy, display: `${diplomacy}%`, color: 'cyan' },
    { label: '교육 수준', value: education, display: `${education}%`, color: 'gold' },
    { label: '의료 수준', value: healthcare, display: `${healthcare}%`, color: 'gold' },
  ];

  return (
    <div className="status-sidebar">
      <div className="sidebar-panel">
        <h3>사회 현황</h3>
        {gauges.map((gauge) => (
          <div key={gauge.label} className="gauge-wrapper">
            <div className="gauge-label">
              <span>{gauge.label}</span>
              <span>{gauge.display}</span>
            </div>
            <div className="gauge-container">
              <div
                className={`gauge-fill ${gauge.color}`}
                style={{ width: `${Math.min(100, Math.max(0, gauge.value))}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-panel">
        <h3>시스템 통보</h3>
        <div className="notifications-list">
          {(notifications || []).map((note, i) => (
            <p key={i} className={`notification ${note.type}`}>
              {note.type === 'danger' && '!! '}
              {note.text}
              {note.type === 'danger' && ' !!'}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatusSidebar;
