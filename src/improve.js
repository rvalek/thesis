module.exports = (() => {
  const opening = 'abcdefghijklm';
  const closing = 'nopqrstuvwxyz';

  const tolerance = 1;

  const _imbalanceCount = ([...word]) => word.reduce((counter, char) => {
      if (opening.includes(char)) {
        return counter + 1;
      }
      if (closing.includes(char)) {
        return counter - 1;
      }

      return counter;
    }, 0);

  const isBalanced = word => Math.abs(_imbalanceCount(word)) <= tolerance;

  return { isBalanced };
})();
