const util = require('../util');
const words = require('./words');

// TODO: sort out _createRandom and maxNumToStates

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

  const _generateSingle = (letter, alphabet, operationalStates) => {
    const newFsm = _createRandom(alphabet, operationalStates);
    newFsm.ciphersLetter = letter;

    // Randomly drops about half of transitions
    newFsm.transitions = newFsm.transitions.filter(() => Math.round(Math.random()));

    // Chooses a cell that would point to the accepting state
    // Makes sure it wasn't chosen in any other dka
    const randomTransition = util.getRandomElement(newFsm.transitions);
    const acceptingCell = {
      state: randomTransition.fromState,
      symbol: randomTransition.symbol,
    };
    newFsm.acceptingCells = [acceptingCell];

    // Adds a state and makes it the only accepting one
    const newStateName = 'sX';
    newFsm.states.push(newStateName);
    newFsm.acceptingStates = [newStateName];

    // Determines the transition from the chosen accepting cell
    // Points it to the accepting state
    newFsm.transitions.find(
      t => t.fromState === acceptingCell.state && t.symbol === acceptingCell.symbol,
    ).toStates = [newStateName];

    // Adds laft and right letters for balancing
    newFsm.balanceLetters = util.asHalves(util.shuffle(util.latinAlphabet));

    if (!words.generate(newFsm)) {
      console.log('Achtung!');
      return _generateSingle(letter, alphabet, operationalStates);
    }
    return newFsm;
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

    const balanceLetters = [
      '<span>',
      `  <b>Balancing</b> -- <b>Left:</b> ${
        fsm.balanceLetters.left
      }; <b>Right:</b> ${fsm.balanceLetters.right};`,
      '</span>',
    ];

    const html = [
      '<table border="1">',
      '  <tr>',
      ...header.map(cell => `    <th>${cell}</th>`),
      '  </tr>',
      ...tableRows.flatMap(row => [
        '  <tr>',
        ...row.map(cell => `    <td>${cell}</td>`),
        '  </tr>',
      ]),
      '</table>',
      ...balanceLetters,
      '</br>',
    ];

    return html.join('\n');
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
