const { writeFile } = require('fs');
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
    const acceptingTransitionIndex = parseInt(acceptingCell.state.slice(1), 10) * dka.alphabet.length
      + dka.alphabet.indexOf(acceptingCell.symbol);
    dka.transitions[acceptingTransitionIndex].toStates = [acceptingState];

    return dka;
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

  const randomWord = (DKA, minLength = 3) => {
    const word = fsm.randomStringInLanguage(DKA);
    if (word.length < minLength) return randomWord(DKA);

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
