const { writeFile } = require('fs');
const { fsm } = require('./noam');

// TODO: sort out fsm.createRandomFsm and fsm.randomStringInLanguage

module.exports = (() => {
  // Allow multiple accepting cells per DKA?

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

  const findTransitionIndex = (dka, cell) => parseInt(cell.state.slice(1), 10) * dka.alphabet.length
    + dka.alphabet.indexOf(cell.symbol);

  const makeDKA = (letter = '', alphabetSize = 26, operationalStates = 8) => {
    const newDka = fsm.createRandomFsm(fsm.dfaType, operationalStates, alphabetSize);
    newDka.ciphersLetter = letter;

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const acceptingCell = randomUniqueCell(newDka);
    // ...ehhh...
    newDka.acceptingCells = [acceptingCell];

    // Adds a state and makes it the only accepting one
    const newStateName = 'sX';
    fsm.addState(newDka, newStateName);
    newDka.acceptingStates = [newStateName];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    const acceptingTransition = findTransitionIndex(acceptingCell, newDka);
    newDka.transitions[acceptingTransition].toStates = [newStateName];

    return newDka;
  };

  const dkasForAlpabet = (alphabet) => {
    const DKAs = {};
    let letter;
    for (let i = 0; i < alphabet.length; i += 1) {
      letter = alphabet[i];
      DKAs[letter] = makeDKA(letter);
    }

    return DKAs;
  };

  const randomWord = (DKA, minLength = 3, maxLength = 7) => {
    const word = fsm.randomStringInLanguage(DKA, minLength, maxLength);
    // if (word.length < minLength || word.length > maxLength) return randomWord(DKA);

    console.log(`Ciphered ${DKA.ciphersLetter} as ${word.join('')}`);

    return word;
  };

  const isWordAccepted = (DKA, word) => {
    try {
      return fsm.isStringInLanguage(DKA, word);
    } catch (e) {
      return false;
    }
  };

  const dkasWithTerminatingSymbol = (dkas, letter) => Object.values(dkas)
    .filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));

  const toHTML = DKAs => Object.entries(DKAs)
    .map(([letter, dka]) => fsm.printHtmlTable(dka, letter))
    .join('</br>');

  const writeHTML = (DKAs) => {
    const html = `<!DOCTYPE html><html><head></head><body>${toHTML(DKAs)}</body></html>`;
    const fileName = './out/dkas.html';

    writeFile(fileName, html, (err) => {
      if (err) {
        return console.log(err);
      }

      console.log(`Wrote DKAs to ${fileName}`);
    });
  };

  return {
    dkasForAlpabet, randomWord, isWordAccepted, writeHTML, dkasWithTerminatingSymbol,
  };
})();
