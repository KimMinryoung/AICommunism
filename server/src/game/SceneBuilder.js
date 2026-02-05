/**
 * SceneBuilder - Simplified version for AI Communism
 */

let actionCounter = 0;
let currentSceneId = "";

const sceneDefinitions = new Map();

/**
 * Parsing script lines into narration objects.
 * Simple version for AI Communism.
 */
const parseScript = (lines) => {
  if (!lines || !Array.isArray(lines)) return [];
  return lines.map(line => {
    if (typeof line !== 'string') return line;
    return { type: "narration", text: line };
  });
};

const internalBake = (sceneId, options, actionsGenerator) => {
  SB.beginScene(sceneId);

  const description = parseScript(options.description || []);
  const logicActions = actionsGenerator ? actionsGenerator() : [];

  const mergedActions = logicActions.map((act) => {
    return {
      ...act,
      text: act.text || "[Missing Text]"
    };
  });

  const scene = {
    location: options.location || "unknown",
    description,
    actions: mergedActions
  };

  if (options.effects) scene.effects = options.effects;
  if (options.isEnding) scene.isEnding = true;

  return { [sceneId]: scene };
};

const SB = {
  beginScene: (sceneId) => {
    currentSceneId = sceneId;
    actionCounter = 0;
  },

  // ===== Helpers =====
  cond: {
    flag: (flag) => ({ type: 'flagSet', flag }),
    notFlag: (flag) => ({ type: 'flagNotSet', flag }),
    resMin: (resource, value) => ({ type: 'resourceMin', resource, value }),
    resMax: (resource, value) => ({ type: 'resourceMax', resource, value }),
  },

  eff: {
    flag: (flag) => ({ type: 'setFlag', flag }),
    unflag: (flag) => ({ type: 'clearFlag', flag }),
    modRes: (resource, amount) => ({ type: 'modifyResource', resource, amount }),
    advanceDay: () => ({ type: 'advanceDay' }),
    moveTo: (location) => ({ type: 'moveTo', location }),
    push: () => ({ type: 'pushScene' }),
    pop: () => ({ type: 'popScene' }),
  },

  actionWithText: (text, nextScene, conditions = [], effects = []) => {
    actionCounter++;
    return {
      id: `${currentSceneId}_act_${actionCounter}`,
      text,
      nextScene,
      conditions,
      effects
    };
  },

  defineScene: (sceneId, optionsOrActions, actionsFn) => {
    let options = {};
    let actionsGenerator;

    if (typeof optionsOrActions === 'function') {
      actionsGenerator = optionsOrActions;
    } else {
      options = optionsOrActions || {};
      actionsGenerator = actionsFn || (typeof options.actions === 'function' ? options.actions : undefined);
    }

    sceneDefinitions.set(sceneId, { options, actionsGenerator });
    return internalBake(sceneId, options, actionsGenerator);
  },

  rebuildAll: () => {
    const allScenes = {};
    for (const [id, def] of sceneDefinitions.entries()) {
      Object.assign(allScenes, internalBake(id, def.options, def.actionsGenerator));
    }
    return allScenes;
  },

  initTextData: () => { /* No-op for compatibility */ }
};

module.exports = SB;
