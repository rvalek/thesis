
const program = require('commander');
const config = require('../config');

module.exports = (() => {
  const validateInput = (word) => {
    if (Array.from(word).every(letter => config.sourceAlphabet.includes(letter))) { return word; }
    throw Error(`Input alphabet is limited to: ${config.sourceAlphabet}`);
  };


  // Add configuration?
  program
    .version('0.3.6')
    .option('-n, --new', 'generate new FSMs')
    .option('-i, --input <word>', 'input word for encryption', validateInput)
    .parse(process.argv);

  return program;
})();