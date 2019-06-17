const util = require('./src/tools/util');

module.exports = {
  sourceAlphabet: ` ${util.latinAlphabet}`,
  fsmAlphabet: `A${util.latinAlphabet}`,
  fsmStates: 4,
  fsmTransitionFillPercent: 35,
  minCypherLengthPerSourceLetter: 3,
  fsmSavePath: './resources/fsms',
  logging: true,
};
