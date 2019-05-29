const chom = require('./lib/chomsky');
const robert = require('./lib/robert');


(() => {
  const newDKAs = false;

  // const inputAlphabet = 'abcdefghijklmnopqrstuvwxyz';
  const inputAlphabet = ['a', 'b', 'c', 'd', 'e'];
  let alphaDKAs;
  if (newDKAs) {
    alphaDKAs = chom.dkasForAlphabet(inputAlphabet);
    chom.saveJSON(alphaDKAs);
    chom.writeHTML(alphaDKAs);
  } else {
    alphaDKAs = chom.readJSON();
  }
  const system = robert(alphaDKAs);


  const input = 'accba';
  console.log(`Secret text: ${input}`);

  const encrypted = system.encrypt(input);
  console.log(`Encrypted text: ${encrypted}`);
  const decrypted = system.decrypt(encrypted);
  console.log(`Decrypted text: ${decrypted}`);
})();
