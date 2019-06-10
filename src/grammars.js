module.exports = (() => {
  const endSymbol = '$';

  const fromFsm = (fsm) => {
    const grammar = {
      nonterminals: [],
      terminals: [],
      initialNonterminal: '',
      productions: [],
    };

    for (let i = 0; i < fsm.transitions.length; i += 1) {
      grammar.productions.push({
        left: [fsm.transitions[i].fromState],
        right: [fsm.transitions[i].symbol].concat(
          fsm.transitions[i].toStates,
        ),
      });
    }

    for (let i = 0; i < fsm.acceptingStates.length; i += 1) {
      grammar.productions.push({
        left: [fsm.acceptingStates[i]],
        right: [endSymbol],
      });
    }

    return grammar;
  };

  const print = (grammar) => {
    const str = [];

    str.push(`${'Initial nonterminal: <'}${grammar.initialNonterminal}>`);

    const slimProds = [];

    for (let i = 0; i < grammar.productions.length; i += 1) {
      let foundSlim = -1;

      for (let j = 0; j < slimProds.length; j += 1) {
        if (slimProds[j][0] === grammar.productions[i].left) {
          foundSlim = j;
          break;
        }
      }

      if (foundSlim === -1) {
        slimProds[slimProds.length] = [grammar.productions[i].left, [grammar.productions[i].right]];
      } else {
        slimProds[foundSlim][1].push(grammar.productions[i].right);
      }
    }

    for (let i = 0; i < slimProds.length; i += 1) {
      const prod = [];

      for (let j = 0; j < slimProds[i][0].length; j += 1) {
        if (grammar.nonterminals.includes(slimProds[i][0][j])) {
          prod.push(`<${slimProds[i][0][j].toString()}>`);
        } else if (slimProds[i][0][j] === endSymbol) {
          prod.push(slimProds[i][0][j].toString());
        } else {
          prod.push(`"${slimProds[i][0][j].toString()}"`);
        }
      }

      prod.push('->');

      for (let j = 0; j < slimProds[i][1].length; j += 1) {
        for (let k = 0; k < slimProds[i][1][j].length; k += 1) {
          if (grammar.nonterminals.includes(slimProds[i][1][j][k])) {
            prod.push(`<${slimProds[i][1][j][k].toString()}>`);
          } else if (slimProds[i][1][j][k] === endSymbol) {
            prod.push(slimProds[i][1][j][k].toString());
          } else {
            prod.push(`"${slimProds[i][1][j][k].toString()}"`);
          }
        }

        if (j < slimProds[i][1].length - 1) {
          prod.push('|');
        }
      }

      str.push(prod.join(' '));
    }

    return str.join('\n');
  };


  return { fromFsm, print };
})();
