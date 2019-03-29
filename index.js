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

  // function* parseBackwards(cipher) {
  //   const lastSymbol = cipher.slice(-1)[0];
  //   const possibleDKAs = DKAsByEndingSymbol(lastSymbol);

  //   if (!possibleDKAs) { return; }

  //   for (let i = -minCipherLengthPerLetter, subCipher, acceptingDKAs; i >= -cipher.length; i -= 1) {
  //     subCipher = cipher.slice(i);
  //     acceptingDKAs = possibleDKAs.filter(acceptsWord(subCipher));

  //     if (acceptingDKAs) {
  //       for (let j = 0; j < acceptingDKAs.length; j += 1) {
  //         yield { deciphered: acceptingDKAs[j].ciphersLetter, subCipher };
  //       }
  //     }
  //   }
  // }

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

  // const D = (cipher) => {
  //   let unparsed = cipher.split(',');
  //   let parser = parseBackwards(unparsed);
  //   let parsed = [];
  //   const points = [];

  //   let done;
  //   let value;
  //   let remainingCipher;


  //   while (unparsed.length !== 0) {
  //     ({ done, value } = parser.next());

  //     if (done) {
  //       if (points.length === 0) {
  //         return 'Deciphering failed.';
  //       }
  //       [unparsed, parser, parsed] = points.pop();
  //     } else {
  //       remainingCipher = unparsed.slice(0, -value.subCipher.length);

  //       points.push([unparsed, parser, parsed]);
  //       unparsed = remainingCipher;
  //       parser = parseBackwards(remainingCipher);
  //       parsed = [value.deciphered, ...parsed];
  //     }
  //   }

  //   return parsed.join('');
  // };

  // const recParse = (unparsed, parser, parsed = '', points = []) => {
  //   if (unparsed.length === 0) { return parsed.split('').reverse().join(''); }

  //   const { done, value } = parser.next();

  //   if (done) {
  //     if (points.length === 0) {
  //       return 'Deciphering failed.';
  //     }
  //     return recParse(...points.pop(), points);
  //   }

  //   const remainingCipher = unparsed.slice(0, -value.subCipher.length);
  //   return recParse(
  //     remainingCipher,
  //     parseBackwards(remainingCipher),
  //     parsed.concat(value.deciphered),
  //     [...points, [unparsed, parser, parsed]],
  //   );
  // };

  // const D = (cipher) => {
  //   const asList = cipher.split(',');
  //   return recParse(asList, parseBackwards(asList));
  // };

  // const parseCipher = (cipher) => {
  //   const parsingPoints = [];
  //   let currentPoint = {
  //     // unparsed: cipher.match(/.{3}/g),
  //     unparsed: cipher.split(','),
  //     deciphered: '',
  //   };

  //   while (currentPoint.unparsed.length > 0) {
  //     currentPoint.parser = parseBackwards(currentPoint.unparsed);
  //     const { done, value } = currentPoint.parser.next();

  //     if (!done) {
  //       currentPoint.deciphered += value.deciphered;
  //       currentPoint.unparsed.length -= value.subCipher.length;
  //       parsingPoints.push({ ...currentPoint });
  //     } else {
  //       if (parsingPoints.length === 0) { return 'Illegel cipher'; }
  //       currentPoint = parsingPoints.pop();
  //     }
  //   }

  //   return currentPoint.deciphered;
  // };


  // const D = (cipheredText) => {
  //   // const allDKAs = Object.entries(DKAs);
  //   // const decipherWord = word => allDKAs
  //   //   .reduce((acc, [letter, dka]) => (isWordAccepted(dka, word) ? acc + letter : acc), '');

  //   const input = cipheredText
  //     .split(',');
  //   const decipheredLetters = [];


  //   for (let i = input.length; i >= 0;) {
  //     const DKAs = DKAsByEndingSymbol(input[i]);

  //     for (let j = i - minCipherLengthPerLetter - 1; ; j -= 1) {
  //       if (j < 0) {
  //         return 'Illegal input';
  //       }

  //       const attemptingWord = input.slice(j, i);

  //       const acceptingDKAs = DKAs.filter(acceptsWord(attemptingWord));
  //       if (acceptingDKAs.length !== 0) {
  //         i = j;
  //         decipheredLetters.push(acceptingDKAs.map(getCipheredLetter));
  //         break;
  //       }
  //     }
  //   }

  //   return decipheredLetters;
  // };

  // const parseCipher = (cipher, output, steps) => {
  //   if (cipher.length === 0) return output;

  //   const { cipherWord, letter } = findWord(cipher);

  //   if (letter !== null) {
  //     cipher.length -= cipherWord.length; // lel
  //     output += letter;
  //     parseCipher(cipher, output);
  //   } else {
  //     return null;
  //   }
  // };

  // //////////
  const ciphered = C(input);
  const deciphered = properD(`${ciphered}`);

  console.log(input);
  // console.log(ciphered);
  // console.log(isWordAccepted(allDKAs.a, ciphered.split(',')));
  console.log(deciphered);
  // console.log(acceptingCells);
})();
