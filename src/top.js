const config = require('../config');
const machines = require('./logic/machines');
const util = require('./util');

module.exports = (() => {
  const makeKeys = () => {
    const keys = machines.generate(
      config.sourceAlphabet,
      config.fsmAlphabet,
      config.fsmStates,
    );
    util.writeJSON(config.fsmSavePath, keys);
    util.writeHTML(config.fsmSavePath, machines.toHtml(keys));

    return keys;
  };

  const loadKeys = () => {
    let keys;
    try {
      keys = util.readJSON(config.fsmSavePath);
    } catch (e) {
      throw Error(`Invalid keys at ${config.fsmSavePath}`);
    }
    util.matchesAlphabet(Object.keys(keys), config.sourceAlphabet);
    util.matchesAlphabet(
      keys[config.sourceAlphabet[0]].alphabet,
      config.fsmAlphabet,
    );

    return keys;
  };

  const encrypt = (input, system) => {
    util.matchesAlphabet(input, config.sourceAlphabet);
    const encrypted = system.encrypt(input);

    return encrypted;
  };

  const decrypt = (input, system) => {
    util.matchesAlphabet(input, config.fsmAlphabet);
    const decrypted = system.decrypt(input);

    return decrypted;
  };

  return {
    makeKeys,
    loadKeys,
    decrypt,
    encrypt,
  };
})();
