
const chom = require('./chomsky');


module.exports = (allDKAs, minLengthPerLetter = 3) => {
  const encrypt = secretText => Array.from(secretText)
    .map(letter => chom.randomWord(allDKAs[letter]), minLengthPerLetter)
    .flat()
    .join('');

  const decrypt = (cipher) => {
    const acceptsWord = word => DKA => chom.isWordAccepted(DKA, word);
    const decipherSuffix = (subCipher, minSuffixLength) => {
      const possibleDKAs = chom.dkasWithTerminatingSymbol(allDKAs, subCipher[subCipher.length - 1]);

      if (!possibleDKAs) { return false; }

      for (let suffixLength = minSuffixLength, acceptingDKA; suffixLength >= -subCipher.length; suffixLength -= 1) {
        acceptingDKA = possibleDKAs.find(acceptsWord(subCipher.slice(suffixLength)));

        if (acceptingDKA !== undefined) {
          return { decipheredLetter: acceptingDKA.ciphersLetter, suffixLength };
        }
      }

      return false;
    };

    let unparsed = cipher;
    let deciphered = '';
    let suffixLength = -minLengthPerLetter;
    const continuationPoints = [];

    let found;

    while (unparsed.length !== 0) {
      found = decipherSuffix(unparsed, suffixLength);
      if (found) {
        continuationPoints.push([unparsed, deciphered, found.suffixLength - 1]);

        unparsed = unparsed.slice(0, found.suffixLength);
        deciphered = found.decipheredLetter + deciphered;
        suffixLength = -minLengthPerLetter;
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
