const util = require('../src/util');
const config = require('../config');

module.exports = (() => {
  const _latinAlphabet = 'abcdefghijklmnopqrstuvwxyz';

  // const fsmTypes = {
  //   dfa: 'DFA',
  //   nfa: 'NFA',
  // };

  // generate random fsm
  const _createRandomFsm = (numStates, numAlphabet, maxNumToStates = 1) => {
    const newFsm = {};

    function prefix(ch, num, str) {
      let retStr = str;

      for (let i = 0; i < str.length - num; i += 1) {
        retStr = ch + str;
      }

      return retStr;
    }

    newFsm.states = [];
    for (let i = 0, len = numStates.toString().length; i < numStates; i += 1) {
      newFsm.states.push(`s${prefix('0', len, i.toString())}`);
    }

    newFsm.alphabet = [];

    if (numAlphabet > 26) {
      for (
        let i = 0, len = numAlphabet.toString().length;
        i < numAlphabet;
        i += 1
      ) {
        newFsm.alphabet.push(`a${prefix('0', len, i.toString())}`);
      }
    } else {
      newFsm.alphabet = _latinAlphabet.substr(0, numAlphabet).split('');
    }

    [newFsm.initialState] = newFsm.states;

    newFsm.acceptingStates = [];
    for (let i = 0; i < numStates; i += 1) {
      if (Math.round(Math.random())) {
        newFsm.acceptingStates.push(newFsm.states[i]);
      }
    }

    newFsm.transitions = [];
    for (let i = 0; i < numStates; i += 1) {
      for (let j = 0; j < newFsm.alphabet.length; j += 1) {
        const numToStates = Math.ceil(Math.random() * maxNumToStates);

        if (numToStates > 0) {
          const toStates = [];
          for (
            let k = 0;
            k < newFsm.states.length && toStates.length < numToStates;
            k += 1
          ) {
            let diff = newFsm.states.length - k - (numToStates - toStates.length) + 1;

            if (diff <= 0) {
              diff = 1;
            } else {
              diff = 1 / diff;
            }

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

    // yo?
    // if (maxNumToStates > 1) {
    //   newFsm = noam.fsm.convertNfaToDfa(newFsm);
    //   newFsm = noam.fsm.minimize(newFsm);
    // }

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
    const newDka = _createRandomFsm(operationalStates, alphabetSize);
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

  const toHtml = FSMs => Object.values(FSMs).map(_makeHtmlTable).join('</br>');

  const generate = (
    letters = '',
    numSymbols = config.fsmNumSymbols,
    numStates = config.fsmNumStates,
  ) => (letters.length === 0
      ? _generateSingle(letters, numSymbols, numStates)
      : Array.from(letters).reduce(
          (acc, letter) => ({
            [letter]: _generateSingle(letter, numSymbols, numStates),
            ...acc,
          }),
          {},
        ));

  return { emptyMachine, generate, toHtml };
})();
