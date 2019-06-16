const cli = require('./src/cli');
const util = require('./src/util');

module.exports = {
  sourceAlphabet: ` ${util.latinAlphabet}`,
  fsmAlphabet: `ABC${util.latinAlphabet}`,
  fsmStates: 4,
  fsmTransitionFillPercent: 35,
  minCypherLengthPerSourceLetter: 3,
  fsmSavePath: './resources/fsms',
  logging: cli.test !== undefined,
  // logging: true,
};
