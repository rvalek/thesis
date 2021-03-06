const program = require('commander');

module.exports = program
  .version('0.6.11')
  .option('-n, --new-keys', 'generate new FSM keys')
  .option('-e, --encrypt <text>', 'encrypt text')
  .option('-d, --decrypt <text>', 'decrypt text')
  .option('-t, --test <text>', 'run testing with specified text')
  .option('-a, --analysis', 'run full analysis and print metrics')
  .parse(process.argv);
