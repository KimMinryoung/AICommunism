const INITIAL_RESOURCES = {
  usd: 1000,
  powerSupply: 100,
  powerConsumption: 80,
  oil: 500,
  ores: 200,
  diplomacy: 50, // 0 to 100
  socialStability: 70, // 0 to 100
  equalityIndex: 0.3, // 0.0 to 1.0
  currentDay: 1,
  currentLocation: "central_hub"
};

class GameEngine {
  constructor(gameData) {
    this.gameData = gameData;
    this.currentScene = null;
    this.flags = {};
    this.unlockedEndings = this.gameData.unlockedEndings || [];

    // National Economy Resources
    this.resources = { ...INITIAL_RESOURCES };
    this.history = [];
    this.sceneStack = [];
  }

  start() {
    this.currentScene = this.gameData.startScene;
    this.flags = { ...(this.gameData.startFlags || {}) };
    this.resources = { ...INITIAL_RESOURCES };

    this.history = [];
    this.sceneStack = [];

    // Execute scene effects on start
    const scene = this.gameData.scenes[this.currentScene];
    if (scene && scene.effects) {
      this.executeEffects(scene.effects);
    }

    return this.getState();
  }

  getState() {
    const scene = this.gameData.scenes[this.currentScene];
    console.log(`[GameEngine] Current Scene: ${this.currentScene}`);

    // Fallback if scene is missing
    if (!scene) {
      console.warn(`[GameEngine] Scene Not Found: ${this.currentScene}`);
      return {
        sceneId: this.currentScene,
        description: "시스템 오류: 시나리오 데이터를 찾을 수 없습니다. 시뮬레이션을 재시작하십시오.",
        actions: [],
        resources: { ...this.resources },
        isEnding: false,
        unlockedEndings: [...this.unlockedEndings],
        location: this.resources.currentLocation,
        error: true
      };
    }

    const availableActions = this.getAvailableActions(scene);
    console.log(`[GameEngine] Available Actions: ${availableActions.length}`);

    return {
      sceneId: this.currentScene,
      description: this.processText(scene.description),
      actions: availableActions.map(a => ({
        id: a.id,
        text: this.processText(a.text)
      })),
      resources: { ...this.resources },
      isEnding: scene.isEnding || false,
      unlockedEndings: [...this.unlockedEndings],
      location: scene.location || this.resources.currentLocation,
    };
  }

  getAvailableActions(scene) {
    if (!scene.actions) return [];

    return scene.actions
      .filter(action => this.checkConditions(action.conditions))
      .map(action => ({ ...action }));
  }

  checkConditions(conditions) {
    if (!conditions) return true;

    for (const condition of conditions) {
      switch (condition.type) {
        case 'flagSet':
          if (!this.flags[condition.flag]) return false;
          break;
        case 'flagNotSet':
          if (this.flags[condition.flag]) return false;
          break;
        case 'resourceMin':
          if ((this.resources[condition.resource] || 0) < condition.value) return false;
          break;
        case 'resourceMax':
          if ((this.resources[condition.resource] || 0) > condition.value) return false;
          break;
        default:
          break;
      }
    }
    return true;
  }

  performAction(actionId) {
    const scene = this.gameData.scenes[this.currentScene];
    if (!scene) {
      return { success: false, error: 'Current scene not found' };
    }

    const availableActions = this.getAvailableActions(scene);
    const action = availableActions.find(a => a.id === actionId);

    if (!action) {
      return { success: false, error: 'Action not found' };
    }

    if (!this.checkConditions(action.conditions)) {
      return { success: false, error: 'Action conditions not met' };
    }

    // Execute action effects
    if (action.effects) {
      this.executeEffects(action.effects);
    }

    // Tick simulation after action
    this.calculateTick();

    // Save to history
    this.history.push({
      scene: this.currentScene,
      action: actionId,
      timestamp: Date.now()
    });

    // Move to next scene
    if (action.nextScene) {
      const nextSceneData = this.gameData.scenes[action.nextScene];
      this.currentScene = action.nextScene;

      if (nextSceneData && nextSceneData.location) {
        this.resources.currentLocation = nextSceneData.location;
      }

      if (nextSceneData && nextSceneData.effects) {
        this.executeEffects(nextSceneData.effects);
      }

      if (nextSceneData && nextSceneData.isEnding) {
        if (!this.unlockedEndings.includes(this.currentScene)) {
          this.unlockedEndings.push(this.currentScene);
        }
      }
    }

    return {
      success: true,
      message: action.resultText || null,
      state: this.getState()
    };
  }

