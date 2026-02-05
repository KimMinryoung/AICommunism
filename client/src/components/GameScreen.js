import React from 'react';
import ResourceBar from './ResourceBar';
import DepartmentNav from './DepartmentNav';
import DashboardView from './DashboardView';
import DepartmentView from './DepartmentView';
import TurnReportView from './TurnReportView';
import StatusSidebar from './StatusSidebar';
import DialogueBox from './DialogueBox';

function GameScreen({
  gameState,
  onNavigate,
  onTogglePolicy,
  onEnactPolicy,
  onAdvanceTurn,
  onResolveEvent,
  onDismissReport,
  onSave,
  onLoad,
  onRestart,
  isLoading,
  message,
}) {
  const {
    resources,
    activePolicies,
    turnPhase,
    currentView,
    currentTurn,
    currentYear,
    currentMonth,
    departments,
    currentDepartment,
    policies,
    currentEvent,
    turnReport,
    dialogue,
    isEnding,
    endingData,
    notifications,
  } = gameState || {};

  const renderMainContent = () => {
    // 엔딩 도달
    if (isEnding && endingData) {
      return (
        <div className="ending-view">
          <div className={`ending-badge ${endingData.type}`}>
            {endingData.type === 'victory' ? '승리' : endingData.type === 'defeat' ? '패배' : '특수'} 엔딩
          </div>
          <h2 className="ending-title">{endingData.title}</h2>
          <p className="ending-description">{endingData.description}</p>
        </div>
      );
    }

    // 턴 보고서
    if (turnPhase === 'report') {
      return (
        <TurnReportView
          turnReport={turnReport}
          resources={resources}
          onDismiss={onDismissReport}
          isLoading={isLoading}
        />
      );
    }

    // 이벤트 처리 중
    if (turnPhase === 'event' && currentEvent) {
      return (
        <div className="event-view">
          <div className="event-header">
            <span className="event-badge">긴급 보고</span>
            <h2 className="event-title">{currentEvent.name}</h2>
          </div>
        </div>
      );
    }

    // 일반 부서 뷰
    if (currentView === 'central_command') {
      return (
        <DashboardView
          resources={resources}
          activePolicies={activePolicies}
        />
      );
    }

    return (
      <DepartmentView
        department={currentDepartment}
        policies={policies}
        onTogglePolicy={onTogglePolicy}
        onEnactPolicy={onEnactPolicy}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div className="game-screen">
      <div className="crt-overlay" />

      <div className="game-header">
        <div className="game-status-hud">
          <span>턴 {currentTurn || 1}</span>
          <span>{currentYear || 2045}년 {currentMonth || 1}월</span>
        </div>
        <div className="header-buttons">
          <button className="btn-secondary" onClick={onRestart} disabled={isLoading}>다시 시작</button>
          <button className="btn-secondary" onClick={onSave} disabled={isLoading}>보안 저장</button>
          <button className="btn-secondary" onClick={onLoad} disabled={isLoading}>기록 소환</button>
        </div>
      </div>

      <ResourceBar resources={resources} />

      {message && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="main-layout">
        <DepartmentNav
          departments={departments}
          currentView={currentView}
          onNavigate={onNavigate}
          onAdvanceTurn={onAdvanceTurn}
          turnPhase={turnPhase}
          isLoading={isLoading}
        />

        <div className="game-content">
          {renderMainContent()}
        </div>

        <StatusSidebar
          resources={resources}
          notifications={notifications}
        />
      </div>

      <DialogueBox
        dialogue={dialogue}
        currentEvent={turnPhase === 'event' ? currentEvent : null}
        onResolveEvent={onResolveEvent}
        isLoading={isLoading}
      />
    </div>
  );
}

export default GameScreen;
