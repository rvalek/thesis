const { writeFile, readFileSync } = require('fs');
const config = require('../config');

module.exports = (() => {
  const latinAlphabet = 'abcdefghijklmnopqrstuvwxyz';

  // Produces random element of a given array.
  const getRandomElement = arr => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

  // Predicate of where lenght of the given entity is even
  const ofEvenLength = e => e.length % 2 === 0;

  // Validates provided source text against supported encryption alphabet.
  const validateInput = (word) => {
    if (![...word].every(char => config.sourceAlphabet.includes(char))) {
      throw Error(`Input alphabet is limited to: ${config.sourceAlphabet}`);
    }
    return word;
  };

  const _save = (toPath, data) => {
    writeFile(toPath, data, (err) => {
      console.log(err || `Wrote ${toPath}`);
    });
  };

  const readJSON = fromPath => JSON.parse(readFileSync(`${fromPath}.json`));
  const writeJSON = (toPath, data) => {
    _save(`${toPath}.json`, JSON.stringify(data));
  };
  const writeHTML = (toPath, data) => {
    _save(
      `${toPath}.html`,
      `<!DOCTYPE html><html><head></head><body>${data}</body></html>`,
    );
  };

  const generateArray = (producer, length) => Array(length).fill().map(producer);

  return {
    getRandomElement,
    ofEvenLength,
    readJSON,
    writeJSON,
    writeHTML,
    validateInput,
    latinAlphabet,
    generateArray,
  };
})();
