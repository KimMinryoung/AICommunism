const express = require('express');
const router = express.Router();
const GameEngine = require('../game/GameEngine');
const endingsData = require('../game/data/endings');
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

function getEngine(sessionId) {
  return sessions.get(sessionId);
}

// Start a new game
router.post('/start', async (req, res) => {
  const { sessionId, playerId } = req.body;
  const engine = new GameEngine();
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

// Navigate to a department
router.post('/navigate', (req, res) => {
  const { sessionId, departmentId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found. Please start a new game.' });
  }

  const result = engine.navigateTo(departmentId);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Toggle a policy on/off
router.post('/toggle-policy', (req, res) => {
  const { sessionId, policyId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found. Please start a new game.' });
  }

  const result = engine.togglePolicy(policyId);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Enact a one-time policy
router.post('/enact-policy', (req, res) => {
  const { sessionId, policyId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found. Please start a new game.' });
  }

  const result = engine.enactPolicy(policyId);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Advance turn (end turn → simulation → events)
router.post('/advance-turn', (req, res) => {
  const { sessionId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found. Please start a new game.' });
  }

  const result = engine.advanceTurn();
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Resolve an event choice
router.post('/resolve-event', (req, res) => {
  const { sessionId, choiceId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found. Please start a new game.' });
  }

  const result = engine.resolveEvent(choiceId);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Dismiss turn report
router.post('/dismiss-report', (req, res) => {
  const { sessionId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found. Please start a new game.' });
  }

  const result = engine.dismissReport();
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});

// Get current game state
router.get('/state/:sessionId', (req, res) => {
  const { sessionId } = req.params;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found.' });
  }

  res.json({
    success: true,
    state: engine.getState()
  });
});

// Save game
router.post('/save', (req, res) => {
  const { sessionId } = req.body;

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found.' });
  }

  const saveData = engine.save();
  res.json({ success: true, saveData });
});

// Load game
router.post('/load', (req, res) => {
  const { sessionId, saveData } = req.body;

  const engine = new GameEngine();
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

  const engine = getEngine(sessionId);
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

  const engine = getEngine(sessionId);
  if (!engine) {
    return res.status(404).json({ success: false, error: 'Game session not found.' });
  }

  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Database not configured' });
  }

  try {
    const currentEndings = engine.unlockedEndings || [];

    const { data: existingData } = await supabase
      .from(TABLES.SAVES)
      .select('save_data')
      .eq('player_id', playerId)
      .single();

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
        return res.json({ success: false, error: 'No saved game found' });
      }
      throw error;
    }

    const engine = new GameEngine();
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
    const endings = Object.values(endingsData).map(ending => ({
      id: ending.id,
      title: ending.title,
      type: ending.type,
      description: ending.description,
    }));

    res.json({ success: true, endings });
  } catch (error) {
    console.error('Error fetching endings:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch endings' });
  }
});

module.exports = router;
