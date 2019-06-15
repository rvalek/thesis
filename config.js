const cli = require('./src/cli');

module.exports = {
  sourceAlphabet: typeof cli.newKeys === 'string' ? cli.newKeys : ' abcdefghijklmnopqrstuvwxyz',
  fsmAlphabet: 'abcdefghijklmnopqrstuvwxyzABC',
  fsmStates: 4,
  minCypherLengthPerSourceLetter: 3,
  fsmSavePath: './resources/fsms',
  logging: cli.test !== undefined,
  // logging: true,
};
