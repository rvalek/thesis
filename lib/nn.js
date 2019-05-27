module.exports = (() => {
  const latinAlphabet = 'abcdefghijklmnopqrstuvwxyz';

  const makeNew = () => ({
    states: [],
    alphabet: [],
    acceptingStates: [],
    initialState: undefined,
    transitions: [],
  });

  const fsmTypes = {
    dfa: 'DFA',
    nfa: 'NFA',
  };

  // generate random fsm
  const createRandomFsm = (numStates, numAlphabet, fsmType = fsmTypes.dfa, maxNumToStates = 1) => {
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
      for (let i = 0, len = numAlphabet.toString().length; i < numAlphabet; i += 1) {
        newFsm.alphabet.push(`a${prefix('0', len, i.toString())}`);
      }
    } else {
      newFsm.alphabet = latinAlphabet.substr(0, numAlphabet).split('');
    }

    newFsm.initialState = newFsm.states[0];

    newFsm.acceptingStates = [];
    for (let i = 0; i < numStates; i += 1) {
      if (Math.round(Math.random())) {
        newFsm.acceptingStates.push(newFsm.states[i]);
      }
    }

    newFsm.transitions = [];
    for (let i = 0; i < numStates; i += 1) {
      for (let j = 0; j < newFsm.alphabet.length; j += 1) {
        const numToStates = 1;

        // if (fsmType !== fsmTypes.dfa) {
        //   numToStates = Math.floor(Math.random() * maxNumToStates);
        // }

        if (numToStates > 0) {
          const toStates = [];
          for (let k = 0; k < newFsm.states.length && toStates.length < numToStates; k += 1) {
            let diff = (newFsm.states.length - k) - (numToStates - toStates.length) + 1;

            if (diff <= 0) {
              diff = 1;
            } else {
              diff = 1 / diff;
            }

            if (Math.random() <= diff) {
              toStates.push(newFsm.states[k]);
            }
          }

          newFsm.transitions.push({ fromState: newFsm.states[i], symbol: newFsm.alphabet[j], toStates });
        }
      }
    }


    return newFsm;
  };

  // !!! Added two boundary params
  // generate a random string which the fsm accepts
  const randomStringInLanguage = (fsm, lowerBoundary, upperBoundary) => {
    const newFsm = fsm;

    // ? useless optimization
    // const fsmType = noam.fsm.determineType(fsm);

    // if (fsmType === fsmTypes.nfaType) {
    //   newFsm = noam.fsm.convertNfaToDfa(fsm);
    // }

    // newFsm = noam.fsm.minimize(newFsm);

    if (newFsm.acceptingStates.length === 0) {
      return null;
    }

    let currentState = newFsm.acceptingStates[Math.floor(Math.random() * newFsm.acceptingStates.length)];
    const trail = [];

    while (true) {
      if (currentState === newFsm.initialState) {
        // !!! Changed if (Math.round(Math.random())) to this, which doesn't do much tbh
        if (trail.length >= lowerBoundary && Math.round(Math.random()) || trail.length >= upperBoundary) {
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

  const makeTransition = (fsm, states, symbol) => {
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
  const readString = (fsm, inputSymbolStream) => {
    if (Array.from(inputSymbolStream).some(inputSymb => !fsm.alphabet.includes(inputSymb))) {
      throw new Error('FSM must contain all symbols for which the transition is being computed');
    }

    let states = [fsm.initialState];

    for (let i = 0; i < inputSymbolStream.length; i += 1) {
      states = makeTransition(fsm, states, inputSymbolStream[i]);
    }

    return states;
  };

  //   // test if a stream of input symbols leads a fsm to an accepting state
  const isStringInLanguage = (fsm, inputSymbolStream) => {
    const states = readString(fsm, inputSymbolStream);

    return states.any(state => fsm.acceptingStates.includes(state));
  };

  //   print the fsm transition function and accepting states as an HTML table
  //   const printHtmlTable = (fsm, ciphersLetter = '') => {
  //     const headers = [`<i>${ciphersLetter}</i>`].concat(fsm.alphabet);

  //     headers.push('');

  //     const tableRows = [];

  //     for (let i = 0; i < fsm.states.length; i += 1) {
  //       tableRows.push(new Array(headers.length));
  //       for (let j = 0; j < headers.length; j += 1) {
  //         tableRows[i][j] = { text: [] };
  //       }
  //       tableRows[i][0] = { text: fsm.states[i].toString() };
  //       tableRows[i][headers.length - 1] = noam.util.contains(fsm.acceptingStates, fsm.states[i])
  //         ? { text: ['1'] } : { text: ['0'] };
  //     }

  //     for (let i = 0; i < fsm.transitions.length; i += 1) {
  //       const transition = fsm.transitions[i];

  //       let colNum = null;
  //       let rowNum = null;

  //       for (let j = 0; j < fsm.states.length; j += 1) {
  //         if (noam.util.areEquivalent(fsm.states[j], transition.fromState)) {
  //           rowNum = j;
  //           break;
  //         }
  //       }

  //       if (transition.symbol === noam.fsm.epsilonSymbol) {
  //         colNum = headers.length - 2;
  //       } else {
  //         for (let j = 0; j < fsm.alphabet.length; j += 1) {
  //           if (noam.util.areEquivalent(fsm.alphabet[j], transition.symbol)) {
  //             colNum = j + 1;
  //             break;
  //           }
  //         }
  //       }

  //       if (typeof tableRows[rowNum][colNum].text === 'undefined') {
  //         tableRows[rowNum][colNum] = { text: [] };
  //       }

  //       tableRows[rowNum][colNum].text.push(transition.toStates);
  //     }

  //     const htmlString = [];

  //     htmlString.push("<table border='1'>");
  //     htmlString.push('  <tr>');

  //     for (let i = 0; i < headers.length; i += 1) {
  //       htmlString.push(`    <th>${headers[i].toString()}</th>`);
  //     }

  //     htmlString.push('  </tr>');

  //     for (let i = 0; i < tableRows.length; i += 1) {
  //       htmlString.push('  <tr>');
  //       for (let j = 0; j < tableRows[i].length; j += 1) {
  //         htmlString.push(`    <td>${tableRows[i][j].text}</td>`);
  //       }

  //       htmlString.push('  </tr>');
  //     }

  //     htmlString.push('</table>');
  //     return htmlString.join('\n');
  //   };

  return {
    fsmTypes, createRandomFsm, makeNew, randomStringInLanguage, isStringInLanguage,
  };
})();
