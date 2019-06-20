const config = require('../config');
const crypt = require('./logic/crypt');
const machines = require('./logic/machines');
const util = require('./tools/util');

module.exports = (() => {
  const newKeys = () => {
    const system = crypt(machines.generate(
      config.sourceAlphabet,
      config.fsmAlphabet,
      config.fsmStates,
    ));

    util.writeJSON(config.keysSavePath, system);

    if (config.logging) {
      util.writeHTML(`${config.keysSavePath}FSMs`, machines.toHtml(system.FSMs));
      util.writeJSON(`${config.keysSavePath}Words`, system.wordStore);
    }

    return system;
  };

  const loadKeys = () => {
    let keys;
    try {
      keys = util.readJSON(config.keysSavePath);
    } catch (e) {
      throw Error(`Invalid keys at ${config.keysSavePath}`);
    }

    util.matchesAlphabet(Object.keys(keys.FSMs), config.sourceAlphabet);
    util.matchesAlphabet(
      keys.FSMs[config.sourceAlphabet[0]].alphabet,
      config.fsmAlphabet,
    );

    if (config.logging) {
      console.log(`Loaded keys from: ${config.keysSavePath}`);
    }

    return crypt(keys.FSMs, keys.wordStore);
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
    newKeys,
    loadKeys,
    decrypt,
    encrypt,
  };
})();
