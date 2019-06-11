const util = require('../src/util');
const config = require('../config');

// TODO: add potentially empty transitions >> Math.ceil to Math.round and update _findTransitionIndex

module.exports = (() => {
  // Produces an FSM object with given properties and randomly generated transitions.
  const _createRandom = (numStates, numAlphabet, maxNumToStates = 1) => {
    const newFsm = {};

    newFsm.alphabet = numAlphabet <= 26
        ? [...util.latinAlphabet.substr(0, numAlphabet)]
        : util.generateArray((_, i) => `a${i}`, numAlphabet);

    newFsm.states = util.generateArray((_, i) => `s${i}`, numStates);
    [newFsm.initialState] = newFsm.states;

    newFsm.acceptingStates = newFsm.states.filter(() => Math.round(Math.random()));

    newFsm.transitions = [];
    for (let i = 0; i < numStates; i += 1) {
      for (let j = 0; j < newFsm.alphabet.length; j += 1) {
        const numToStates = Math.ceil(Math.random() * maxNumToStates);

        if (numToStates > 0) {
          // const _someMath = (_, i) => {
          //   let diff = newFsm.states.length - i - (numToStates - toStates.length) + 1;
          //   diff = diff <= 0 ? 1 : 1 / diff;

          //   if (Math.random() <= diff) {
          //     return newFsm.states[i];
          //   }
          // };
          // const toStates = util.generateArray(_someMath, Math.max(numToStates, newFsm.states.length)).filter(e => e !== undefined);
          const toStates = [];
          for (
            let k = 0;
            k < newFsm.states.length && toStates.length < numToStates;
            k += 1
          ) {
            let diff = newFsm.states.length - k - (numToStates - toStates.length) + 1;
            diff = diff <= 0 ? 1 : 1 / diff;

            if (Math.random() <= diff) {
              toStates.push(newFsm.states[k]);
            }
          }

          newFsm.transitions.push({
            fromState: newFsm.states[i],
            symbol: newFsm.alphabet[j],
            toStates,
          });
        }
      }
    }

    return newFsm;
  };

  const _allAcceptingCellSymbols = new Set();
  const _randomUniqueCell = (dka) => {
    const symbol = util.getRandomElement(dka.alphabet);
    const state = util.getRandomElement(dka.states);

    if (_allAcceptingCellSymbols.has(symbol)) return _randomUniqueCell(dka);

    _allAcceptingCellSymbols.add(symbol);

    return { symbol, state };
  };

  const _findTransitionIndex = (dka, state, symbol) => parseInt(state.slice(1), 10) * dka.alphabet.length
    + dka.alphabet.indexOf(symbol);

  const emptyMachine = () => ({
    states: [],
    alphabet: [],
    acceptingStates: [],
    initialState: '',
    transitions: [],
  });

  const _generateSingle = (letter, alphabetSize, operationalStates) => {
    const newDka = _createRandom(operationalStates, alphabetSize);
    newDka.ciphersLetter = letter;

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const acceptingCell = _randomUniqueCell(newDka);
    // ...ehhh...
    newDka.acceptingCells = [acceptingCell];

    // Adds a state and makes it the only accepting one
    const newStateName = 'sX';
    newDka.states.push(newStateName);
    newDka.acceptingStates = [newStateName];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    const acceptingTransition = _findTransitionIndex(
      newDka,
      acceptingCell.state,
      acceptingCell.symbol,
    );
    newDka.transitions[acceptingTransition].toStates = [newStateName];

    return newDka;
  };

  const _makeHtmlTable = (fsm) => {
    const headers = [`<i>${fsm.ciphersLetter}</i>`].concat(fsm.alphabet);

    headers.push('');

    const tableRows = [];

    for (let i = 0; i < fsm.states.length; i += 1) {
      tableRows.push(new Array(headers.length));
      for (let j = 0; j < headers.length; j += 1) {
        tableRows[i][j] = { text: [] };
      }
      tableRows[i][0] = { text: fsm.states[i].toString() };
      tableRows[i][headers.length - 1] = fsm.acceptingStates.includes(
        fsm.states[i],
      )
        ? { text: ['1'] }
        : { text: ['0'] };
    }

    for (let i = 0; i < fsm.transitions.length; i += 1) {
      const transition = fsm.transitions[i];

      let colNum;
      let rowNum;

      for (let j = 0; j < fsm.states.length; j += 1) {
        if (fsm.states[j] === transition.fromState) {
          rowNum = j;
          break;
        }
      }

      for (let j = 0; j < fsm.alphabet.length; j += 1) {
        if (fsm.alphabet[j] === transition.symbol) {
          colNum = j + 1;
          break;
        }
      }

      if (typeof tableRows[rowNum][colNum].text === 'undefined') {
        tableRows[rowNum][colNum] = { text: [] };
      }

      tableRows[rowNum][colNum].text.push(transition.toStates);
    }

    const htmlString = [];

    htmlString.push("<table border='1'>");
    htmlString.push('  <tr>');

    for (let i = 0; i < headers.length; i += 1) {
      htmlString.push(`    <th>${headers[i].toString()}</th>`);
    }

    htmlString.push('  </tr>');

    for (let i = 0; i < tableRows.length; i += 1) {
      htmlString.push('  <tr>');
      for (let j = 0; j < tableRows[i].length; j += 1) {
        htmlString.push(`    <td>${tableRows[i][j].text}</td>`);
      }

      htmlString.push('  </tr>');
    }

    htmlString.push('</table>');
    return htmlString.join('\n');
  };

  const toHtml = FSMs => Object.values(FSMs)
      .map(_makeHtmlTable)
      .join('</br>');

  const generate = (
    letters = '',
    numSymbols = config.fsmNumSymbols,
    numStates = config.fsmNumStates,
  ) => (letters.length === 0
      ? _generateSingle(letters, numSymbols, numStates)
      : [...letters].reduce(
          (acc, letter) => ({
            [letter]: _generateSingle(letter, numSymbols, numStates),
            ...acc,
          }),
          {},
        ));

  return { emptyMachine, generate, toHtml };
})();
