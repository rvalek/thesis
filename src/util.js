module.exports = (() => {
  // Produces random element of a given array.
  const getRandomElement = arr => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);


  return { getRandomElement };
})();
