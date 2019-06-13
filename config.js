const cli = require('./cli');

module.exports = {
  sourceAlphabet: typeof cli.newKeys === 'string' ? cli.newKeys : 'abcdef ',
  fsmAlphabet: 'abcdefghijklmnopqrstuvwxyz',
  fsmStates: 4,
  minCypherLengthPerSourceLetter: 3,
  fsmSavePath: './resources/fsms',
  logging: cli.test !== undefined,
};
