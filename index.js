const top = require('./src/top');
const cli = require('./src/tools/cli');
const analysis = require('./src/tools/analysis');

(() => {
  if (cli.analysis) {
    analysis.runAll();
    return;
  }

  const keys = cli.newKeys ? top.makeKeys() : top.loadKeys();
  const system = top.system(keys);

  if (cli.encrypt) {
    const encrypted = top.encrypt(cli.encrypt, system);
    console.log(encrypted);
  }

  if (cli.decrypt) {
    const decrypted = top.decrypt(cli.decrypt, system);
    console.log(decrypted);
  }

  if (cli.test) {
    console.log(`Source text: ${cli.test}`);

    const encrypted = top.encrypt(cli.test, system);
    console.log(`\nEncrypted text: ${encrypted}`);

    const decrypted = top.decrypt(encrypted, system);
    console.log(`\nDecrypted text: ${decrypted}\n`);
  }
})();