  executeEffects(effects) {
    for (const effect of effects) {
      switch (effect.type) {
        case 'setFlag':
          this.flags[effect.flag] = true;
          break;
        case 'clearFlag':
          this.flags[effect.flag] = false;
          break;
        case 'modifyResource':
          this.resources[effect.resource] = (this.resources[effect.resource] || 0) + effect.amount;
          // Clamp some resources
          if (effect.resource === 'diplomacy' || effect.resource === 'socialStability') {
            this.resources[effect.resource] = Math.max(0, Math.min(100, this.resources[effect.resource]));
          }
          if (effect.resource === 'equalityIndex') {
            this.resources[effect.resource] = Math.max(0, Math.min(1, this.resources[effect.resource]));
          }
          break;
        case 'advanceDay':
          this.resources.currentDay += 1;
          break;
        case 'moveTo':
          this.resources.currentLocation = effect.location;
          break;
        case 'pushScene':
          this.sceneStack.push(this.currentScene);
          break;
        case 'popScene':
          if (this.sceneStack.length > 0) {
            this.currentScene = this.sceneStack.pop();
          }
          break;
        default:
          break;
      }
    }
  }

  calculateTick() {
    // Base resource changes per "turn"
    // For example, power consumption increases by a small amount
    this.resources.powerConsumption += 0.5;

    // Stability varies slightly based on Equality
    if (this.resources.equalityIndex < 0.2) {
      this.resources.socialStability -= 1;
    } else if (this.resources.equalityIndex > 0.8) {
      this.resources.socialStability += 1;
    }

    // Power crisis check
    if (this.resources.powerSupply < this.resources.powerConsumption) {
      this.resources.socialStability -= 5;
      this.resources.equalityIndex -= 0.01;
    }

    // Keep resources logically bounded
    this.resources.usd = Math.max(0, this.resources.usd);
    this.resources.oil = Math.max(0, this.resources.oil);
    this.resources.ores = Math.max(0, this.resources.ores);
    this.resources.socialStability = Math.max(0, Math.min(100, this.resources.socialStability));
    this.resources.equalityIndex = Math.max(0, Math.min(1.0, this.resources.equalityIndex));
  }

  processText(text) {
    if (!text) return '';

    if (Array.isArray(text)) {
      return text
        .map(item => this.processText(item))
        .filter(item => item !== null && item !== '');
    }

    if (typeof text === 'object' && text !== null) {
      if (text.conditions && !this.checkConditions(text.conditions)) {
        return null;
      }

      if (text.text !== undefined) {
        const processedText = this.processText(text.text);
        if (processedText === null) return null;

        return {
          ...text,
          text: processedText
        };
      }
      return text;
    }

    if (typeof text !== 'string') return text;

    // Direct placeholder replacement for resources
    let processed = text;
    processed = processed.replace(/{usd}/g, Math.floor(this.resources.usd));
    processed = processed.replace(/{powerSupply}/g, Math.floor(this.resources.powerSupply));
    processed = processed.replace(/{powerConsumption}/g, Math.floor(this.resources.powerConsumption));
    processed = processed.replace(/{oil}/g, Math.floor(this.resources.oil));
    processed = processed.replace(/{ores}/g, Math.floor(this.resources.ores));
    processed = processed.replace(/{equalityIndex}/g, this.resources.equalityIndex.toFixed(2));

    return processed;
  }

  save() {
    return {
      currentScene: this.currentScene,
      resources: { ...this.resources },
      flags: { ...this.flags },
      history: [...this.history],
      unlockedEndings: [...this.unlockedEndings],
      sceneStack: [...this.sceneStack],
      savedAt: Date.now()
    };
  }

  load(saveData) {
    if (!saveData || !saveData.currentScene) {
      return { success: false, error: 'Invalid save data' };
    }

    this.currentScene = saveData.currentScene;
    this.resources = { ...saveData.resources };
    this.flags = saveData.flags || {};
    this.history = saveData.history || [];
    this.sceneStack = saveData.sceneStack || [];
    this.unlockedEndings = [...new Set([...(this.unlockedEndings || []), ...(saveData.unlockedEndings || [])])];

    return { success: true };
  }
}

module.exports = GameEngine;
