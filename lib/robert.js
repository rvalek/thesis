
const {
  randomWord, isWordAccepted,
} = require('./chomsky');


module.exports = (allDKAs, minLengthPerLetter = 3) => {
  const encrypt = (secretText) => {
    const x = Array.from(secretText)
      .map(letter => randomWord(allDKAs[letter]), minLengthPerLetter);

    return x.flat().join('');
  };

  const acceptsWord = word => DKA => isWordAccepted(DKA, word);
  const DKAsWithTerminatingSymbol = letter => Object.values(allDKAs).filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));
  const decipherSuffix = (cipher, minSuffixLength) => {
    const lastSymbol = cipher.slice(-1)[0];
    const possibleDKAs = DKAsWithTerminatingSymbol(lastSymbol);

    if (!possibleDKAs) { return null; }

    for (let suffix, acceptingDKA, j = minSuffixLength; j >= -cipher.length; j -= 1) {
      suffix = cipher.slice(j);
      acceptingDKA = possibleDKAs.find(acceptsWord(suffix));

      if (acceptingDKA !== undefined) {
        return { decipheredLetter: acceptingDKA.ciphersLetter, suffixLength: j };
      }
    }

    return null;
  };

  const decrypt = (cipher) => {
    let unparsed = cipher.split('');
    let deciphered = [];
    let suffixLength = -minLengthPerLetter;
    const continuationPoints = [];

    let found;

    while (unparsed.length !== 0) {
      found = decipherSuffix(unparsed, suffixLength);
      if (found === null) {
        if (continuationPoints.length === 0) {
          return 'Decryption failed.';
        }
        [unparsed, deciphered, suffixLength] = continuationPoints.pop();
      } else {
        continuationPoints.push([unparsed, deciphered, found.suffixLength - 1]);

        unparsed = unparsed.slice(0, found.suffixLength);
        deciphered = [found.decipheredLetter, ...deciphered];
        suffixLength = -minLengthPerLetter;
      }
    }

    console.log(`Decryption successful. Steps:\n${continuationPoints.map(([remainingCipher, alreadyDeciphered]) => `${remainingCipher.join('')} | ${alreadyDeciphered.join('')}`).join('\t\n')}`);

    return deciphered.join('');
  };


  return {
    encrypt, decrypt,
  };
};
