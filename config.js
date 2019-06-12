const cli = require('./cli');

module.exports = {
  sourceAlphabet: 'abcdef ',
  fsmAlphabet: 'abcdefghijklmnopqrstuvwxyz',
  fsmStates: 4,
  minCypherLengthPerSourceLetter: 3,
  fsmSavePath: './resources/fsms',
  logging: cli.test !== undefined,
};
