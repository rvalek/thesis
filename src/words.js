const config = require('../config');

module.exports = (() => {
  const _makeTransition = (fsm, states, symbol) => {
    if (!fsm.alphabet.includes(symbol)) {
      throw new Error('FSM must contain all symbols for which the transition is being computed');
    }

    if (states.some(inputSymb => !fsm.states.includes(inputSymb))) {
      throw new Error('FSM must contain all symbols for which the transition is being computed');
    }

    const targetStates = [];

    for (let i = 0; i < fsm.transitions.length; i += 1) {
      const transition = fsm.transitions[i];

      if (fsm.transitions[i].symbol === symbol
        && states.includes(transition.fromState)) {
        for (let j = 0; j < transition.toStates.length; j += 1) {
          if (!targetStates.includes(transition.toStates[j])) {
            targetStates.push(transition.toStates[j]);
          }
        }
      }
    }

    return targetStates;
  };

  // read a stream of input symbols and determine target states
  const _readString = (fsm, inputSymbolStream) => {
    if (Array.from(inputSymbolStream).some(inputSymb => !fsm.alphabet.includes(inputSymb))) {
      throw new Error('FSM must contain all symbols for which the transition is being computed');
    }

    let states = [fsm.initialState];

    for (let i = 0; i < inputSymbolStream.length; i += 1) {
      states = _makeTransition(fsm, states, inputSymbolStream[i]);
    }

    return states;
  };

  const _genOneWord = (fsm, minLength, maxLength) => {
    let currentState = fsm.acceptingStates[Math.floor(Math.random() * fsm.acceptingStates.length)];
    const trail = [];

    for (; ;) {
      if (currentState === fsm.initialState) {
        // !!! Changed if (Math.round(Math.random())) to this, which doesn't do much tbh
        if (trail.length >= minLength && Math.round(Math.random()) || trail.length >= maxLength) {
          break;
        }
      }

      const transitions = [];

      for (let i = 0; i < fsm.transitions.length; i += 1) {
        if (fsm.transitions[i].toStates[0] === currentState) {
          transitions.push(fsm.transitions[i]);
        }
      }

      if (transitions.length === 0) {
        break;
      }

      const transition = transitions[Math.floor(Math.random() * transitions.length)];

      trail.push(transition.symbol);
      currentState = transition.fromState;
    }

    trail.reverse();

    const word = trail.join('');
    console.log(`Ciphered ${fsm.ciphersLetter} as ${word}`);

    return word;
  };

  // Max boundary is not guaranteed
  const generate = (fsm, minLength = config.minCypherLengthPerSourceLetter, maxLength = 7, num = 1) => {
    if (fsm.acceptingStates.length === 0) {
      return null;
    }

    return num === 1
      ? _genOneWord(fsm, minLength, maxLength)
      : Array(num).fill().map(() => _genOneWord(fsm, minLength, maxLength));
  };

  const isAccepted = (fsm, word) => {
    try {
      return _readString(fsm, word).some(state => fsm.acceptingStates.includes(state));
    } catch (e) {
      return false;
    }
  };

  return { generate, isAccepted };
})();
