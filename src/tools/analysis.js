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
  const addTiming = f => (...args) => {
    const time = process.hrtime();

    const result = f(...args);

    const [seconds, nanos] = process.hrtime(time);

    return { result, time: seconds * _microsInSec + nanos / _nanosInMicro };
  };

  const _measureExecutionTime = (
    func,
    argGenerator,
    info,
    times,
    returnFuncResults = false,
  ) => {
    const timedFunc = addTiming(func);
    const funcResults = [];

    console.log('\n', ...info);

    const percent = times / 100;

    let runningTotal = 0;
    for (let i = 0; i < times; i += 1) {
      const { time, result } = timedFunc(...argGenerator());

      runningTotal += time;

      if (returnFuncResults) {
        funcResults.push(result);
      }

      if ((i + 1) % percent === 0) {
        process.stdout.write('.');
      }
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    console.log(`  ${times} runs: ${runningTotal} ms`);
    console.log(`  Average time: ${runningTotal / times} ms`);

    return funcResults;
  };

  const fsmGen = (times) => {
    _measureExecutionTime(
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

    _measureExecutionTime(
      machines._generateSingle,
      () => args,
      ['FSM Generation.', 'Alpbabet length: 52.', 'Operational states: 8.'],
      times,
    );
  };

  const cipherLetter = (times) => {
    const args = [machines._generateSingle(...defaultFsmConfig), 3];

    _measureExecutionTime(
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

    _measureExecutionTime(
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

    const ciphers = _measureExecutionTime(
      system.encrypt,
      () => [_pangram, 3],
      [
        'Full encryption.',
        'Source text: 43 characters.',
        'FSM: Standard (27/4)',
      ],
      times,
      true,
    );

    const averageLength = ciphers.reduce((acc, next) => acc + next.length, 0) / ciphers.length;
    console.log(`  Average length increase: x${averageLength / 43}`);
  };
  const encryptTextBig = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    const ciphers = _measureExecutionTime(
      system.encrypt,
      () => [_lorem, 3],
      [
        'Full encryption.',
        'Source text: 115 characters.',
        'FSM: Standard (27/4)',
      ],
      times,
      true,
    );

    const averageLength = ciphers.reduce((acc, next) => acc + next.length, 0) / ciphers.length;
    console.log(`  Average length increase: x${averageLength / 115}`);
  };

  const decryptText = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    _measureExecutionTime(
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

    _measureExecutionTime(
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
  1000 runs: 65.51263400000009 ms
  Average time: 0.0655126340000001 ms

 FSM Generation. Alpbabet length: 52. Operational states: 8.
  1000 runs: 235.9153329999996 ms
  Average time: 0.23591533299999962 ms

 Cipher generation. Single letter. Balancing: OFF. FSM: Standard (27/4)
  1000 runs: 20.076099000000017 ms
  Average time: 0.020076099000000017 ms

 Cipher generation. Single letter. Balancing: ON. FSM: Standard (27/4)
  1000 runs: 28.768396000000017 ms
  Average time: 0.028768396000000016 ms

 Full encryption. Source text: 43 characters. FSM: Standard (27/4)
  1000 runs: 976.3135669999998 ms
  Average time: 0.9763135669999998 ms
  Average length increase: x5.070348837209303

 Full encryption. Source text: 115 characters. FSM: Standard (27/4)
  1000 runs: 2170.1840189999984 ms
  Average time: 2.1701840189999984 ms
  Average length increase: x5.644695652173913

 Full decryption. Source text: 44 characters. FSM: Standard (27/4)
  100 runs: 5918.435308999999 ms
  Average time: 59.18435308999999 ms

 Full decryption. Source text: 116 characters. FSM: Standard (27/4)
  100 runs: 71993.55851599999 ms
  Average time: 719.9355851599998 ms

  */

  return {
    wordToWord,
    wordToArray,
    maxForWord,
    bestPerWord,
    maxForArray,
    measureExecutionTime: addTiming,
    runAll,
  };
})();
