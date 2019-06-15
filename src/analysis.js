const strSim = require('string-similarity');

module.exports = (() => {
  const wordToWord = (w1, w2) => strSim.compareTwoStrings(w1, w2);
  // const wordToMany = (w1, words) => strSim.findBestMatch(w1, words);
  const wordToArray = (w, ws) => ws.map(word => wordToWord(w, word));
  const maxForWord = (w, ws) => Math.max(...wordToArray(w, ws));
  const bestPerWord = (ws1, ws2) => ws1.map(word => maxForWord(word, ws2));
  const maxForArray = (ws1, ws2) => Math.max(...bestPerWord(ws1, ws2));

  const _nanosPerSec = 1e9;
  const measureTime = f => (...args) => {
    const time = process.hrtime();

    const result = f(...args);

    const diff = process.hrtime(time);
    console.log(
      `Execution tool ${diff[0] * _nanosPerSec + diff[1]} nanoseconds`,
    );

    return result;
  };

  return {
    wordToWord,
    wordToArray,
    maxForWord,
    bestPerWord,
    maxForArray,
    measureTime,
  };
})();
