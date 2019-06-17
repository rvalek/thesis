const strSim = require('string-similarity');
const util = require('./util');
const machines = require('../logic/machines');
const words = require('../logic/words');
const crypt = require('../logic/crypt');

module.exports = (() => {
  const pangram = 'the quick brown fox jumps over the lazy dog';
  const lorem = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed eu leo velit aliquam erat volutpat fusce nec turpis duis';

  const wordToWord = (w1, w2) => strSim.compareTwoStrings(w1, w2);
  // const wordToMany = (w1, words) => strSim.findBestMatch(w1, words);
  const wordToArray = (w, ws) => ws.map(word => wordToWord(w, word));
  const maxForWord = (w, ws) => Math.max(...wordToArray(w, ws));
  const bestPerWord = (ws1, ws2) => ws1.map(word => maxForWord(word, ws2));
  const maxForArray = (ws1, ws2) => Math.max(...bestPerWord(ws1, ws2));

  const _microsInSec = 1e3;
  const _nanosInMicro = 1e6;
  const measureExecutionTime = f => (...args) => {
    const time = process.hrtime();

    const result = f(...args);

    const [seconds, nanos] = process.hrtime(time);

    return { result, time: seconds * _microsInSec + nanos / _nanosInMicro };
  };

  const _doMetric = (func, args, info, times) => {
    const timedFunc = measureExecutionTime(func);

    console.log('\n', ...info);

    let runningTotal = 0;
    for (let i = 0; i < times; i += 1) {
      runningTotal += timedFunc(...args).time;
    }

    console.log(`  ${times} runs: ${runningTotal} ms`);
    console.log(`  Single average: ${runningTotal / times} ms`);
  };

  const fsmGen = (times = 1000) => {
    _doMetric(
      machines._generateSingle,
      ['a', ['A', ...util.latinAlphabet], 4],
      ['FSM Generation.', 'Alpbabet length: 27.', 'Operational states: 4.'],
      times,
    );
  };
  const fsmGenBig = (times = 1000) => {
    _doMetric(
      machines._generateSingle,
      ['a', [...util.latinAlphabet.toUpperCase(), ...util.latinAlphabet], 8],
      ['FSM Generation.', 'Alpbabet length: 52.', 'Operational states: 8.'],
      times,
    );
  };

  const cipherLetter = (times = 1000) => {
    _doMetric(
      words._generateSingle,
      [machines._generateSingle('a', ['A', ...util.latinAlphabet], 4), 3],
      [
        'Cipher generation.',
        'Single letter.',
        'Balancing: OFF.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };
  const cipherLetterBalanced = (times = 1000) => {
    _doMetric(
      words._generateBalanced,
      [machines._generateSingle('a', ['A', ...util.latinAlphabet], 4), 3],
      [
        'Cipher generation.',
        'Single letter.',
        'Balancing: ON.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };

  const encryptText = (times = 1000) => {
    const keys = machines.generate(
      ` ${util.latinAlphabet}`,
      `A${util.latinAlphabet}`,
      4,
    );
    const system = crypt(keys);

    _doMetric(
      system.encrypt,
      [pangram],
      ['Full encryption.', 'Text: 44 letters.', 'FSM: Standard (27/4)'],
      times,
    );
  };
  const encryptTextBig = (times = 1000) => {
    const keys = machines.generate(
      ` ${util.latinAlphabet}`,
      `A${util.latinAlphabet}`,
      4,
    );
    const system = crypt(keys);

    _doMetric(
      system.encrypt,
      [lorem],
      ['Full encryption.', 'Text: 116 letters.', 'FSM: Standard (27/4)'],
      times,
    );
  };

  // const decryptText = (times = 1000) => {
  //   const keys = machines.generate(
  //     ` ${util.latinAlphabet}`,
  //     `A${util.latinAlphabet}`,
  //     4,
  //   );
  //   const system = crypt(keys);

  //   _doMetric(
  //     system.encrypt,
  //     [pangram],
  //     ['Full encryption.', 'Text: 44 letters.', 'FSM: Standard (27/4)'],
  //     times,
  //   );
  // };
  // const decryptTextBig = (times = 1000) => {
  //   const keys = machines.generate(
  //     ` ${util.latinAlphabet}`,
  //     `A${util.latinAlphabet}`,
  //     4,
  //   );
  //   const system = crypt(keys);

  //   _doMetric(
  //     system.encrypt,
  //     [lorem],
  //     ['Full encryption.', 'Text: 116 letters.', 'FSM: Standard (27/4)'],
  //     times,
  //   );
  // };

  const runAll = () => {
    console.log('ALL METRICS:');

    fsmGen();
    fsmGenBig();

    cipherLetter();
    cipherLetterBalanced();

    encryptText();
    encryptTextBig();
  };

  /*

ALL METRICS:

FSM Generation. Alpbabet length: 27. Operational states: 4.
 1000 runs: 59.80405800000002 ms
 Single average: 0.05980405800000002 ms

FSM Generation. Alpbabet length: 52. Operational states: 8.
 1000 runs: 162.3497829999999 ms
 Single average: 0.1623497829999999 ms

Cipher generation. Single letter. Balancing: ON. FSM: Standard (27/4)
 1000 runs: 15.449449999999993 ms
 Single average: 0.015449449999999993 ms

Cipher generation. Single letter. Balancing: ON. FSM: Standard (27/4)
 1000 runs: 15.934977999999994 ms
 Single average: 0.015934977999999995 ms

Full encryption. Text: 44 letters. FSM: Standard (27/4)
 1000 runs: 702.314618 ms
 Single average: 0.702314618 ms

Full encryption. Text: 116 letters. FSM: Standard (27/4)
 1000 runs: 1684.044248000001 ms
 Single average: 1.684044248000001 ms

  */

  return {
    wordToWord,
    wordToArray,
    maxForWord,
    bestPerWord,
    maxForArray,
    measureExecutionTime,
    fsmGen,
    fsmGenBig,
    runAll,
  };
})();
