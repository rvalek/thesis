
const program = require('commander');
const config = require('../config');

module.exports = (() => {
  const validateInput = (word) => {
    if (Array.from(word).every(letter => config.sourceAlphabet.includes(letter))) { return word; }
    throw Error(`Input alphabet is limited to: ${config.sourceAlphabet}`);
  };

  program
  // .version('0.1.0')
    .option('-n, --new', 'Generate new FSMs')
    .option('-i, --input <word>', 'Input word for encryption', validateInput)
    .parse(process.argv);

  return program;
})();
