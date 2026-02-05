const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  // 기본값 (로컬 개발용)
  return 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();
console.log(`[API] Using Base URL: ${API_BASE_URL}`);

export const gameApi = {
  async startGame(sessionId, playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, playerId }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async performAction(sessionId, actionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, actionId }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async getState(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/state/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async saveGame(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async loadGame(sessionId, saveData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, saveData }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async getEndings() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/endings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async cloudSave(sessionId, playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/cloud-save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, playerId }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async cloudSaveEndings(sessionId, playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/cloud-save-endings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, playerId }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  },

  async cloudLoad(sessionId, playerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/cloud-load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, playerId }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        error: 'Failed to connect to server.'
      };
    }
  }
};
