const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

async function postJson(path, body) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Failed to connect to server.' };
  }
}

async function getJson(path) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return await response.json();
  } catch (error) {
    return { success: false, error: 'Failed to connect to server.' };
  }
}

export const gameApi = {
  startGame(sessionId, playerId) {
    return postJson('/api/game/start', { sessionId, playerId });
  },

  navigateDepartment(sessionId, departmentId) {
    return postJson('/api/game/navigate', { sessionId, departmentId });
  },

  togglePolicy(sessionId, policyId) {
    return postJson('/api/game/toggle-policy', { sessionId, policyId });
  },

  enactPolicy(sessionId, policyId) {
    return postJson('/api/game/enact-policy', { sessionId, policyId });
  },

  advanceTurn(sessionId) {
    return postJson('/api/game/advance-turn', { sessionId });
  },

  resolveEvent(sessionId, choiceId) {
    return postJson('/api/game/resolve-event', { sessionId, choiceId });
  },

  dismissReport(sessionId) {
    return postJson('/api/game/dismiss-report', { sessionId });
  },

  getState(sessionId) {
    return getJson(`/api/game/state/${sessionId}`);
  },

  saveGame(sessionId) {
    return postJson('/api/game/save', { sessionId });
  },

  loadGame(sessionId, saveData) {
    return postJson('/api/game/load', { sessionId, saveData });
  },

  getEndings() {
    return getJson('/api/game/endings');
  },

  cloudSave(sessionId, playerId) {
    return postJson('/api/game/cloud-save', { sessionId, playerId });
  },

  cloudSaveEndings(sessionId, playerId) {
    return postJson('/api/game/cloud-save-endings', { sessionId, playerId });
  },

  cloudLoad(sessionId, playerId) {
    return postJson('/api/game/cloud-load', { sessionId, playerId });
  },
};
