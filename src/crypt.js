
const words = require('./words');
const config = require('../config');


module.exports = (allDKAs) => {
  const encrypt = secretText => Array.from(secretText)
    .map(letter => words.generate(allDKAs[letter]))
    .flat()
    .join('');

  const _acceptsWord = word => DKA => words.isAccepted(DKA, word);
  const _dkasWithTeminatingSymbol = letter => Object.values(allDKAs)
    .filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));

  const _decipherSuffix = (subCipher, minSuffixLength) => {
    const possibleDKAs = _dkasWithTeminatingSymbol(subCipher[subCipher.length - 1]);

    if (!possibleDKAs) { return false; }

    for (let suffixLength = minSuffixLength, acceptingDKA; suffixLength >= -subCipher.length; suffixLength -= 1) {
      acceptingDKA = possibleDKAs.find(_acceptsWord(subCipher.slice(suffixLength)));

      if (acceptingDKA !== undefined) {
        return { decipheredLetter: acceptingDKA.ciphersLetter, suffixLength };
      }
    }

    return false;
  };

  const decrypt = (cipher) => {
    let unparsed = cipher;
    let deciphered = '';
    let suffixLength = -config.minCypherLengthPerSourceLetter;
    const continuationPoints = [];

    let found;

    while (unparsed.length !== 0) {
      found = _decipherSuffix(unparsed, suffixLength);
      if (found) {
        continuationPoints.push([unparsed, deciphered, found.suffixLength - 1]);

        unparsed = unparsed.slice(0, found.suffixLength);
        deciphered = found.decipheredLetter + deciphered;
        suffixLength = -config.minCypherLengthPerSourceLetter;
      } else {
        if (continuationPoints.length === 0) {
          return 'Decryption failed.';
        }
        [unparsed, deciphered, suffixLength] = continuationPoints.pop();
      }
    }

    console.log(`Decryption successful. Steps:\n${continuationPoints
      .map(([remainingCipher, alreadyDeciphered]) => `${remainingCipher} | ${alreadyDeciphered}`)
      .join('\t\n')}`);

    return deciphered;
  };


  return {
    encrypt, decrypt,
  };
};
