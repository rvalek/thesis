const { makeDKA, randomWord, isWordAccepted } = require('./chomsky');

(() => {
  const inputAlpabet = ['a', 'b', 'c', 'd', 'e'];

  const letterToDKA = letters => letters.reduce(
    (acc, letter) => ({ ...acc, [letter]: makeDKA() }), {},
  );
  const DKAs = letterToDKA(inputAlpabet);

  const C = secretText => Array.from(secretText).map(
    letter => randomWord(DKAs[letter]),
  );

  const D = (cypheredText) => {
    const allDKAs = Object.entries(DKAs);
    const decypheredText = cypheredText.map(word => allDKAs.reduce(
      (acc, [letter, dka]) => (isWordAccepted(dka, word) ? acc + letter : acc), '',
    ));

    return decypheredText;
  };


  const input = 'abcc';
  const cyphered = C(input);
  const decyphered = D(cyphered);

  console.log(input);
  // console.log(cyphered);
  console.log(decyphered);
  // console.log(acceptingCells);
})();
