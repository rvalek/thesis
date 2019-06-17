const fs = require('fs');
const { logging } = require('../../config');

module.exports = (() => {
  const latinAlphabet = 'abcdefghijklmnopqrstuvwxyz';

  // Produces random element of a given array.
  const getRandomElement = arr => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

  // Predicate of where lenght of the given entity is even
  const isLengthEven = e => e.length % 2 === 0;

  // Validates provided source text against supported encryption alphabet.
  const matchesAlphabet = (word, alphabet) => {
    if (![...word].every(char => alphabet.includes(char))) {
      throw Error(`Word "${word}" does not match alphabet: ${alphabet}`);
    }
    return word;
  };

  const _save = (toPath, data) => {
    const dir = toPath.slice(0, toPath.lastIndexOf('/'));

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFile(toPath, data, (err) => {
      if (logging) {
        console.log(err || `Wrote ${toPath}`);
      }
    });
  };

  const readJSON = fromPath => JSON.parse(fs.readFileSync(`${fromPath}.json`));
  const writeJSON = (toPath, data) => {
    _save(`${toPath}.json`, JSON.stringify(data));
  };
  const writeHTML = (toPath, data) => {
    _save(
      `${toPath}.html`,
      `<!DOCTYPE html><html><head></head><body>${data}</body></html>`,
    );
  };

  const generateArray = (producer, length) => Array(length)
      .fill()
      .map(producer);

  const shuffle = ([...a]) => {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      // eslint-disable-next-line no-param-reassign
      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  };

  const asHalves = ([...a]) => {
    const middleIndex = Math.floor(a.length / 2);
    return { left: a.slice(0, middleIndex), right: a.slice(middleIndex) };
  };

  const _imbalanceCount = ([...word], { left, right }) => word.reduce((counter, char) => {
      if (left.includes(char)) {
        return counter + 1;
      }
      if (right.includes(char)) {
        return counter - 1;
      }

      return counter;
    }, 0);

  const isBalanced = (word, halves, tolerance = 1) => Math.abs(_imbalanceCount(word, halves)) <= tolerance;

  const _microsInSec = 1e3;
  const _nanosInMicro = 1e6;
  const addTiming = func => (...args) => {
    const time = process.hrtime();

    const result = func(...args);

    const [seconds, nanos] = process.hrtime(time);

    return { result, time: seconds * _microsInSec + nanos / _nanosInMicro };
  };

  return {
    getRandomElement,
    isLengthEven,
    readJSON,
    writeJSON,
    writeHTML,
    matchesAlphabet,
    latinAlphabet,
    generateArray,
    shuffle,
    asHalves,
    isBalanced,
    addTiming,
  };
})();
