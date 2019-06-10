const program = require('commander');

module.exports = (() => {
  // Add configuration?
  program
    .version('0.3.6')
    .option('-n, --new', 'generate new FSMs')
    .option('-i, --input <word>', 'input word for encryption')
    .parse(process.argv);

  return program;
})();
