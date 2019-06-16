const util = require('../util');
const config = require('../../config');

module.exports = (() => {
  const _baseFsm = (alphabet = [], states = []) => ({
    alphabet,
    states,
    acceptingStates: states.filter(() => Math.round(Math.random())),
    initialState: states.length > 0 ? states[0] : '',
    transitions: [],
  });

  // Produces a random FSM with given properties and about half of transitions
  const _createRandom = (alphabet, numStates, transitionFillPercent = config.fsmTransitionFillPercent) => {
    const newFsm = _baseFsm(
      alphabet,
      util.generateArray((_, i) => `s${i}`, numStates),
    );

    const selectTargetState = () => (Math.round(Math.random() <= transitionFillPercent / 100)
        ? [util.getRandomElement(newFsm.states)]
        : []);

    newFsm.transitions = newFsm.states.flatMap(fromState => newFsm.alphabet.map(symbol => ({
        fromState,
        symbol,
        toStates: selectTargetState(),
      })));

    return newFsm;
  };

  const _isAcceptingStateReachable = (fsm) => {
    const unprocessedStates = [fsm.initialState];
    const reachableStates = [];

    while (unprocessedStates.length !== 0) {
      const currentState = unprocessedStates.pop();

      for (let i = 0; i < fsm.transitions.length; i += 1) {
        const transition = fsm.transitions[i];

        if (currentState === transition.fromState) {
          for (let j = 0; j < transition.toStates.length; j += 1) {
            const state = transition.toStates[j];

            if (!reachableStates.includes(state)) {
              reachableStates.push(transition.toStates[j]);

              if (!unprocessedStates.includes(state)) {
                unprocessedStates.push(state);
              }
            }
          }
        }
      }
    }

    return fsm.acceptingStates.some(acceptingState => reachableStates.includes(acceptingState));
  };

  const _generateSingle = (letter, alphabet, operationalStates) => {
    let newFsm;

    do {
      newFsm = _createRandom(alphabet, operationalStates);

      // Chooses a cell that would point to the accepting state
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
        t => t.fromState === acceptingCell.state
          && t.symbol === acceptingCell.symbol,
      ).toStates = [newStateName];
    } while (!_isAcceptingStateReachable(newFsm));

    newFsm.ciphersLetter = letter;
    newFsm.balancing = util.asHalves(util.shuffle(newFsm.alphabet));

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

    const balancing = [
      '<span>',
      `  <b>Balancing</b> -- <b>Left:</b> ${
        fsm.balancing.left
      }; <b>Right:</b> ${fsm.balancing.right};`,
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
      ...balancing,
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
