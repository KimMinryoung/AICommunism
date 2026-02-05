import React from 'react';

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
          >
            {dept.name}
          </button>
        ))}
      </div>
      <div className="nav-footer">
        <button
          className="advance-turn-btn"
          onClick={onAdvanceTurn}
          disabled={isLoading || turnPhase !== 'action'}
        >
          {turnPhase === 'action' ? '턴 종료' : '진행 중...'}
        </button>
      </div>
    </div>
  );
}

export default DepartmentNav;
