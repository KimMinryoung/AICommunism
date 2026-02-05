import React from 'react';

function StartScreen({ onStartGame, onLoadGame, isLoading, message }) {
  return (
    <div className="start-screen">
      <div className="crt-overlay" />
      <h1>새별</h1>
      <p>조선민족의 얼을 담은 자율적 경제 기술 혁명 시뮬레이션</p>

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
          {isLoading ? '연산 개시...' : '새로운 주체 연산'}
        </button>
        <button
          className="btn"
          onClick={onLoadGame}
          disabled={isLoading}
        >
          {isLoading ? '기록 소환 중...' : '기록 소환'}
        </button>
      </div>
    </div>
  );
}

export default StartScreen;
