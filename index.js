const {
  dkasForAlphabet, writeHTML, saveJSON, readJSON,
} = require('./lib/chomsky');
const robert = require('./lib/robert');


(() => {
  // const inputAlphabet = 'abcdefghijklmnopqrstuvwxyz';
  const inputAlphabet = ['a', 'b', 'c', 'd', 'e'];
  let alphaDKAs;

  const newDKAs = false;
  if (newDKAs) {
    alphaDKAs = dkasForAlphabet(inputAlphabet);
    saveJSON(alphaDKAs);
    writeHTML(alphaDKAs);
  } else {
    alphaDKAs = readJSON();
  }


  const system = robert(alphaDKAs);

  const input = 'accba';

  console.log(`Secret text: ${input}`);

  const encrypted = system.encrypt(input);
  console.log(`Encrypted text: ${encrypted}`);
  const decrypted = system.decrypt(encrypted);
  console.log(`Decrypted text: ${decrypted}`);
})();
