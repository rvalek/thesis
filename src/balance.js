module.exports = (() => {
  const tolerance = 1;

  const _imbalanceCount = ([...word], { left, right }) => word.reduce((counter, char) => {
      if (left.includes(char)) {
        return counter + 1;
      }
      if (right.includes(char)) {
        return counter - 1;
      }

      return counter;
    }, 0);

  const check = (word, halves) => Math.abs(_imbalanceCount(word, halves)) <= tolerance;

  return { check };
})();
