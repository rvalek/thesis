const strSim = require('string-similarity');
const util = require('./util');
const machines = require('../logic/machines');
const words = require('../logic/words');
const crypt = require('../logic/crypt');

module.exports = (() => {
  const _pangram = 'the quick brown fox jumps over the lazy dog';
  const _lorem = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed eu leo velit aliquam erat volutpat fusce nec turpis duis';

  const defaultFsmConfig = ['a', ['A', ...util.latinAlphabet], 4];
  const defaultKeysConfig = [
    ` ${util.latinAlphabet}`,
    `A${util.latinAlphabet}`,
    4,
  ];

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

  const _doMetric = (func, argGenerator, info, times) => {
    const timedFunc = measureExecutionTime(func);

    console.log('\n', ...info);

    const percent = times / 100;

    let runningTotal = 0;
    for (let i = 0; i < times; i += 1) {
      runningTotal += timedFunc(...argGenerator()).time;

      if ((i + 1) % percent === 0) {
        process.stdout.write('.');
      }
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    console.log(`  ${times} runs: ${runningTotal} ms`);
    console.log(`  Average: ${runningTotal / times} ms`);
  };

  const fsmGen = (times) => {
    _doMetric(
      machines._generateSingle,
      () => defaultFsmConfig,
      ['FSM Generation.', 'Alpbabet length: 27.', 'Operational states: 4.'],
      times,
    );
  };
  const fsmGenBig = (times) => {
    const args = [
      'a',
      [...util.latinAlphabet.toUpperCase(), ...util.latinAlphabet],
      8,
    ];

    _doMetric(
      machines._generateSingle,
      () => args,
      ['FSM Generation.', 'Alpbabet length: 52.', 'Operational states: 8.'],
      times,
    );
  };

  const cipherLetter = (times) => {
    const args = [machines._generateSingle(...defaultFsmConfig), 3];

    _doMetric(
      words._generateSingle,
      () => args,
      [
        'Cipher generation.',
        'Single letter.',
        'Balancing: OFF.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };
  const cipherLetterBalanced = (times) => {
    const args = [machines._generateSingle(...defaultFsmConfig), 3];

    _doMetric(
      words._generateBalanced,
      () => args,
      [
        'Cipher generation.',
        'Single letter.',
        'Balancing: ON.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };

  const encryptText = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    _doMetric(
      system.encrypt,
      () => [_pangram, 3],
      [
        'Full encryption.',
        'Source text: 44 characters.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };
  const encryptTextBig = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    _doMetric(
      system.encrypt,
      () => [_lorem, 3],
      [
        'Full encryption.',
        'Source text: 116 characters.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };

  const decryptText = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    _doMetric(
      system.decrypt,
      () => [system.encrypt(_pangram, 3), 3],
      [
        'Full decryption.',
        'Source text: 44 characters.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };
  const decryptTextBig = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    _doMetric(
      system.decrypt,
      () => [system.encrypt(_lorem, 3), 3],
      [
        'Full decryption.',
        'Source text: 116 characters.',
        'FSM: Standard (27/4)',
      ],
      times,
    );
  };

  const runAll = () => {
    console.log('ALL METRICS:');

    fsmGen(1000);
    fsmGenBig(1000);

    cipherLetter(1000);
    cipherLetterBalanced(1000);

    encryptText(1000);
    encryptTextBig(1000);

    decryptText(100);
    decryptTextBig(100);
  };

  /*

ALL METRICS:

 FSM Generation. Alpbabet length: 27. Operational states: 4.
  1000 runs: 59.33876699999991 ms
  Average: 0.05933876699999991 ms

 FSM Generation. Alpbabet length: 52. Operational states: 8.
  1000 runs: 197.64921200000012 ms
  Average: 0.19764921200000013 ms

 Cipher generation. Single letter. Balancing: OFF. FSM: Standard (27/4)
  1000 runs: 18.352156000000026 ms
  Average: 0.018352156000000026 ms

 Cipher generation. Single letter. Balancing: ON. FSM: Standard (27/4)
  1000 runs: 48.39357400000003 ms
  Average: 0.04839357400000003 ms

 Full encryption. Source text: 44 characters. FSM: Standard (27/4)
  1000 runs: 874.6428689999997 ms
  Average: 0.8746428689999997 ms

 Full encryption. Source text: 116 characters. FSM: Standard (27/4)
  1000 runs: 2293.5559540000027 ms
  Average: 2.2935559540000026 ms

 Full decryption. Source text: 44 characters. FSM: Standard (27/4)
  100 runs: 2762.3652460000008 ms
  Average: 27.623652460000006 ms

 Full decryption. Source text: 116 characters. FSM: Standard (27/4)
  100 runs: 146321.18213200005 ms
  Average: 1463.2118213200004 ms

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
