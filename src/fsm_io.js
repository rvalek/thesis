const { writeFile, readFileSync } = require('fs');
const chom = require('./chom');
const config = require('../config');


module.exports = (() => {
  const _save = (toPath, data) => {
    writeFile(toPath, data, (err) => {
      if (err) {
        return console.log(err);
      }
      console.log(`Wrote ${toPath}.`);
    });
  };

  const generate = () => {
    const alphaDKAs = chom.dkasForAlphabet(config.sourceAlphabet);

    _save(`${config.fsmSavePath}.json`, JSON.stringify(alphaDKAs));
    _save(`${config.fsmSavePath}.html`, chom.makeHTML(alphaDKAs));

    return alphaDKAs;
  };

  const read = () => JSON.parse(readFileSync(`${config.fsmSavePath}.json`));

  return { generate, read };
})();
