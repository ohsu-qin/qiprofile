import * as _ from 'lodash';
import {
  Component, Input, OnInit, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';

import StringHelper from '../string/string-helper.coffee';
import ObjectHelper from '../object/object-helper.coffee';

const MISSING_LABEL = 'Not Specified';

@Component({
  selector: 'qi-property-table',
  templateUrl: '/public/html/common/property-table.html',
  // Instruct Angular to disable change detection until this
  // component tells it to do so.
  changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * The property table displays object properties.
 *
 * @module common
 * @class PropertyTableComponent
 */
export class PropertyTableComponent implements OnInit {
  /**
   * The input object holding the properties to display.
   *
   * @property object: Object
   */
  @Input() object: Object;

  /**
   * The property path to the
   * {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}.
   * If this input path is set, then it is prepended to each object property
   * path for label lookup.
   *
   * @property path {string}
   */
  @Input() path: string;

  /**
   * The optional title displayed above the table.
   *
   * @property title: string
   */
  @Input() title: string;

  /**
   * The property name => label function, used as described in
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}.
   *
   * The return value can be unescaped HTML, i.e. embedded HTML is
   * interpreted. For example, `&tau;<sub>i</sub>` displays as
   * <span>&tau;<sub>i</sub></span>.  A simple string return value
   * is displayed as the string value. A null or undefined return
   * is displayed as the
   * {{#crossLink "PropertyTableComponent/getLabel"}}{{/crossLink}}
   * default.
   *
   * @property label {function}
   */
  @Input() label: (key: string) => string;

  /**
   * The optional property names to always include, whether
   * or not there is a non-null property value. This property
   * has precedence if the
   * {{#crossLink "PropertyTableComponent/validate"}}{{/crossLink}}
   * flag is `true`.
   *
   * @property include {string[]}
   */
  @Input() include: string[];

  /**
   * The optional property names to ignore. If the
   * {{#crossLink "PropertyTableComponent/parent:property"}}{{/crossLink}}
   * is set, then any property which references the parent is ignored.
   *
   * @property exclude {string[]}
   */
  @Input() exclude: string[];

  /**
   * Flag indicating whether to display `Not Specified`
   * for properties which are set to null (default true).
   *
   * @property validate {boolean}
   */
  @Input() validate: boolean;

  /**
   * Flag indicating whether to expand each child object into
   * its own property table (default true).
   *
   * @property expand {boolean}
   */
  @Input() expand: boolean;

  /**
   * The object which contains the
   * {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}.
   * Any property which references the parent is ignored.
   *
   * @property parent {Object}
   */
  @Input() parent: Object;

  /**
   * The sorted
   * {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}
   * keys which hold a non-empy string or finite numeric value.
   *
   * @property simpleKeys {string[]}
   */
  simpleKeys: string[];

  /**
   * The sorted
   * {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}
   * keys which hold a non-empty object value.
   *
   * @property compositeKeys {string[]}
   */
  compositeKeys: string[];

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    // Private properties start with _.
    let isPublic = (key) => !key.startsWith('_');
    // The public properties.
    let publicProps = _.keys(this.object).filter(isPublic);
    // Ignore the excludes, parent references and invalid properties.
    let isDisplayable = key => this.isDisplayable(key);
    // The displayable properties.
    let selected = publicProps.filter(isDisplayable);
    // Add back unconditional includes.
    let include = this.include || [];
    let others = _.reject(include, key => _.includes(selected, key));
    // The candidate keys sorted by name.
    let keys = _.concat(selected, others).sort();
    // Is the value a string, boolean, number or null?
    let isAtomic = _.negate(_.isPlainObject);
    // Is the value an array of atomic items?
    let isSimpleArray = value => _.isArray(value) && _.every(value, isAtomic);
    // A simple value is atomic or an array of simple values.
    let isSimple = key => {
      let value = this.object[key];
      return isAtomic(value) || isSimpleArray(value);
    };

    // Split the candidate keys into simple and composite.
    let [simple, composite] = _.partition(keys, isSimple);
    // The non-object candidate keys.
    this.simpleKeys = simple;
    // If the expand property is not set to false, then set the
    // composite candidate keys.
    if (this.expand === false) {
      this.compositeKeys = [];
    } else {
      this.compositeKeys = composite;
    }
    // Tell Angular to digest the change.
    this.changeDetector.markForCheck();
  }

  /**
   * Returns the label for the given
   * {{#crossLink "PropertyTableComponent/simpleKeys:property"}}{{/crossLink}}
   * key. If the
   * {{#crossLink "PropertyTableComponent/label:property"}}{{/crossLink}}
   * function is set, then that function is called on the key. If there
   * is a result, then that is the label. Otherwise, the default label
   * is the humanized, capitalized property name described in
   * {{#crossLink "StringHelper/labelize"}}{{/crossLink}}.
   *
   * @method getLabel
   * @param property {string} the child property name (not a path)
   * @return {string} the display value
   */
  getLabel(property: string) {
    let label;
    if (this.label) {
      let path = this.getPath(property);
      label = this.label(path);
    }
    if (!label) {
      label = StringHelper.labelize(property);
    }

    return label;
  }

  /**
   * Returns the display value for the given
   * {{#crossLink "PropertyTableComponent/simpleKeys:property"}}{{/crossLink}}
   * key.
   *
   * @method getDisplayValue
   * @param {string} the simple key
   * @return {string} the display value
   */
  getDisplayValue(key: string): Object[] {
    let value = this.object[key];
    if (_.isArray(value)) {
      let content = _reject(value, _.isNil).join(', ');
      return _.isEmpty(content) ? MISSING_LABEL : content;
    } else if (ObjectHelper.hasValidContent(value)) {
      return value;
    } else {
      return MISSING_LABEL;
    }
  }

  /**
   * Returns the child objects for the given
   * {{#crossLink "PropertyTableComponent/compositeKeys:property"}}{{/crossLink}}
   * key.
   *
   * @method children
   * @param {string} the composite key
   * @return {Object[]} the child objects
   */
  children(key: string): Object[] {
    let value = this.object[key];
    return _.isArray(value) ? value : [value];
  }

  /**
   * Augments the given property with the
   * {{#crossLink "PropertyTableComponent/path:property"}}{{/crossLink}},
   * if that parent path is set.
   *
   * @method getPath
   * @param property {string} a property path relative to the
   *   {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}
   * @param index {number} the array index for an array property
   * @return {string} the augmented property path
   */
  getPath(property: string, index?: number): string {
    let suffix;
    if (_.isArray(this.object[property])) {
      if (_.isNil(index)) {
        throw new Error('The property path to an array item is missing' +
                        ` the item index: ${ property }`);
      }
      suffix = `${ property }[${ index }]`;
    } else {
      if (index) {
        throw new Error('The property path to an object whose parent is' +
                        ' not an array is incorrect:' +
                        ` ${ property }[${ index }]`);
      }
      suffix = property;
    }

    return this.path ? `${ this.path }.${ suffix }` : suffix;
  }

  /**
   * Returns whether this table's
   * {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}
   * has displayable properties.
   *
   * @method hasContent
   * @return {boolean} whether there is displayable content
   */
  hasContent(): boolean {
    return !this.isEmpty();
  }

  /**
   * Returns whether the given property key is not in the
   * {{#crossLink "PropertyTableComponent/exclude:property"}}{{/crossLink}}
   * list, does not reference the
   * {{#crossLink "PropertyTableComponent/parent:property"}}{{/crossLink}}
   * and satisfies
   * {{#crossLink "ObjectHelper/hasValidContent"}}{{/crossLink}}.
   *
   * @method isDisplayable
   * @private
   * @param {string} the composite key
   * @return {boolean} whether the property should be displayed
   */
  private isDisplayable(key: string) {
    if (_.includes(this.exclude, key)) {
      return false;
    }
    let value = this.object[key];
    if (this.parent && (value === this.parent)) {
      return false;
    } else if (this.validate === false) {
      return true;
    } else {
      return ObjectHelper.hasValidContent(value);
    }
  }

  /**
   * Returns whether this table's
   * {{#crossLink "PropertyTableComponent/object:property"}}{{/crossLink}}
   * has no displayable properties.
   *
   * @return {boolean} whether there has no displayable content
   */
  private isEmpty(): boolean {
    return _.isEmpty(this.simpleKeys) && _.isEmpty(this.compositeKeys);
  }
}
