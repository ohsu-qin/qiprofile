import * as _ from 'lodash';
import * as d3 from 'd3';

/**
 * This Symbol pseduo-class represents the `symbol` exports.
 *
 * @module visualization
 * @class Symbol
 */

/**
 * The
 * [D3 v4 symbol types](https://github.com/d3/d3-shape/blob/master/README.md#symbols)
 * sorted by inverse preference.
 * @property SYMBOL_SIZE {number}
 * @static
 * @private
 */
const SYMBOL_TYPES = [
  d3.symbolCircle, d3.symbolDiamond, d3.symbolStar, d3.symbolTriangle,
  d3.symbolSquare, d3.symbolCross, d3.symbolWye
];

/**
 * The symbol chooser size.
 *
 * @property SYMBOL_SIZE {number}
 * @static
 * @private
 */
const SYMBOL_SIZE = 40;

/**
 * The symbol chooser.
 *
 * @method symbolize
 * @static
 * @param data {Object[]} the input data objects
 * @param value {string} property to call on the data
 * @return {function} the D3 symbol function
 */
function symbolize(data: Object[], value?: string): Object {
  // The default key is the data index.
  let indexOf = (d, i) => i;
  // The key accessor function.
  let toGetter = property => d => _.get(d, property);
  // Helper function to convert an array into an index lookup.
  let accumIndexLookup = (accum, key, i) => accum[key] = i;
  let toIndexLookup = array =>
    _.transform(array, accumIndexLookup, {});
  // Converts the data to the mapped, sorted values.
  let toSortedValues = accessor =>
    _.flow(_.map, _.sortBy, _.sortedUniq)(data, accessor);
  // The sorted unique value domain function.
  let valueDomain = accessor =>
    _.flow(toSortedValues, _.sortedUniq)(accessor);

  // The symbol key function.
  let symbolKey = value ? toGetter(value) : indexOf;
  // Group the objects by the symbol key.
  let symbolDomain = valueDomain(symbolKey);
  let symbolIndexLookup = toIndexLookup(symbolDomain);
  // Look up the the symbol by index mod the symbol count.
  let symbolLookup = (d, i) =>
    SYMBOL_TYPES[symbolIndexLookup(d, i) % SYMBOL_TYPES.length];
  // The symbol chooser maps the input to a symbol.
  return d3.symbol().type(symbolLookup).size(SYMBOL_SIZE);
}

export { symbolize };
