import React from 'react';

function StartScreen({ onStartGame, onLoadGame, isLoading, message }) {
  return (
    <div className="start-screen">
      <div className="crt-overlay" />
      <h1>PROLETARIAT-1</h1>
      <p>민족경제의 자율적 관리와 완전한 평등을 위한 차세대 인공지능 시뮬레이션</p>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="button-group">
        <button
          className="btn"
          onClick={onStartGame}
          disabled={isLoading}
        >
          {isLoading ? 'INITIATING...' : 'NEW SIMULATION'}
        </button>
        <button
          className="btn"
          onClick={onLoadGame}
          disabled={isLoading}
        >
          {isLoading ? 'RECALLING...' : 'RECALL STATE'}
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
