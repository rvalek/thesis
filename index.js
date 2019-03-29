const { makeDKA, randomWord, isWordAccepted } = require('./lib/chomsky');

(() => {
  const input = 'abcdeab';

  const inputAlpabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const minCipherLengthPerLetter = 3;

  const letterToDKA = letters => letters.reduce(
    (acc, letter) => ({ ...acc, [letter]: makeDKA(letter) }), {},
  );

  const allDKAs = letterToDKA([...inputAlpabet]);
  const C = (secretText) => {
    const x = Array.from(secretText)
      .map(letter => randomWord(allDKAs[letter], minCipherLengthPerLetter));

    return x.flat().join();
  };

  const acceptsWord = word => DKA => isWordAccepted(DKA, word);
  const DKAsWithTerminatingSymbol = letter => Object.values(allDKAs).filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));

  const decipherSuffix = (cipher, minSuffixLength) => {
    const lastSymbol = cipher.slice(-1)[0];
    const possibleDKAs = DKAsWithTerminatingSymbol(lastSymbol);

    if (!possibleDKAs) { return null; }

    let j = minSuffixLength;

    for (let suffix, acceptingDKA; j >= -cipher.length; j -= 1) {
      suffix = cipher.slice(j);
      acceptingDKA = possibleDKAs.find(acceptsWord(suffix));

      if (acceptingDKA !== undefined) {
        return { decipheredLetter: acceptingDKA.ciphersLetter, suffixLength: j };
      }
    }

    return null;
  };

  const properD = (cipher) => {
    let unparsed = cipher.split(',');
    let deciphered = [];
    let suffixLength = -minCipherLengthPerLetter;
    const continuationPoints = [];

    let found;

    while (unparsed.length !== 0) {
      found = decipherSuffix(unparsed, suffixLength);
      if (found !== null) {
        continuationPoints.push([unparsed, deciphered, found.suffixLength - 1]);

        unparsed = unparsed.slice(0, found.suffixLength);
        deciphered = [found.decipheredLetter, ...deciphered];
        suffixLength = -minCipherLengthPerLetter;
      } else {
        if (continuationPoints.length === 0) {
          return 'Deciphering failed.';
        }
        [unparsed, deciphered, suffixLength] = continuationPoints.pop();
      }
    }

    return deciphered.join('');
  };


  // //////////
  const ciphered = C(input);
  const deciphered = properD(`${ciphered}`);

  console.log(input);
  // console.log(ciphered);
  // console.log(isWordAccepted(allDKAs.a, ciphered.split(',')));
  console.log(deciphered);
  // console.log(acceptingCells);
})();
