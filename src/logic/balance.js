module.exports = (() => {
  // const _imbalanceCount = ([...word], {
  //   left,
  //   right,
  // }) => word.reduce((counter, char) => {
  //   if (left.includes(char)) {
  //     return counter + 1;
  //   }
  //   if (right.includes(char)) {
  //     return counter - 1;
  //   }

  //   return counter;
  // }, 0);

  // const isBalanced = (word, halves, tolerance = 1) => Math.abs(_imbalanceCount(word, halves)) <= tolerance;

  const isBalanced = ([...word], { left, right }) => {
    const stack = [];
    for (let i = 0, char; i < word.length; i += 1) {
      char = word[i];

      if (left.includes(char)) {
        stack.push(char);
      } else if (right.includes(char) && stack.pop() === undefined) {
          return false;
        }
    }

    return stack.length === 0;
  };

  return {
    isBalanced,
  };
})();
