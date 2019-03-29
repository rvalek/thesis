const { fsm } = require('./noam');

module.exports = (() => {
  // TODO: Allow addition of multiple accepting cells per DKA

  const allAcceptingCells = new Set();
  const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];
  const chooseAcceptingCell = (dka) => {
    const symbol = getRandomElement(dka.alphabet);
    const state = getRandomElement(dka.states);
    const asText = `${symbol}:${state}`;

    if (allAcceptingCells.has(asText)) return chooseAcceptingCell(dka);

    allAcceptingCells.add(asText);

    return { symbol, state, asText };
  };

  const makeDKA = (letter = '', alphabetSize = 26, operationalStates = 6) => {
    const dka = fsm.createRandomFsm(fsm.dfaType, operationalStates, alphabetSize);
    dka.ciphersLetter = letter;

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const acceptingCell = chooseAcceptingCell(dka);

    // !Questionable!
    dka.acceptingCells = [];
    dka.acceptingCells.push(acceptingCell);

    // Adds a state and makes it the only accepting one
    const acceptingState = 'sX';
    fsm.addState(dka, acceptingState);
    dka.acceptingStates = [acceptingState];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    const acceptingTransition = parseInt(acceptingCell.state.slice(1), 10) * dka.alphabet.length
      + dka.alphabet.indexOf(acceptingCell.symbol);
    dka.transitions[acceptingTransition].toStates = [acceptingState];

    return dka;
  };

  const randomWord = (DKA, minLength = 3) => {
    const word = fsm.randomStringInLanguage(DKA);
    if (word.length < minLength) return randomWord(DKA);
    return word;
  };

  const isWordAccepted = (DKA, word) => {
    try {
      return fsm.isStringInLanguage(DKA, word);
    } catch (e) {
      return false;
    }
  };

  return {
    makeDKA, randomWord, isWordAccepted,
  };
})();
