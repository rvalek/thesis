
const crypt = require('./src/crypt');
const config = require('./config');
const cli = require('./cli');
const machines = require('./src/machines');
const util = require('./src/util');


(() => {
  let keys;
  if (cli.new) {
    keys = machines.generate(config.sourceAlphabet, config.fsmAlphabet, config.fsmStates);
    util.writeJSON(config.fsmSavePath, keys);
    util.writeHTML(config.fsmSavePath, machines.toHtml(keys));
  } else {
    keys = util.readJSON(config.fsmSavePath);
    util.matchesAlphabet(Object.keys(keys), config.sourceAlphabet);
    util.matchesAlphabet(keys[config.sourceAlphabet[0]].alphabet, config.fsmAlphabet);
  }

  const system = crypt(keys);

  if (cli.encrypt) {
    const input = cli.encrypt;
    util.matchesAlphabet(input, config.sourceAlphabet);
    const encrypted = system.encrypt(input);
    console.log(encrypted);
  }

  if (cli.decrypt) {
    const input = cli.decrypt;
    util.matchesAlphabet(input, config.fsmAlphabet);
    const decrypted = system.decrypt(input);
    console.log(decrypted);
  }

  if (cli.test) {
    const input = cli.test;
    util.matchesAlphabet(input, config.sourceAlphabet);
    const encrypted = system.encrypt(input);
    console.log(`Source text: ${input}`);
    console.log(`Encrypted text: ${encrypted}`);

    util.matchesAlphabet(input, config.fsmAlphabet);
    const decrypted = system.decrypt(encrypted);
    console.log(`Decrypted text: ${decrypted}`);
  }
})();
