const { fsm } = require('./noam');

const DKA = fsm.makeNew();


for (let i = 0; i < 3; i++)
    fsm.addState(DKA, i);

fsm.setInitialState(DKA, 0);
fsm.addAcceptingState(DKA, 2);
fsm.addSymbol(DKA, "a");
fsm.addSymbol(DKA, "b");
fsm.addTransition(DKA, 0, [1], "a");
fsm.addTransition(DKA, 1, [2], "b");
fsm.addEpsilonTransition(DKA, 1, [2]);

// console.log(DKA);
console.log(fsm.grammar(DKA));