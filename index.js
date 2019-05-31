
const crypt = require('./src/crypt');
const io = require('./src/io');
const config = require('./config');
const cli = require('./src/cli');
const machines = require('./src/machines');


(() => {
  const input = cli.input || 'accba';

  const system = crypt(cli.new
    ? io.save(config.fsmSavePath, machines.forAlphabet(config.sourceAlphabet))
    : io.read(config.fsmSavePath));

  const encrypted = system.encrypt(input);
  const decrypted = system.decrypt(encrypted);

  console.log(`Secret text: ${input}`);
  console.log(`Encrypted text: ${encrypted}`);
  console.log(`Decrypted text: ${decrypted}`);
})();
