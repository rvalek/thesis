const { logging } = require('../../config');
const util = require('../tools/util');

module.exports = (() => {
  // Produces a set of target states from given states and a symbol.
  const _makeTransition = (fsm, fromStates, symbol) => new Set(
      fsm.transitions
        .filter(t => t.symbol === symbol && fromStates.includes(t.fromState))
        .flatMap(t => t.toStates),
    );

  // Produces the resulting state of a given machine after reading a string.
  const _readString = (fsm, [...inputString]) => inputString.reduce(
      (accStates, symbol) => [..._makeTransition(fsm, accStates, symbol)],
      [fsm.initialState],
    );

  // Produces a random word of certain minimal length, accepted by a given machine.
  const _generateSingle = (fsm, minLength) => {
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

    if (logging) {
      console.log(` Generated ${word} for ${fsm.ciphersLetter}`);
    }

    return word;
  };

  // _generateSingle that is balanced
  const _generateBalanced = (fsm, minLength) => {
    let word;

    do {
      word = _generateSingle(fsm, minLength);
    } while (!util.isBalanced(word, fsm.balancing));

    if (logging) {
      console.log(
        `Accepted balanced ${word} for ${fsm.ciphersLetter}, with L: ${
          fsm.balancing.left
        }; R: ${fsm.balancing.right};`,
      );
    }

    return word;
  };

  // Produces requested number of random string, accepted by a given machine.
  const generate = (fsm, minLength = 1) => _generateBalanced(fsm, minLength);

  // A predicate of whether reading a given word results in accepting state by a machine.
  const isAccepted = (fsm, word) => _readString(fsm, word).some(state => fsm.acceptingStates.includes(state))
    && util.isBalanced(word, fsm.balancing);

  // Internals are exposed for analysis
  return {
    generate,
    isAccepted,
    _generateBalanced,
    _generateSingle,
  };
})();
