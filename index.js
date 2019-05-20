const { dkasForAlpabet, writeHTML } = require('./lib/chomsky');
const robert = require('./lib/robert');


(() => {
  // const inputAlphabet = 'abcdefghijklmnopqrstuvwxyz';
  const inputAlphabet = ['a', 'b', 'c', 'd', 'e'];
  const alpaDKAs = dkasForAlpabet(inputAlphabet);
  const system = robert(alpaDKAs);

  const input = 'accba';

  console.log(`Secret text: ${input}`);
  writeHTML(alpaDKAs);

  const encrypted = system.encrypt(input);
  console.log(`Encrypted text: ${encrypted}`);
  const decrypted = system.decrypt(encrypted);
  console.log(`Decrypted text: ${decrypted}`);
})();
