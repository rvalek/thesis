const { writeFile, readFileSync } = require('fs');


module.exports = (() => {
  const _htmlTable = (fsm) => {
    const headers = [`<i>${fsm.ciphersLetter}</i>`].concat(fsm.alphabet);

    headers.push('');

    const tableRows = [];

    for (let i = 0; i < fsm.states.length; i += 1) {
      tableRows.push(new Array(headers.length));
      for (let j = 0; j < headers.length; j += 1) {
        tableRows[i][j] = { text: [] };
      }
      tableRows[i][0] = { text: fsm.states[i].toString() };
      tableRows[i][headers.length - 1] = fsm.acceptingStates.includes(fsm.states[i])
        ? { text: ['1'] } : { text: ['0'] };
    }

    for (let i = 0; i < fsm.transitions.length; i += 1) {
      const transition = fsm.transitions[i];

      let colNum;
      let rowNum;

      for (let j = 0; j < fsm.states.length; j += 1) {
        if (fsm.states[j] === transition.fromState) {
          rowNum = j;
          break;
        }
      }

      for (let j = 0; j < fsm.alphabet.length; j += 1) {
        if (fsm.alphabet[j] === transition.symbol) {
          colNum = j + 1;
          break;
        }
      }

      if (typeof tableRows[rowNum][colNum].text === 'undefined') {
        tableRows[rowNum][colNum] = { text: [] };
      }

      tableRows[rowNum][colNum].text.push(transition.toStates);
    }

    const htmlString = [];

    htmlString.push("<table border='1'>");
    htmlString.push('  <tr>');

    for (let i = 0; i < headers.length; i += 1) {
      htmlString.push(`    <th>${headers[i].toString()}</th>`);
    }

    htmlString.push('  </tr>');

    for (let i = 0; i < tableRows.length; i += 1) {
      htmlString.push('  <tr>');
      for (let j = 0; j < tableRows[i].length; j += 1) {
        htmlString.push(`    <td>${tableRows[i][j].text}</td>`);
      }

      htmlString.push('  </tr>');
    }

    htmlString.push('</table>');
    return htmlString.join('\n');
  };

  const _makeHTML = FSMs => `<!DOCTYPE html><html><head></head><body>
  ${Object.values(FSMs).map(fsm => _htmlTable(fsm).join('</br>'))}
</body></html>`;

  const _save = (toPath, data) => {
    writeFile(toPath, data, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log(`Wrote ${toPath}`);
    });
  };

  const save = (savePath, fsms) => {
    _save(`${savePath}.json`, JSON.stringify(fsms));

    try {
      _save(`${savePath}.html`, _makeHTML(fsms));
    } catch (e) {
      console.log("Couldn't write HTML representation.");
    }

    return fsms;
  };

  const read = fromPath => JSON.parse(readFileSync(`${fromPath}.json`));

  return { save, read };
})();
