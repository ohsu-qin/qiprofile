import * as _ from 'lodash';
import * as d3 from 'd3';

/**
 * This Color pseduo-class represents the `color` exports.
 *
 * @module visualization
 * @class Color
 */

/**
 * The color chooser.
 *
 * @method colorize
 * @static
 * @param data {Object[]} the input data objects
 * @param value {string} the property to call on the data
 * @return {function} the {color, opacity} D3 functions
 */
function colorize(data: Object[], value?: string): Object {
  // The default key is the data index.
  let indexOf = (d, i) => i;
  // The key accessor function.
  let toGetter = property => d => _.get(d, property);
  // The key function maps the input to a reference. The default key
  // function assigns each object to its position in the data array.
  let keyAccessor = property => property ? toGetter(property) : indexOf;
  // Converts the data to the mapped, sorted values.
  let toSortedValues = accessor =>
    _.flow(_.map, _.sortBy, _.sortedUniq)(data, accessor);
  // The sorted unique value domain function.
  let valueDomain = accessor =>
    _.flow(toSortedValues, _.sortedUniq)(accessor);

  // The color key function.
  let colorKey = keyAccessor(value);
  // The color value domain.
  let colorDomain = valueDomain(colorKey);
  // The scale maps to 10 colors, wrapping around if necessary.
  let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    .domain(colorDomain);
  // The color chooser maps the input to a RGB color.
  let colorValue = _.flow(colorKey, colorScale);

  // The opacity chooser effectively expands the 10-color chooser
  // to differentiate colors in a domain with more than 10 color
  // values.
  let div10 = value => value / 10;
  let opacityKey = _.flow(colorValue, div10, Math.floor);
  let opacityDomain = valueDomain(opacityKey);
  let opacityScale = d3.scaleLinear()
    .domain(opacityDomain)
    .range([0, 0.5]);
  // Convert to [1, 0.5] range.
  let inverse = value => 1 - value;
  // Map the input to an opacity from 1.0 to 0.5.
  let opacityValue = _.flow(opacityKey, opacityScale, inverse);

  return {
    color: colorValue,
    opacity: opacityValue
  };
}

export { colorize };
