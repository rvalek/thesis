const { makeDKA, randomWord, isWordAccepted } = require('./lib/chomsky');

(() => {
  const input = 'abcdeab';

  const inputAlpabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
  const minCypherLengthPerLetter = 3;

  const letterToDKA = letters => letters.reduce(
    (acc, letter) => ({ ...acc, [letter]: makeDKA(letter) }), {},
  );

  const allDKAs = letterToDKA([...inputAlpabet]);
  const C = (secretText) => {
    const x = Array.from(secretText)
      .map(letter => randomWord(allDKAs[letter], minCypherLengthPerLetter));

    return x.flat().join();
  };

  const acceptsWord = word => DKA => isWordAccepted(DKA, word);
  const DKAsByEndingSymbol = letter => Object.values(allDKAs).filter(dka => dka.acceptingCells.some(cell => cell.symbol === letter));

  function* parseBackwards(cypher) {
    const lastSymbol = cypher.slice(-1)[0];
    const possibleDKAs = DKAsByEndingSymbol(lastSymbol);

    if (!possibleDKAs) { return; }

    for (let i = -minCypherLengthPerLetter, subCypher, acceptingDKAs; i >= -cypher.length; i -= 1) {
      subCypher = cypher.slice(i);
      acceptingDKAs = possibleDKAs.filter(acceptsWord(subCypher));

      if (acceptingDKAs) {
        for (let j = 0; j < acceptingDKAs.length; j += 1) {
          yield { decyphered: acceptingDKAs[j].cyphersLetter, subCypher };
        }
      }
    }
  }

  const D = (cypher) => {
    let unparsed = cypher.split(',');
    let parser = parseBackwards(unparsed);
    let parsed = [];
    const points = [];

    let done;
    let value;
    let remainingCypher;


    while (unparsed.length !== 0) {
      ({ done, value } = parser.next());

      if (done) {
        if (points.length === 0) {
          return 'Decyphering failed.';
        }
        [unparsed, parser, parsed] = points.pop();
      } else {
        remainingCypher = unparsed.slice(0, -value.subCypher.length);

        points.push([unparsed, parser, parsed]);
        unparsed = remainingCypher;
        parser = parseBackwards(remainingCypher);
        parsed = [value.decyphered, ...parsed];
      }
    }

    return parsed.join('');
  };

  // const recParse = (unparsed, parser, parsed = '', points = []) => {
  //   if (unparsed.length === 0) { return parsed.split('').reverse().join(''); }

  //   const { done, value } = parser.next();

  //   if (done) {
  //     if (points.length === 0) {
  //       return 'Decyphering failed.';
  //     }
  //     return recParse(...points.pop(), points);
  //   }

  //   const remainingCypher = unparsed.slice(0, -value.subCypher.length);
  //   return recParse(
  //     remainingCypher,
  //     parseBackwards(remainingCypher),
  //     parsed.concat(value.decyphered),
  //     [...points, [unparsed, parser, parsed]],
  //   );
  // };

  // const D = (cypher) => {
  //   const asList = cypher.split(',');
  //   return recParse(asList, parseBackwards(asList));
  // };

  // const parseCypher = (cypher) => {
  //   const parsingPoints = [];
  //   let currentPoint = {
  //     // unparsed: cypher.match(/.{3}/g),
  //     unparsed: cypher.split(','),
  //     decyphered: '',
  //   };

  //   while (currentPoint.unparsed.length > 0) {
  //     currentPoint.parser = parseBackwards(currentPoint.unparsed);
  //     const { done, value } = currentPoint.parser.next();

  //     if (!done) {
  //       currentPoint.decyphered += value.decyphered;
  //       currentPoint.unparsed.length -= value.subCypher.length;
  //       parsingPoints.push({ ...currentPoint });
  //     } else {
  //       if (parsingPoints.length === 0) { return 'Illegel cypher'; }
  //       currentPoint = parsingPoints.pop();
  //     }
  //   }

  //   return currentPoint.decyphered;
  // };


  // const D = (cypheredText) => {
  //   // const allDKAs = Object.entries(DKAs);
  //   // const decypherWord = word => allDKAs
  //   //   .reduce((acc, [letter, dka]) => (isWordAccepted(dka, word) ? acc + letter : acc), '');

  //   const input = cypheredText
  //     .split(',');
  //   const decypheredLetters = [];


  //   for (let i = input.length; i >= 0;) {
  //     const DKAs = DKAsByEndingSymbol(input[i]);

  //     for (let j = i - minCypherLengthPerLetter - 1; ; j -= 1) {
  //       if (j < 0) {
  //         return 'Illegal input';
  //       }

  //       const attemptingWord = input.slice(j, i);

  //       const acceptingDKAs = DKAs.filter(acceptsWord(attemptingWord));
  //       if (acceptingDKAs.length !== 0) {
  //         i = j;
  //         decypheredLetters.push(acceptingDKAs.map(getCypheredLetter));
  //         break;
  //       }
  //     }
  //   }

  //   return decypheredLetters;
  // };

  // const parseCypher = (cypher, output, steps) => {
  //   if (cypher.length === 0) return output;

  //   const { cypherWord, letter } = findWord(cypher);

  //   if (letter !== null) {
  //     cypher.length -= cypherWord.length; // lel
  //     output += letter;
  //     parseCypher(cypher, output);
  //   } else {
  //     return null;
  //   }
  // };

  // //////////
  const cyphered = C(input);
  const decyphered = D(`${cyphered}`);

  console.log(input);
  // console.log(cyphered);
  // console.log(isWordAccepted(allDKAs.a, cyphered.split(',')));
  console.log(decyphered);
  // console.log(acceptingCells);
})();
