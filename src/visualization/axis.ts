import * as _ from 'lodash';

/**
 * The value accessor signature.
 *
 * @module visualization
 * @class ValueAccessor
 */
interface ValueAccessor {
  /**
   * @function anonymous
   * @param data {Object} the input data object
   * @return {number} the data value to display
   */
  (data: Object): number;
}

/**
 * The d3 axis setting.
 *
 * @module visualization
 * @class Axis
 */
export class Axis {
  /**
   * The required axis size in pixels.
   *
   * @property size {number}
   */
  size: number;
  
  /**
   * The required value accessor function or (possibly nested)
   * property specification, e.g. `name.last` to access the
   * data object *d* *d.name.last* value.
   *
   * @property value {string | ValueAccessor}
   */
  value: string | ValueAccessor;

  /**
   * The additionl axis options, consisting of the following:
   * * label - the axis label
   * * orientation -  axis orientation (`top`, 'bottom`, 'left` or 'right`)
   * * transform - axis transform, e.g. `rotate(-90)`
   *
   * The default label is inferred from 
   *
   * @property opts {Object}
   */
  opts: Object;

  /**
   * The axis label. If the axis `value` is a function, then the label is
   * a required option. Otherwise, the default label is inferred from
   * the `value` property path terminal property.
   *
   * @example
   *     axis = new Axis(600, ') 
   *
   * @property label {string}
   */
  label: string;

  /**
   * The required axis orientation
   * (`top`, 'bottom`, 'left` or 'right`).
   *
   * @property orientation {string}
   */
  orientation: string;

  /**
   * The optional axis transform, e.g. `rotate(-90)`.
   *
   * @property transform {string}
   */
  transform: string;
  
  constructor(public size: number, value: ValueAccessor, opts?: Object = {}) {
    this.value = _.isString(value) ? _.partialRight(_.get, value) : value;
  }
}
