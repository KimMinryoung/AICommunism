import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameScreen from './components/GameScreen';
import StartScreen from './components/StartScreen';
import { gameApi } from './api/gameApi';
import './App.css';

function App() {
  const [gameState, setGameState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  // 브라우저 고유 ID - localStorage에 영구 저장
  const [playerId] = useState(() => {
    const stored = localStorage.getItem('playerId');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('playerId', newId);
    return newId;
  });

  // 이전 unlockedEndings 추적 (엔딩 도달 감지용)
  const prevUnlockedEndingsRef = useRef([]);

  const [endingCollection, setEndingCollection] = useState([]);
  useEffect(() => {
    const fetchEndings = async () => {
      const result = await gameApi.getEndings();
      if (result.success) {
        setEndingCollection(result.endings);
      } else {
        console.error("Failed to load endings:", result.error);
      }
    };

    fetchEndings();
  }, []);

  const startGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gameApi.startGame(sessionId, playerId);
      if (result.success) {
        setGameState(result.state);
        prevUnlockedEndingsRef.current = result.state.unlockedEndings || [];
        setMessage(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '게임 시작 실패. 서버 접속 오류' });
    }
    setIsLoading(false);
  }, [sessionId, playerId]);

  const performAction = useCallback(async (actionId) => {
    setIsLoading(true);
    try {
      const result = await gameApi.performAction(sessionId, actionId);
      if (result.success) {
        if (result.message) {
          setMessage({ type: 'info', text: result.message });
        } else {
          setMessage(null);
        }
        setGameState(result.state);

        // 새 엔딩 도달 시 엔딩 기록만 자동 저장 (게임 상태는 저장 안 함)
        const prevEndings = prevUnlockedEndingsRef.current;
        const newEndings = result.state.unlockedEndings || [];
        if (newEndings.length > prevEndings.length) {
          prevUnlockedEndingsRef.current = newEndings;
          // 백그라운드로 엔딩 기록만 클라우드 저장 (UI 블로킹 안 함)
          gameApi.cloudSaveEndings(sessionId, playerId).then(saveResult => {
            if (saveResult.success) {
              console.log('Auto-saved endings only');
            }
          });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: '게임 진행 실패. 오류 발생' });
    }
    setIsLoading(false);
  }, [sessionId, playerId]);

  const saveGame = useCallback(async () => {
    try {
      // 클라우드 저장 시도
      const cloudResult = await gameApi.cloudSave(sessionId, playerId);

      // localStorage 백업도 함께 저장
      const localResult = await gameApi.saveGame(sessionId);
      if (localResult.success) {
        localStorage.setItem('textAdventureSave', JSON.stringify(localResult.saveData));
      }

      if (cloudResult.success) {
        setMessage({ type: 'success', text: '게임 저장됨!' });
      } else {
        // 클라우드 실패 시 로컬만 저장됨
        setMessage({ type: 'success', text: '게임 저장됨 (로컬)' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장을 실패했다.' });
    }
  }, [sessionId, playerId]);

  const loadGame = useCallback(async () => {
    setIsLoading(true);
    try {
      // 클라우드에서 먼저 시도
      const cloudResult = await gameApi.cloudLoad(sessionId, playerId);
      if (cloudResult.success) {
        setGameState(cloudResult.state);
        prevUnlockedEndingsRef.current = cloudResult.state.unlockedEndings || [];
        setMessage({ type: 'success', text: '게임을 불러왔다!' });
        setIsLoading(false);
        return;
      }

      // 클라우드 실패 시 localStorage 시도
      const saveData = localStorage.getItem('textAdventureSave');
      if (!saveData) {
        setMessage({ type: 'error', text: '저장된 데이터가 없다.' });
        setIsLoading(false);
        return;
      }

      const localResult = await gameApi.loadGame(sessionId, JSON.parse(saveData));
      if (localResult.success) {
        setGameState(localResult.state);
        prevUnlockedEndingsRef.current = localResult.state.unlockedEndings || [];
        setMessage({ type: 'success', text: '게임을 불러왔다! (로컬)' });
      } else {
        setMessage({ type: 'error', text: '불러오기 실패.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '불러오기 실패.' });
    }
    setIsLoading(false);
  }, [sessionId, playerId]);

  return (
    <div className="app">
      {!gameState ? (
        <StartScreen
          onStartGame={startGame}
          onLoadGame={loadGame}
          isLoading={isLoading}
          message={message}
        />
      ) : (
        <GameScreen
          gameState={gameState}
          onAction={performAction}
          onSave={saveGame}
          onLoad={loadGame}
          onRestart={startGame}
          isLoading={isLoading}
          message={message}
          endingCollection={endingCollection}
        />
      )}
    </div>
  );
}

export default App;
