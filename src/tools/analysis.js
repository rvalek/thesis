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

  const _measureExecutionTime = (
    func,
    argGenerator,
    info,
    times,
    returnFuncResults = false,
  ) => {
    const timedFunc = util.addTiming(func);
    const funcResults = [];

    console.log('\n', ...info);

    const onePercent = times / 100;

    let runningTotal = 0;
    for (let i = 0; i < times; i += 1) {
      const {
        time,
        result,
      } = timedFunc(...argGenerator());

      runningTotal += time;

      if (returnFuncResults) {
        funcResults.push(result);
      }

      if ((i + 1) % onePercent === 0) {
        process.stdout.write('.');
      }
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);

    console.log(`  ${times} runs: ${(runningTotal).toFixed(3)} ms`);
    console.log(`  Average time: ${(runningTotal / times).toFixed(3)} ms`);

    return funcResults;
  };

  const fsmGen = (times) => {
    _measureExecutionTime(
      machines._generateSingle,
      () => defaultFsmConfig,
      ['FSM Generation.', 'Alphabet length: 27.', 'Operational states: 4.'],
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
      ['FSM Generation.', 'Alphabet length: 52.', 'Operational states: 8.'],
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
        'FSM: Standard (27/4).',
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
        'FSM: Standard (27/4).',
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
        'FSMs: Standard (27/4).',
      ],
      times,
      true,
    );

    const averageLength = ciphers.reduce((acc, next) => acc + next.length, 0) / ciphers.length;
    console.log(`  Average length increase: x${(averageLength / 43).toFixed(2)}`);
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
        'FSMs: Standard (27/4).',
      ],
      times,
      true,
    );

    const averageLength = ciphers.reduce((acc, next) => acc + next.length, 0) / ciphers.length;
    console.log(`  Average length increase: x${(averageLength / 115).toFixed(2)}`);
  };

  const decryptText = (times) => {
    const keys = machines.generate(...defaultKeysConfig);
    const system = crypt(keys);

    _measureExecutionTime(
      system.decrypt,
      () => [system.encrypt(_pangram, 3), 3],
      [
        'Full decryption.',
        'Source text: 43 characters.',
        'FSMs: Standard (27/4).',
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
        'Source text: 115 characters.',
        'FSMs: Standard (27/4).',
      ],
      times,
    );
  };

  const languageSimilarity = () => {
    const keys = machines.generate(...defaultKeysConfig);
    const stringPerLanguge = Object.values(keys).map(fsm => util.generateArray(() => words._generateBalanced(fsm), 100).join(''));
    const corsPerLanguage = stringPerLanguge.map((str, i) => stringPerLanguge.reduce((acc, next, j) => (j !== i ? [...acc, strSim.compareTwoStrings(str, next)] : acc), []));
    const avgCorPerLanguage = corsPerLanguage.map(cors => cors.reduce((acc, next) => acc + next) / cors.length);
    const totalAverage = avgCorPerLanguage.reduce((acc, next) => acc + next) / avgCorPerLanguage.length;

    console.log('\n', 'Average language similarity.', 'FSMs: Standard (27/4).');
    console.log(`  27 languages: ${(totalAverage * 100).toFixed(3)}%`);
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

    languageSimilarity();
  };

  /*

ALL METRICS:

 FSM Generation. Alphabet length: 27. Operational states: 4.
  1000 runs: 109.078 ms
  Average time: 0.109 ms

 FSM Generation. Alphabet length: 52. Operational states: 8.
  1000 runs: 343.742 ms
  Average time: 0.344 ms

 Cipher generation. Single letter. Balancing: OFF. FSM: Standard (27/4).
  1000 runs: 39.806 ms
  Average time: 0.040 ms

 Cipher generation. Single letter. Balancing: ON. FSM: Standard (27/4).
  1000 runs: 23.026 ms
  Average time: 0.023 ms

 Full encryption. Source text: 43 characters. FSMs: Standard (27/4).
  1000 runs: 1576.103 ms
  Average time: 1.576 ms
  Average length increase: x5.66

 Full encryption. Source text: 115 characters. FSMs: Standard (27/4).
  1000 runs: 3260.300 ms
  Average time: 3.260 ms
  Average length increase: x4.95

 Full decryption. Source text: 43 characters. FSMs: Standard (27/4).
  100 runs: 8090.241 ms
  Average time: 80.902 ms

 Full decryption. Source text: 115 characters. FSMs: Standard (27/4).
  100 runs: 163014.193 ms
  Average time: 1630.142 ms

 Average language similarity. FSMs: Standard (27/4).
  27 languages: 3.5%

  */

  return {
    runAll,
  };
})();
