const words = require('./words');
const config = require('../config');
const improve = require('./improve');

module.exports = (FSMs) => {
  const _acceptsWord = word => DKA => words.isAccepted(DKA, word);
  const _dkasWithTeminatingSymbol = letter => Object.values(FSMs).filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));

  const _decipherSuffix = (subCipher, minSuffixLength) => {
    const possibleDKAs = _dkasWithTeminatingSymbol(
      subCipher[subCipher.length - 1],
    );

    if (!possibleDKAs) {
      return null;
    }

    for (
      let suffixLength = minSuffixLength, acceptingDKA, word;
      suffixLength >= -subCipher.length;
      suffixLength -= 1
    ) {
      word = subCipher.slice(suffixLength);
      if (improve.isBalanced(word)) {
        acceptingDKA = possibleDKAs.find(_acceptsWord(word));

        if (acceptingDKA !== undefined) {
          return { decipheredLetter: acceptingDKA.ciphersLetter, suffixLength };
        }
      }
    }

    return null;
  };

  const decrypt = (
    cipher,
    minLengthPerLetter = config.minCypherLengthPerSourceLetter,
  ) => {
    let unparsed = cipher;
    let deciphered = '';
    let suffixLength = -minLengthPerLetter;
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

    if (config.logging) {
      console.log(
        `Decryption successful. Steps:\n${continuationPoints
          .map(
            ([remainingCipher, alreadyDeciphered]) => `${remainingCipher} | ${alreadyDeciphered}`,
          )
          .join('\t\n')}`,
      );
    }

    return deciphered;
  };

  // Produces a cipher string for a given source string.
  const encrypt = ([...sourceText]) => sourceText.map(letter => words.generate(FSMs[letter])).join('');

  return {
    encrypt,
    decrypt,
  };
};
