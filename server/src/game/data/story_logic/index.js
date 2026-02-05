const SB = require('../../SceneBuilder');

// AI Communism Scenes
require('./ai_communism.js');

const gameData = {
  startScene: "entrance",
  startInventory: [],
  startFlags: {},
  scenes: SB.rebuildAll()
};

gameData.reinitialize = () => {
  gameData.scenes = SB.rebuildAll();
};

module.exports = gameData;
