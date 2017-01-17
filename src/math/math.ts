import * as _ from 'lodash';

/**
 * Computes the minimum and maxiumum value of `collection`.
 * This method complements the lodash
 * [http://devdocs.io/lodash~4/index#minBy](minBy) and
 * [http://devdocs.io/lodash~4/index#maxBy](maxBy) functions
 * by allowing an Object `collection`, supplying the
 * `iteratee` two arguments (_value_, _key_), and iterating
 * only once over the collection. Non-numeric and non-finite
 * iteration results are ignored. If there is no numeric,
 * finite iteration result, then this method returns
 * `undefined`.
 *
 * @method bounds
 * @param collection {Object|any[]} the collection to
 *   iterate over
 * @param iteratee {function=_.identity} the iteratee
 *   invoked per element
 * @return the [min, max] bounds
 */
function bounds(collection: Object|any[], iteratee=_.identity) {
  let minTarget;
  let maxTarget;
  let minValue;
  let maxValue;
  let check = (value, key) => {
    let target = iteratee(value, key);
    if (_.isFinite(target)) {
      if (_.isUndefined(min) || target < minTarget) {
        minTarget = target;
        minValue = value;
      }
      if (_.isUndefined(max) || target > maxTarget) {
        maxTarget = target;
        maxValue = value;
      }
    }
  };
  _.forEach(collection, check);

  return _.isUndefined(minValue) ? undefined : [minValue, maxValue];
}

export { bounds };
