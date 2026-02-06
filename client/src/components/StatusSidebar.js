import React, { useState, useEffect } from 'react';

function StatusSidebar({ resources, notifications }) {
  const [isOpen, setIsOpen] = useState(false);

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
    { label: '평등 지수', value: equalityIndex * 100, display: `${(equalityIndex * 100).toFixed(1)}%`, color: 'gold', icon: '⚖️' },
    { label: '사회 안정도', value: socialStability, display: `${socialStability}%`, color: '', icon: '🏠' },
    { label: '인민 사기', value: publicMorale, display: `${publicMorale}%`, color: 'cyan', icon: '😊' },
    { label: '당 충성도', value: partyLoyalty, display: `${partyLoyalty}%`, color: '', icon: '🎖️' },
    { label: 'AI 자율성', value: aiAutonomy, display: `${aiAutonomy}%`, color: 'cyan', icon: '🤖' },
    { label: '교섭 지수', value: diplomacy, display: `${diplomacy}%`, color: 'cyan', icon: '🤝' },
    { label: '교육 수준', value: education, display: `${education}%`, color: 'gold', icon: '📚' },
    { label: '의료 수준', value: healthcare, display: `${healthcare}%`, color: 'gold', icon: '🏥' },
  ];

  // 위험 알림 있는지 확인
  const hasDanger = (notifications || []).some((n) => n.type === 'danger');

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      {/* 모바일 오버레이 */}
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      {/* 사이드바 */}
      <div className={`status-sidebar ${isOpen ? 'open' : ''}`}>
        {/* 모바일 닫기 버튼 */}
        <button
          className="sidebar-close-btn"
          onClick={() => setIsOpen(false)}
        >
          ✕ 닫기
        </button>

        <div className="sidebar-panel">
          <h3>사회 현황</h3>
          {gauges.map((gauge) => (
            <div key={gauge.label} className="gauge-wrapper">
              <div className="gauge-label">
                <span><span className="gauge-icon">{gauge.icon}</span> {gauge.label}</span>
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
          <h3>시스템 통보 {hasDanger && <span className="danger-badge">!</span>}</h3>
          <div className="notifications-list">
            {(notifications || []).length === 0 ? (
              <p className="notification info">특이사항 없음</p>
            ) : (
              (notifications || []).map((note, i) => (
                <p key={i} className={`notification ${note.type}`}>
                  {note.type === 'danger' && '⚠️ '}
                  {note.type === 'warning' && '⚡ '}
                  {note.text}
                </p>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 모바일 토글 버튼 */}
      <button
        className={`status-toggle-btn ${hasDanger ? 'has-danger' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasDanger ? '⚠️' : '📊'} 현황
      </button>
    </>
  );
}

export default StatusSidebar;
