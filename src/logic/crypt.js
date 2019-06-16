const words = require('./words');
const config = require('../../config');
const util = require('../util');

// TODO: does parity check actually word? -- I think it does

module.exports = (FSMs) => {
  const evenCheckLetter = config.sourceAlphabet[0];
  const oddCheckLetter = config.sourceAlphabet[1];

  const _generateParityCipher = sourceText => words.generate(
      FSMs[util.isLengthEven(sourceText) ? evenCheckLetter : oddCheckLetter],
    );
  // const _checkDecryptedParity = decryptedText =>
  //   (decryptedText.length + 1) % 2 ===
  //   (decryptedText.slice(-1) === evenCheckLetter ? 0 : 1);

  const _checkDecryptedParity = decryptedText => (decryptedText.slice(-1) === evenCheckLetter
      ? !util.isLengthEven(decryptedText)
      : util.isLengthEven(decryptedText));

  const _acceptsWord = word => fsm => words.isAccepted(fsm, word);

  const _fsmsWithTeminatingSymbol = letter => Object.values(FSMs).filter(fsm => fsm.acceptingCells.some(cell => cell.symbol === letter));

  const _decipherSuffix = (subCipher, minSuffixLength) => {
    if (subCipher.length === 0) {
      return null;
    }

    const possibleFSMs = _fsmsWithTeminatingSymbol(
      subCipher[subCipher.length - 1],
    );

    if (possibleFSMs.length === 0) {
      return null;
    }

    for (
      let suffixLength = minSuffixLength, acceptingFSM, word;
      suffixLength >= -subCipher.length;
      suffixLength -= 1
    ) {
      word = subCipher.slice(suffixLength);
      acceptingFSM = possibleFSMs.find(_acceptsWord(word));

      if (config.logging) {
        console.log(`   Trying to decipher fragment: ${word}`);
      }

      if (acceptingFSM !== undefined) {
        if (config.logging) {
          console.log(` Deciphered ${word} as ${acceptingFSM.ciphersLetter}`);
        }

        return { decipheredLetter: acceptingFSM.ciphersLetter, suffixLength };
      }
    }

    return null;
  };

  // Attempts to recover source text from a given cipher.
  const decrypt = (
    cipher,
    minLengthPerLetter = config.minCypherLengthPerSourceLetter,
  ) => {
    let remainingCipher = cipher;
    let deciphered = '';
    let suffixLength = -minLengthPerLetter;
    const continuationPoints = [];

    let found;

    for (;;) {
      if (remainingCipher.length === 0) {
        if (_checkDecryptedParity(deciphered)) {
          if (config.logging) console.log('PARITY CHECK PASSED.');
          break;
        } else if (config.logging) { console.log('PARITY CHECK FAILED, RESUMING...'); }
      }

      found = _decipherSuffix(remainingCipher, suffixLength);
      if (found) {
        continuationPoints.push([
          remainingCipher,
          deciphered,
          found.suffixLength - 1,
        ]);

        remainingCipher = remainingCipher.slice(0, found.suffixLength);
        deciphered = found.decipheredLetter + deciphered;
        suffixLength = -config.minCypherLengthPerSourceLetter;

        if (config.logging) {
          console.log(`Decryption step: ${remainingCipher} | ${deciphered}`);
        }
      } else {
        if (continuationPoints.length === 0) {
          return 'Decryption failed.';
        }

        [remainingCipher, deciphered, suffixLength] = continuationPoints.pop();

        if (config.logging) {
          console.log(
            `Found dead deciphering branch. Backtracking to: ${remainingCipher} | ${deciphered}`,
          );
        }
      }
    }

    // removing parity letter from deciphered text
    return deciphered.slice(0, deciphered.length - 1);
  };

  // Produces a cipher string for a given source string.
  const encrypt = ([...sourceText]) => sourceText.map(letter => words.generate(FSMs[letter])).join('')
    + _generateParityCipher(sourceText);

  return {
    encrypt,
    decrypt,
  };
};
