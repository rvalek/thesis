const program = require('commander');
const crypt = require('./src/crypt');
const io = require('./src/fsm_io');
const config = require('./config');


const validateInput = (word) => {
  if (Array.from(word).every(letter => config.sourceAlphabet.includes(letter))) { return word; }
  throw Error(`Input alphabet is limited to: ${config.sourceAlphabet}`);
};

program
  // .version('0.1.0')
  .option('-g, --generate', 'Generate new FSMs')
  .option('-i, --input <word>', 'Input word for encryption', validateInput)
  .parse(process.argv);


(() => {
  const input = program.input || 'accba';

  const system = crypt(program.generate ? io.generate() : io.read());

  const encrypted = system.encrypt(input);
  const decrypted = system.decrypt(encrypted);

  console.log(`Secret text: ${input}`);
  console.log(`Encrypted text: ${encrypted}`);
  console.log(`Decrypted text: ${decrypted}`);
})();
