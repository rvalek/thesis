const config = require('../config');
const util = require('./util');
const improve = require('./improve');

module.exports = (() => {
  // Produces a set of target states from given states and a symbol.
  const _makeTransition = (fsm, fromStates, symbol) => new Set(
      fsm.transitions
        .filter(t => t.symbol === symbol && fromStates.includes(t.fromState))
        .reduce((accStates, t) => [...accStates, ...t.toStates], []),
    );

  // Produces the resulting state of a given machine after reading a string.
  const _readString = (fsm, inputString) => Array.from(inputString).reduce(
      (accStates, symbol) => Array.from(_makeTransition(fsm, accStates, symbol)),
      [fsm.initialState],
    );

  // Produces a random word of certain minimal length, accepted by a given machine.
  const _generateSingle = (fsm, minLength = 1) => {
    const trail = [];
    let currentState = util.getRandomElement(fsm.acceptingStates);
    const leadsToCurrentState = trans => trans.toStates.includes(currentState);

    let transitions;
    while (trail.length < minLength || currentState !== fsm.initialState) {
      transitions = fsm.transitions.filter(leadsToCurrentState);
      if (transitions.length === 0) {
        break;
      }

      const { symbol, fromState } = util.getRandomElement(transitions);
      trail.push(symbol);
      currentState = fromState;
    }

    const word = trail.reverse().join('');

    if (config.logging) {
      console.log(`Generated ${fsm.ciphersLetter} for ${word}`);
    }

    return word;
  };

  // _generateSingle that is balanced
    const _generateBalanced = (fsm, minLength = 1) => {
      let word = _generateSingle(fsm, minLength);

      while (!improve.isBalanced(word)) {
        word = _generateSingle(fsm, minLength);
      }

      if (config.logging) {
        console.log(`Generated balanced ${fsm.ciphersLetter} for ${word}`);
      }

      return word;
    };

  // Produces requested number of random string, accepted by a given machine.
  const generate = (
    fsm,
    num = 1,
    minLength = config.minCypherLengthPerSourceLetter,
  ) => (num === 1
      ? _generateBalanced(fsm, minLength)
      : Array(num)
          .fill()
          .map(() => _generateBalanced(fsm, minLength)));

  // A predicate of whether reading a given word results in accepting state by a machine.
  const isAccepted = (fsm, word) => _readString(fsm, word).some(state => fsm.acceptingStates.includes(state));

  return { generate, isAccepted };
})();
