import * as _ from 'lodash';

/**
 * Makes an array filled with a value.
 *
 * @method dup
 * @param value {any} the array item value
 * @param n {number} the array size
 * @return the array of size *n* filled with *value*
 */
function dup(value: any, n: number) {
  return _.fill(new Array(n), value);
}

export { dup };
