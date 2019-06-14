const util = require('../src/util');
const config = require('../config');

// TODO?  add potentially empty transitions >> Math.ceil to Math.round and update _findTransitionIndex

module.exports = (() => {
  const _baseFsm = (alphabet = [], states = []) => ({
    alphabet,
    states,
    acceptingStates: states.filter(() => Math.round(Math.random())),
    initialState: states.length > 0 ? states[0] : '',
    transitions: [],
  });

  // Produces an FSM object with given properties and randomly generated transitions.
  const _createRandom = (alphabet, numStates, maxNumToStates = 1) => {
    const newFsm = _baseFsm(
      alphabet,
      util.generateArray((_, i) => `s${i}`, numStates),
    );

    // Generate random but valid set of transitions
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

  const _findTransitionIndex = (fsm, { state, symbol }) => parseInt(state.slice(1), 10) * fsm.alphabet.length
    + fsm.alphabet.indexOf(symbol);

  const _generateSingle = (letter, alphabet, operationalStates) => {
    const newDka = _createRandom(alphabet, operationalStates);
    newDka.ciphersLetter = letter;

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const acceptingCell = _randomUniqueCell(newDka);
    newDka.acceptingCells = [acceptingCell];

    // Adds a state and makes it the only accepting one
    const newStateName = 'sX';
    newDka.states.push(newStateName);
    newDka.acceptingStates = [newStateName];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    const acceptingTransition = _findTransitionIndex(newDka, acceptingCell);
    newDka.transitions[acceptingTransition].toStates = [newStateName];

    // Adds laft and right letters for balancing
    newDka.balanceLetters = util.asHalves(util.shuffle(util.latinAlphabet));

    return newDka;
  };

  const _makeHtmlTable = (fsm) => {
    const header = [`<i>'${fsm.ciphersLetter}'</i>`, ...fsm.alphabet, ''];

    const tableRows = fsm.states.map(state => [
      state,
      ...fsm.alphabet.map(symbol => fsm.transitions
          .filter(t => t.fromState === state && t.symbol === symbol)
          .map(t => t.toStates)),
      fsm.acceptingStates.includes(state) ? ['1'] : ['0'],
    ]);

    const htmlString = [
      '<table border="1">',
      '  <tr>',
      ...header.map(cell => `    <th>${cell}</th>`),
      '  </tr>',
      ...tableRows.flatMap(row => ['  <tr>', ...row.map(cell => `    <td>${cell}</td>`), '  </tr>']),
      '</table>',
    ];

    return htmlString.join('\n');
  };

  const toHtml = FSMs => Object.values(FSMs)
      .map(_makeHtmlTable)
      .join('</br>');

  const generate = (letters = '', [...alphabet] = [], numStates = 0) => (letters.length === 0
      ? _generateSingle(letters, alphabet, numStates)
      : [...letters].reduce(
          (acc, letter) => ({
            [letter]: _generateSingle(letter, alphabet, numStates),
            ...acc,
          }),
          {},
        ));

  return { generate, toHtml };
})();
