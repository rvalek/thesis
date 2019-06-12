const program = require('commander');

module.exports = (() => {
  program
    .version('0.4.11')
    .option('-n, --new', 'generate new FSM keys')
    .option('-e, --encrypt <text>', 'encrypt text')
    .option('-d, --decrypt <text>', 'decrypt text')
    .option('-t, --test <text>', 'run full test on text')
    .parse(process.argv);

  return program;
})();
