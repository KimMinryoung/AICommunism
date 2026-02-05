/**
 * 게임 데이터 통합 export
 */
const departments = require('./departments');
const policies = require('./policies');
const events = require('./events');
const endings = require('./endings');
const { simulateTurn, clampResources } = require('./simulation');

const gameData = {
  departments,
  policies,
  events,
  endings,
  simulateTurn,
  clampResources,
};

module.exports = gameData;
