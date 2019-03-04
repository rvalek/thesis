const { fsm } = require('./noam');

(() => {
  const inputAlpabet = ['a', 'b', 'c', 'd', 'e'];

  const acceptingCells = new Set();
  const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];
  const chooseAcceptingCell = (dka) => {
    const symbol = getRandomElement(dka.alphabet);
    const state = getRandomElement(dka.states);
    const cell = `${symbol}:${state}`;

    if (acceptingCells.has(cell)) return chooseAcceptingCell(dka);

    acceptingCells.add(cell);

    return { symbol, state, cell };
  };

  const makeDKA = (alphabetSize = 40, operationalStates = 6) => {
    const dka = fsm.createRandomFsm(fsm.dfaType, operationalStates, alphabetSize, 0);

    const acceptingCell = chooseAcceptingCell(dka);

    const acceptingState = 'sX';
    fsm.addState(dka, acceptingState);
    dka.acceptingStates = [acceptingState];

    fsm.addTransition(dka, acceptingCell.state, [acceptingState], acceptingCell.symbol);

    // now this is even more questionable than the rest of this file
    dka.acceptingCell = acceptingCell.cell;

    return dka;
  };

  const letterToDKA = letters => letters.reduce(
    (acc, letter) => ({ ...acc, [letter]: makeDKA() }), {},
  );
  const DKAs = letterToDKA(inputAlpabet);

  const randomWord = (DKA, minLength = 3) => {
    const word = fsm.randomStringInLanguage(DKA);
    if (word.length < minLength) return randomWord(DKA);
    return word;
  };
  const C = secretText => Array.from(secretText).map(
    letter => randomWord(DKAs[letter]),
  );

  const isWordAccepted = (DKA, word) => {
    try {
      return fsm.isStringInLanguage(DKA, word);
    } catch (e) {
      return false;
    }
  };
  const D = (cypheredText) => {
    const allDKAs = Object.entries(DKAs);
    const decypheredText = cypheredText.map(word => allDKAs.reduce(
      (acc, [letter, dka]) => (isWordAccepted(dka, word) ? acc + letter : acc), '',
    ));

    return decypheredText;
  };

  // for (;;) {
  //   console.log('_');
  //   const input = 'abcc';
  //   const cyphered = C(input);
  //   const decyphered = D(cyphered);
  //   if (decyphered.join('') !== input) {
  //     console.log('huy');
  //     debugger;
  //   }
  // }
  // console.log(cyphered);
  // console.log(decyphered);
  // console.log(acceptingCells);
})();
