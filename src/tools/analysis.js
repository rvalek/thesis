const strSim = require('string-similarity');
const util = require('./util');
const machines = require('../logic/machines');

module.exports = (() => {
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

  const _runTimes = (f, args, n) => {
    let runningTotal = 0;
    for (let i = 0; i < n; i += 1) {
      runningTotal += f(...args).time;
    }

    console.log(`${n} runs: ${runningTotal} ms`);
    console.log(`Single average: ${runningTotal / n} ms`);
  };

  const timedFsmGen = (times = 1000) => {
    const timedFunc = measureExecutionTime(machines._generateSingle);
    const args = ['a', ['A', ...util.latinAlphabet], 4];

    console.log('\nFSM Generation. Alpbabet length: 27', 'Operational states: 4');
    _runTimes(times, timedFunc, args);
  };

  const timedFsmGenBig = (times = 1000) => {
    const timedFunc = measureExecutionTime(machines._generateSingle);
    const args = [
      'a',
      [...util.latinAlphabet.toUpperCase(), ...util.latinAlphabet],
      8,
    ];

    console.log('\nFSM Generation. Alpbabet length: 52', 'Operational states: 8');
    _runTimes(times, timedFunc, args);
  };

  const runAll = () => {
    console.log('All metrics:');
    timedFsmGen();
    timedFsmGenBig();
  };

  /*

All metrics:

FSM Generation. Alpbabet length: 27 Operational states: 4
1000 runs: 61.203843000000106 ms
Single average: 0.061203843000000105 ms

FSM Generation. Alpbabet length: 52 Operational states: 8
1000 runs: 163.0526160000002 ms
Single average: 0.1630526160000002 ms

  */

  return {
    wordToWord,
    wordToArray,
    maxForWord,
    bestPerWord,
    maxForArray,
    measureExecutionTime,
    timedFsmGen,
    timedFsmGenBig,
    runAll,
  };
})();
