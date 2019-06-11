module.exports = (() => {
  // Produces random element of a given array.
  const getRandomElement = arr => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

  // Predicate of where lenght of the given entity is even
  const ofEvenLength = e => e.length % 2 === 0;


  return { getRandomElement, ofEvenLength };
})();
