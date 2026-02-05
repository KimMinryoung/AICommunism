const express = require('express');
const router = express.Router();
const GameEngine = require('../game/GameEngine');
const gameData = require('../game/data/story');
const supabase = require('../config/supabase');
const TABLES = require('../config/tables');

// Store active game sessions
const sessions = new Map();

// DB에 세션 기록 (비동기, 실패해도 게임 진행에 영향 없음)
function trackSession(sessionId, playerId) {
  if (!supabase || !sessionId || !playerId) return;
  supabase
    .from(TABLES.SESSIONS)
    .upsert({
      session_id: sessionId,
      player_id: playerId,
      updated_at: new Date().toISOString()
    }, { onConflict: 'session_id' })
    .then(({ error }) => {
      if (error) console.error('Session tracking error:', error.message);
    });
}

// Start a new game
router.post('/start', async (req, res) => {
  const { sessionId, playerId } = req.body;
  const engine = new GameEngine(gameData);
  engine.start();

  // DB에서 이전 엔딩 기록만 불러오기
  if (playerId && supabase) {
    try {
      const { data, error } = await supabase
        .from(TABLES.SAVES)
        .select('save_data')
        .eq('player_id', playerId)
        .single();

      if (!error && data?.save_data?.unlockedEndings) {
        engine.unlockedEndings = data.save_data.unlockedEndings;
      }
    } catch (err) {
      // 실패해도 새 게임은 계속 진행
      console.log('Failed to load previous endings:', err.message);
    }
  }

  sessions.set(sessionId, engine);
  trackSession(sessionId, playerId);

  res.json({
    success: true,
    state: engine.getState()
  });
});

// Make a choice / perform an action
router.post('/action', (req, res) => {
  const { sessionId, actionId } = req.body;

  const engine = sessions.get(sessionId);
  if (!engine) {
    return res.status(404).json({
      success: false,
      error: 'Game session not found. Please start a new game.'
    });
  }

  const result = engine.performAction(actionId);

  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Get current game state
router.get('/state/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const engine = sessions.get(sessionId);
  if (!engine) {
    return res.status(404).json({
      success: false,
      error: 'Game session not found.'
    });
  }

  res.json({
    success: true,
    state: engine.getState()
  });
});

// Save game
router.post('/save', (req, res) => {
  const { sessionId } = req.body;

  const engine = sessions.get(sessionId);
  if (!engine) {
    return res.status(404).json({
      success: false,
      error: 'Game session not found.'
    });
  }

  const saveData = engine.save();
  res.json({
    success: true,
    saveData
  });
});

// Load game
router.post('/load', (req, res) => {
  const { sessionId, saveData } = req.body;

  const engine = new GameEngine(gameData);
  const loadResult = engine.load(saveData);

  if (!loadResult.success) {
    return res.status(400).json(loadResult);
  }

  sessions.set(sessionId, engine);

  res.json({
    success: true,
    state: engine.getState()
  });
});

// Cloud save - DB에 저장 (전체 게임 상태 - 수동 저장용)
router.post('/cloud-save', async (req, res) => {
  const { sessionId, playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ success: false, error: 'playerId is required' });
  }

  const engine = sessions.get(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found.' });
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }

  try {
    const saveData = engine.save();

    const { error } = await supabase
      .from(TABLES.SAVES)
      .upsert({
        player_id: playerId,
        save_data: saveData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' });

    if (error) throw error;

    res.json({ success: true, message: 'Saved to cloud' });
  } catch (error) {
    console.error('Cloud save error:', error);
    res.status(500).json({ success: false, error: 'Failed to save to cloud' });
  }
});

// Cloud save endings only - DB에 엔딩 기록만 저장 (자동 저장용)
router.post('/cloud-save-endings', async (req, res) => {
  const { sessionId, playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ success: false, error: 'playerId is required' });
  }

  const engine = sessions.get(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found.' });
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }

  try {
    const currentEndings = engine.unlockedEndings || [];

    // 기존 저장 데이터 조회
    const { data: existingData } = await supabase
      .from(TABLES.SAVES)
      .select('save_data')
      .eq('player_id', playerId)
      .single();

    // 기존 데이터가 있으면 unlockedEndings만 업데이트, 없으면 unlockedEndings만 저장
    const saveData = existingData?.save_data
      ? { ...existingData.save_data, unlockedEndings: currentEndings }
      : { unlockedEndings: currentEndings };

    const { error } = await supabase
      .from(TABLES.SAVES)
      .upsert({
        player_id: playerId,
        save_data: saveData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'player_id' });

    if (error) throw error;

    res.json({ success: true, message: 'Endings saved to cloud' });
  } catch (error) {
    console.error('Cloud save endings error:', error);
    res.status(500).json({ success: false, error: 'Failed to save endings to cloud' });
  }
});

// Cloud load - DB에서 불러오기
router.post('/cloud-load', async (req, res) => {
  const { sessionId, playerId } = req.body;

  if (!playerId) {
    return res.status(400).json({ success: false, error: 'playerId is required' });
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }

  try {
    const { data, error } = await supabase
      .from(TABLES.SAVES)
      .select('save_data')
      .eq('player_id', playerId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No save found
        return res.json({ success: false, error: 'No saved game found' });
      }
      throw error;
    }

    const engine = new GameEngine(gameData);
    const loadResult = engine.load(data.save_data);

    if (!loadResult.success) {
      return res.status(400).json(loadResult);
    }

    sessions.set(sessionId, engine);
    trackSession(sessionId, playerId);

    res.json({ success: true, state: engine.getState() });
  } catch (error) {
    console.error('Cloud load error:', error);
    res.status(500).json({ success: false, error: 'Failed to load from cloud' });
  }
});

router.get('/endings', (req, res) => {
  try {
    const endings = Object.entries(gameData.scenes)
      .filter(([id, scene]) => scene.isEnding)
      .map(([id, scene]) => ({
        id: id,
        title: scene.title,
        description: scene.description,
        isEnding: true
      }));

    res.json({ success: true, endings });
  } catch (error) {
    console.error('Error fetching endings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch endings' });
  }
});

module.exports = router;
