/**
 * Take user-input string and convert it to a Manifold label
 */
export function labelify(word: string) {
  return word
    .trim() // remove surrounding whitespace
    .replace(/^(\d)/, 'option-$1') // if this starts with a number, preped “option-”
    .replace(/[\s/\\_,.:]/g, '-') // replace invalid characters with hyphens
    .toLocaleLowerCase(); // transform to lowercase
}

/**
 * Return the plural version of a singular word (it’s dumb; cut it some slack)
 */
export function pluralize(word: string) {
  if (word === word.toUpperCase()) {
    return word; // if this is an abbreviation
  }
  return word.replace(/y$/i, 'ie').replace(/s$/i, 'se').concat('s');
}

/**
 * Strip off trailing “s” (adjust as-needed)
 */
export function singularize(word: string) {
  return word.replace(/s$/, '');
}
