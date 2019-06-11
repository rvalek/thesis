
const crypt = require('./src/crypt');
const config = require('./config');
const cli = require('./cli');
const machines = require('./src/machines');
const util = require('./src/util');


(() => {
  const input = cli.input || 'accba';
  util.validateInput(input);

  let keys;
  if (cli.new) {
    keys = machines.generate(config.sourceAlphabet);
    util.writeJSON(config.fsmSavePath, keys);
    util.writeHTML(config.fsmSavePath, machines.toHtml(keys));
  } else {
    keys = util.readJSON(config.fsmSavePath);
  }

  const system = crypt(keys);

  const encrypted = system.encrypt(input);
  const decrypted = system.decrypt(encrypted);

  console.log(`Secret text: ${input}`);
  console.log(`Encrypted text: ${encrypted}`);
  console.log(`Decrypted text: ${decrypted}`);
})();
