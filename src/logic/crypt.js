const words = require('./words');
const config = require('../../config');
const util = require('../tools/util');

module.exports = (FSMs, pregeneratedWords = null, minLengthPerLetter = config.minCipherLengthPerSourceLetter) => {
  const _GEN_WORDS_PER_CYCLE = 100;
  const _genWords = (fsm, numberOfWords) => util.generateArray(() => words.generate(fsm, minLengthPerLetter), numberOfWords);

  const wordStore = pregeneratedWords || Object.entries(FSMs).reduce((acc, [letter, fsm]) => ({
    ...acc,
    [letter]: _genWords(fsm, _GEN_WORDS_PER_CYCLE),
  }), {});

  const _nextWordForLetter = (letter) => {
    if (wordStore[letter].length === 0) {
      if (config.logging) {
        console.log(`Ran out of ciphers for '${letter}'. Generating new words.`);
      }

      wordStore[letter] = _genWords(FSMs[letter], _GEN_WORDS_PER_CYCLE);
    }

    const cipher = wordStore[letter].pop();

    console.log(`Chose '${cipher}' for '${letter}'.`);

    return cipher;
  };

  const _evenCheckLetter = config.sourceAlphabet[0];
  const _oddCheckLetter = config.sourceAlphabet[1];

  const _generateParityCipher = sourceText => _nextWordForLetter(util.isLengthEven(sourceText) ? _evenCheckLetter : _oddCheckLetter);

  const _checkDecryptedParity = decryptedText => (decryptedText.slice(-1) === _evenCheckLetter
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
      let suffixLength = minSuffixLength, acceptingFSM, word; suffixLength >= -subCipher.length; suffixLength -= 1
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

        return {
          decipheredLetter: acceptingFSM.ciphersLetter,
          suffixLength,
        };
      }
    }

    return null;
  };

  // Attempts to recover source text from a given cipher.
  const decrypt = (cipher) => {
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
        } else if (config.logging) {
          console.log('PARITY CHECK FAILED, RESUMING...');
        }
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
        suffixLength = -config.minCipherLengthPerSourceLetter;

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
  const encrypt = ([...sourceText]) => sourceText
    .map(letter => _nextWordForLetter(letter))
    .join('') + _generateParityCipher(sourceText);

  return {
    encrypt,
    decrypt,
    wordStore,
    FSMs,
  };
};
