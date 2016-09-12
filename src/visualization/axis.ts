import * as _ from 'lodash';
import * as _s from 'underscore.string';

/**
 * The value accessor signature.
 *
 * @module visualization
 * @class ValueAccessor
 */
interface ValueAccessor {
  /**
   * @method anonymous
   * @param data {Object} the input data object
   * @return {number} the data value to display
   */
  (data: Object): number;
}

/**
 * The plot axis setting.
 *
 * @module visualization
 * @class Axis
 */
export class Axis {
  /**
   * The required value accessor function or (possibly nested)
   * property specification, e.g. `name.last` to access the
   * data object *d* *d.name.last* value.
   *
   * @property value {string | ValueAccessor}
   */
  value: string | ValueAccessor;

  /**
   * The required axis size in pixels.
   *
   * @property size {number}
   */
  size: number;

  /**
   * The axis label. If the axis `value` is a function, then the label is
   * a required option. Otherwise, the default label is inferred from
   * the `value` property path terminal property.
   *
   * @example
   *     let axis = new Axis({size: 200, value: 'path.to.xProperty'});
   *     axis.label // => "X Property";
   *
   * @property label {string}
   */
  label: string;

  /**
   * The optional axis orientation (`top`, 'bottom`, 'left` or 'right`).
   * The default is `bottom` for the X axis, `top` for the Y axis.
   *
   * @property orientation {string}
   */
  orientation: string;

  /**
   * Makes a new `Axis` setting.
   * The axis input configuration consists of the following:
   * * size - the required {{#crossLink "Axis/size:property"}}{{/crossLink}}
   * * value - the required {{#crossLink "Axis/value:property"}}{{/crossLink}}
   * * orientation - the required {{#crossLink "Axis/orientation:property"}}{{/crossLink}}
   * * label - the optional {{#crossLink "Axis/label:property"}}{{/crossLink}}
   *
   * @method constructor
   * @param config {Object} the input configuration
   */
  constructor(config: Object) {
    if (!config.size) {
      throw new Error('The required axis size is missing');
    }
    this.size = config.size;

    let value = config.label;
    if (!value) {
      throw new Error('The required axis value is missing');
    }
    this.value = _.isString(value) ? _.partialRight(_.get, value) : value;

    let label = config.label;
    if (label) {
      this.label = label;
    } else if (_.isString(value)) {
        let last = _.last(value.split('.'));
        this.label = _s.humanize(last).split(' ').map(_s.capitalize).join(' ');
    } else {
      throw new Error('The label cannot be inferred without a property' +
                      ' name value');
    }

    this.orientation = config.orientation;
  }
}
