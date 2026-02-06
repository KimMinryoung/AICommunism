import React from 'react';

// 부서별 아이콘 매핑
const DEPT_ICONS = {
  central_command: '🏛️',
  economy: '💹',
  energy: '⚡',
  agriculture: '🌾',
  defense: '🛡️',
  technology: '🔬',
  diplomacy: '🌐',
  social: '👥',
};

function DepartmentNav({ departments, currentView, onNavigate, onAdvanceTurn, turnPhase, isLoading }) {
  return (
    <div className="department-nav">
      <div className="nav-header">부서 목록</div>
      <div className="nav-list">
        {departments?.map((dept) => (
          <button
            key={dept.id}
            className={`nav-item ${currentView === dept.id ? 'active' : ''}`}
            onClick={() => onNavigate(dept.id)}
            disabled={isLoading || turnPhase !== 'action'}
            data-icon={DEPT_ICONS[dept.id] || '📋'}
          >
            <span className="nav-icon">{DEPT_ICONS[dept.id] || '📋'}</span>
            <span className="nav-text">{dept.name}</span>
          </button>
        ))}
      </div>
      <div className="nav-footer">
        <button
          className="advance-turn-btn"
          onClick={onAdvanceTurn}
          disabled={isLoading || turnPhase !== 'action'}
        >
          <span className="turn-icon">⏭</span>
          <span className="turn-text">{turnPhase === 'action' ? '턴 종료' : '진행 중...'}</span>
        </button>
      </div>
    </div>
  );
}

export default DepartmentNav;
