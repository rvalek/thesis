const { fsm } = require('./noam');

module.exports = (() => {
  const acceptingCells = new Set();
  const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];
  const chooseAcceptingCell = (dka) => {
    const symbol = getRandomElement(dka.alphabet);
    const state = getRandomElement(dka.states);
    const asText = `${symbol}:${state}`;

    if (acceptingCells.has(asText)) return chooseAcceptingCell(dka);

    acceptingCells.add(asText);

    return { symbol, state, asText };
  };

  const makeDKA = (alphabetSize = 40, operationalStates = 6) => {
    const dka = fsm.createRandomFsm(fsm.dfaType, operationalStates, alphabetSize, 0);

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const acceptingCell = chooseAcceptingCell(dka);

    // now this is even more questionable than the rest of this file
    dka.acceptingCell = acceptingCell.asText;

    // Adds a state and makes it the only accepting one
    const acceptingState = 'sX';
    fsm.addState(dka, acceptingState);
    dka.acceptingStates = [acceptingState];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    const accepringTransition = parseInt(acceptingCell.state.slice(1), 10) * dka.alphabet.length
      + dka.alphabet.indexOf(acceptingCell.symbol);
    dka.transitions[accepringTransition].toStates = [acceptingState];

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
