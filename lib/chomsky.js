const { writeFile, readFileSync } = require('fs');
const nn = require('./nn');

// TODO: sort out nn.createRandomFsm and nn.randomStringInLanguage

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

  const findTransitionIndex = (dka, state, symbol) => parseInt(state.slice(1), 10) * dka.alphabet.length
    + dka.alphabet.indexOf(symbol);

  const makeDKA = (letter = '', alphabetSize = 26, operationalStates = 8) => {
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

  const dkasForAlphabet = (alphabet) => {
    const DKAs = {};
    let letter;
    for (let i = 0; i < alphabet.length; i += 1) {
      letter = alphabet[i];
      DKAs[letter] = makeDKA(letter);
    }

    return DKAs;
  };

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


  const htmlFileName = './out/dkas.html';
  const writeHTML = (DKAs) => {
    const html = `<!DOCTYPE html><html><head></head><body>
    ${Object.entries(DKAs).map(([letter, dka]) => nn.printHtmlTable(dka, letter)).join('</br>')}
    </body></html>`;

    writeFile(htmlFileName, html, (err) => {
      if (err) {
        return console.log(err);
      }

      console.log(`Wrote DKAs to ${htmlFileName}`);
    });
  };

  const jsonFileName = './out/alpaDKAs.json';
  const saveJSON = (obj) => {
    writeFile(jsonFileName, JSON.stringify(obj), (err) => {
      if (err) {
        return console.log(err);
      }

      console.log(`Wrote alpaDKAs to ${jsonFileName}`);
    });
  };
  const readJSON = () => JSON.parse(readFileSync(jsonFileName));

  return {
    readJSON, saveJSON, dkasForAlphabet, randomWord, isWordAccepted, writeHTML, dkasWithTerminatingSymbol,
  };
})();
