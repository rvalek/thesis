module.exports = (() => {
  // Max length is not guaranteed
  const _randomStringInLanguage = (fsm, minLength, maxLength, n = 1) => {
    const newFsm = fsm;

    if (newFsm.acceptingStates.length === 0) {
      return null;
    }

    let currentState = newFsm.acceptingStates[Math.floor(Math.random() * newFsm.acceptingStates.length)];
    const trail = [];

    while (true) {
      if (currentState === newFsm.initialState) {
        // !!! Changed if (Math.round(Math.random())) to this, which doesn't do much tbh
        if (trail.length >= minLength && Math.round(Math.random()) || trail.length >= maxLength) {
          break;
        }
      }

      const transitions = [];

      for (let i = 0; i < newFsm.transitions.length; i += 1) {
        if (newFsm.transitions[i].toStates[0] === currentState) {
          transitions.push(newFsm.transitions[i]);
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

    return trail;
  };

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


  const generate = (DKA, minLength, maxLength = 7) => {
    const word = _randomStringInLanguage(DKA, minLength, maxLength);
    console.log(`Ciphered ${DKA.ciphersLetter} as ${word.join('')}`);

    return word;
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
