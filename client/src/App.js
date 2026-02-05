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

  const [playerId] = useState(() => {
    const stored = localStorage.getItem('playerId');
    if (stored) return stored;
    const newId = crypto.randomUUID();
    localStorage.setItem('playerId', newId);
    return newId;
  });

  const prevUnlockedEndingsRef = useRef([]);

  const [endingCollection, setEndingCollection] = useState([]);
  useEffect(() => {
    const fetchEndings = async () => {
      const result = await gameApi.getEndings();
      if (result.success) {
        setEndingCollection(result.endings);
      }
    };
    fetchEndings();
  }, []);

  const handleResult = useCallback((result) => {
    if (result.success) {
      setGameState(result.state);

      // 엔딩 자동 저장
      const prevEndings = prevUnlockedEndingsRef.current;
      const newEndings = result.state.unlockedEndings || [];
      if (newEndings.length > prevEndings.length) {
        prevUnlockedEndingsRef.current = newEndings;
        gameApi.cloudSaveEndings(sessionId, playerId);
      }
    }
    return result;
  }, [sessionId, playerId]);

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

  const navigateDepartment = useCallback(async (departmentId) => {
    setIsLoading(true);
    try {
      const result = await gameApi.navigateDepartment(sessionId, departmentId);
      handleResult(result);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: '부서 이동 실패' });
    }
    setIsLoading(false);
  }, [sessionId, handleResult]);

  const togglePolicy = useCallback(async (policyId) => {
    setIsLoading(true);
    try {
      const result = await gameApi.togglePolicy(sessionId, policyId);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || '정책 변경 실패' });
      } else {
        handleResult(result);
        setMessage(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '정책 변경 실패' });
    }
    setIsLoading(false);
  }, [sessionId, handleResult]);

  const enactPolicy = useCallback(async (policyId) => {
    setIsLoading(true);
    try {
      const result = await gameApi.enactPolicy(sessionId, policyId);
      if (!result.success) {
        setMessage({ type: 'error', text: result.error || '정책 실행 실패' });
      } else {
        handleResult(result);
        setMessage(null);
      }
    } catch (error) {
      setMessage({ type: 'error', text: '정책 실행 실패' });
    }
    setIsLoading(false);
  }, [sessionId, handleResult]);

  const advanceTurn = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gameApi.advanceTurn(sessionId);
      handleResult(result);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: '턴 진행 실패' });
    }
    setIsLoading(false);
  }, [sessionId, handleResult]);

  const resolveEvent = useCallback(async (choiceId) => {
    setIsLoading(true);
    try {
      const result = await gameApi.resolveEvent(sessionId, choiceId);
      handleResult(result);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: '이벤트 처리 실패' });
    }
    setIsLoading(false);
  }, [sessionId, handleResult]);

  const dismissReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await gameApi.dismissReport(sessionId);
      handleResult(result);
      setMessage(null);
    } catch (error) {
      setMessage({ type: 'error', text: '보고서 확인 실패' });
    }
    setIsLoading(false);
  }, [sessionId, handleResult]);

  const saveGame = useCallback(async () => {
    try {
      const cloudResult = await gameApi.cloudSave(sessionId, playerId);
      const localResult = await gameApi.saveGame(sessionId);
      if (localResult.success) {
        localStorage.setItem('textAdventureSave', JSON.stringify(localResult.saveData));
      }
      if (cloudResult.success) {
        setMessage({ type: 'success', text: '게임 저장됨!' });
      } else {
        setMessage({ type: 'success', text: '게임 저장됨 (로컬)' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '저장을 실패했다.' });
    }
  }, [sessionId, playerId]);

  const loadGame = useCallback(async () => {
    setIsLoading(true);
    try {
      const cloudResult = await gameApi.cloudLoad(sessionId, playerId);
      if (cloudResult.success) {
        setGameState(cloudResult.state);
        prevUnlockedEndingsRef.current = cloudResult.state.unlockedEndings || [];
        setMessage({ type: 'success', text: '게임을 불러왔다!' });
        setIsLoading(false);
        return;
      }

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
          onNavigate={navigateDepartment}
          onTogglePolicy={togglePolicy}
          onEnactPolicy={enactPolicy}
          onAdvanceTurn={advanceTurn}
          onResolveEvent={resolveEvent}
          onDismissReport={dismissReport}
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
