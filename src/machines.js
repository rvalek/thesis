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

  const _allAcceptingCells = new Set();
  const _randomUniqueCell = (dka) => {
    const symbol = util.getRandomElement(dka.alphabet);
    const state = util.getRandomElement(dka.states);
    const asText = `${symbol}:${state}`;

    if (_allAcceptingCells.has(asText)) return _randomUniqueCell(dka);

    _allAcceptingCells.add(asText);

    return { symbol, state, asText };
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

  return { emptyMachine, generate };
})();
