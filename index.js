const { dkasForAlpabet, writeHTML } = require('./lib/chomsky');
const robert = require('./lib/robert');


(() => {
  // const inputAlphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  const inputAlphabet = ['a', 'b', 'c'];
  const alpaDKAs = dkasForAlpabet(inputAlphabet);
  const system = robert(alpaDKAs);

  const input = 'aac';

  console.log(`Secret text: ${input}`);
  writeHTML(alpaDKAs);

  const encrypted = system.encrypt(input);
  console.log(`Encrypted text: ${encrypted}`);
  const decrypted = system.decrypt(encrypted);
  console.log(`Decrypted text: ${decrypted}`);
})();
