const nn = require('./nn');
const config = require('../config');

module.exports = (() => {
  const allAcceptingCells = new Set();
  const getRandomElement = arr => arr[Math.floor(Math.random() * arr.length)];
  const randomUniqueCell = (dka) => {
    const symbol = getRandomElement(dka.alphabet);
    const state = getRandomElement(dka.states);
    const asText = `${symbol}:${state}`;

    if (allAcceptingCells.has(asText)) return randomUniqueCell(dka);

    allAcceptingCells.add(asText);

    return { symbol, state, asText };
  };

  const findTransitionIndex = (dka, state, symbol) => parseInt(state.slice(1), 10) * dka.alphabet.length
    + dka.alphabet.indexOf(symbol);

  const makeDKA = (letter = '', alphabetSize = config.fsmNumSymbols, operationalStates = config.fsmNumStates) => {
    const newDka = nn.createRandomFsm(operationalStates, alphabetSize);
    newDka.ciphersLetter = letter;

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const acceptingCell = randomUniqueCell(newDka);
    // ...ehhh...
    newDka.acceptingCells = [acceptingCell];

    // Adds a state and makes it the only accepting one
    const newStateName = 'sX';
    newDka.states.push(newStateName);
    newDka.acceptingStates = [newStateName];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    const acceptingTransition = findTransitionIndex(newDka, acceptingCell.state, acceptingCell.symbol);
    newDka.transitions[acceptingTransition].toStates = [newStateName];

    return newDka;
  };

  const dkasForAlphabet = alphabet => Array.from(alphabet).reduce((acc, letter) => ({ [letter]: makeDKA(letter), ...acc }), {});

  const randomWord = (DKA, minLength, maxLength = 7) => {
    const word = nn.randomStringInLanguage(DKA, minLength, maxLength);
    console.log(`Ciphered ${DKA.ciphersLetter} as ${word.join('')}`);

    return word;
  };

  const isWordAccepted = (DKA, word) => {
    try {
      return nn.isStringInLanguage(DKA, word);
    } catch (e) {
      return false;
    }
  };

  const dkasWithTerminatingSymbol = (dkas, letter) => Object.values(dkas)
    .filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));

  const makeHTML = FSMs => `<!DOCTYPE html><html><head></head><body>
    ${Object.entries(FSMs).map(([letter, dka]) => nn.printHtmlTable(dka, letter)).join('</br>')}
  </body></html>`;

  return {
    dkasForAlphabet, randomWord, isWordAccepted, dkasWithTerminatingSymbol, makeDKA, makeHTML,
  };
})();
