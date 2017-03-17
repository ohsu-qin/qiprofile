
/**
 * Object utilities.
 *
 * @module object
 * @main object
 */

(function() {
  import * as _ from "lodash";
  import * as _s from "underscore.string";
  import moment from "moment";
  var ObjectHelper, _hasValidContent, _isAtomic, _isDate, _isSimple, _isSimpleArray, _sortValuesByKey,
    slice = [].slice,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _sortValuesByKey = function(obj) {
    var i, key, keys, len, results;
    if (obj != null) {
      keys = _.keys(obj).sort();
      results = [];
      for (i = 0, len = keys.length; i < len; i++) {
        key = keys[i];
        results.push(obj[key]);
      }
      return results;
    } else {
      return [];
    }
  };

  _hasValidContent = function(value) {
    if (_.isNil(value)) {
      return false;
    } else if (_.isString(value)) {
      return !_.isEmpty(value);
    } else if (_.isNumber(value)) {
      return _.isFinite(value);
    } else if (_.isArrayLike(value) || _.isObjectLike(value)) {
      return _.some(value, _hasValidContent);
    } else {
      return true;
    }
  };

  _isDate = function(value) {
    return moment.isDate(value) || moment.isMoment(value);
  };

  _isAtomic = function(value) {
    return _.isNil(value) || _.isString(value) || _.isNumber(value) || _.isBoolean(value) || _isDate(value);
  };

  _isSimple = function(value) {
    return _isAtomic(value) || _isSimpleArray(value);
  };

  _isSimpleArray = function(value) {
    return _.isArray(value) && _.every(value, _isSimple);
  };


  /**
   * The static ObjectHelper utility.
   *
   * @class ObjectHelper
   * @static
   */

  ObjectHelper = {

    /**
     * @method associate
     * @param key the property name
     * @param value the property value
     * @return {Object} the {key, value} object
     */
    associate: function(key, value) {
      var obj;
      obj = {};
      obj[key] = value;
      return obj;
    },

    /**
     * @method delegate
     * @param objects the delegate objects
     * @return a new object with properties from the given objects
     */
    delegate: function() {
      var objects;
      objects = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return _.reduce(objects, _.defaults, {});
    },

    /**
     * Returns whether the given value has non-nil, non-empty
     * content, determined as follows:
     * * If the value is a string, then return whether the value
     *   length is non-zero.
     * * If the value is a number, then return whether the value
     *   is finite.
     * * If the value is an array or object, then return
     *   whether the value has an indexed item with content.
     * * Otherwise, return whether the value is neither undefined
     *   nor null.
     *
     * This method recurses into children to determine whether
     * the children have content.
     *
     * Examples:
     *     ObjectHelper.hasContent(null) // => false
     *     ObjectHelper.hasContent(NaN) // => false
     *     ObjectHelper.hasContent(3) // => true
     *     ObjectHelper.hasContent('a') // => true
     *     ObjectHelper.hasContent([3, 2]) // => true
     *     ObjectHelper.hasContent([]) // => false
     *     ObjectHelper.hasContent([null]) // => false
     *     ObjectHelper.hasContent({a: 1}) // => true
     *     ObjectHelper.hasContent([{}, [[{}, [5]]]]) // => true
     *
     * @method hasContent
     * @param value {any} the value to check
     * @return {boolean} whether the value has content
     */
    hasValidContent: _hasValidContent,

    /**
     * Returns whether the given value is nil, a string,
     * a number, a date or an array of simple values.
     *
     * Examples:
     *     ObjectHelper.isSimple(null) // => true
     *     ObjectHelper.isSimple({a: 1}) // => false
     *     ObjectHelper.isSimple([3]) // => true
     *     ObjectHelper.isSimple([2, [4, 1]]) // => true
     *
     * @method isSimple
     * @param value {any} the value to check
     * @return {boolean} whether the value is simple
     */
    isSimple: _isSimple,

    /**
     * Pretty prints the given object in a readable format. This function
     * handles cycles by substituting an elipsis ('...') if a referenced
     * object has already been visited.
     *
     * @method prettyPrint
     * @param obj the object to print
     * @return the string representation
     */
    prettyPrint: function(obj) {
      var replace, visited;
      visited = [];
      replace = function(key, val) {
        var elideCycles;
        elideCycles = function(val) {
          if (_.isObject(val)) {
            if (_.isFunction(val) || indexOf.call(visited, val) >= 0) {
              return '...';
            } else {
              visited.push(val);
              return val;
            }
          } else {
            return val;
          }
        };
        return elideCycles(val);
      };
      return JSON.stringify(obj, replace, 2);
    },

    /**
     * @method sortValuesByKey
     * @param obj the associative object
     * @return the concatenated values array
     */
    sortValuesByKey: _sortValuesByKey,

    /**
     * @method collectValues
     * @param objects the objects from which to collect the values
     * @param accessor the associative object accessor callback or
     *   property name
     * @return the concatenated value objects
     */
    collectValues: function(objects, accessor) {

      /**
       * Concatenates the given current associative object
       * values sorted by the associative keys to the given
       * accumulator array.
       *
       * @method concatValues
       * @param accumulator the previous result array
       * @param current the current associative object
       * @return the concatenated results array
       */
      var assocObjs, concatValues;
      concatValues = function(accumulator, current) {
        var values;
        values = _sortValuesByKey(current);
        return accumulator.concat(values);
      };
      assocObjs = _.map(objects, accessor);
      return assocObjs.reduce(concatValues, []);
    },

    /**
     * @method propertiesEqual
     * @param obj the first object to compare
     * @param other the second object to compare
     * @return whether both objects have the same properties and
     *   the corresponding property values are equal
     */
    propertiesEqual: function(obj, other) {
      var pairs, prop, props;
      props = _.unique(_.keys(obj).concat(_.keys(other)));
      pairs = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = props.length; i < len; i++) {
          prop = props[i];
          results.push([obj[prop], other[prop]]);
        }
        return results;
      })();
      return _.every(pairs, function(pair) {
        return pair[0] === pair[1];
      });
    },

    /**
     * Aliases the source object properties which are not already
     * defined in the destination object.
     *
     * @method aliasProperties
     * @param source the copy source object
     * @param dest the copy destination object
     * @param filter an optional function that filters the
     *   properties to alias
     */
    aliasProperties: function(source, dest, filter) {
      var aliasProps, defineAlias, destProps, i, len, prop, results, srcProps;
      if (filter == null) {
        filter = null;
      }

      /**
       * @method defineAlias
       * @param prop the source property to alias in the destination
       */
      defineAlias = function(prop) {
        return Object.defineProperty(dest, prop, {
          enumerable: true,
          get: function() {
            return source[prop];
          },
          set: function(val) {
            return source[prop] = val;
          }
        });
      };
      srcProps = Object.getOwnPropertyNames(source);
      destProps = Object.getOwnPropertyNames(dest);
      aliasProps = _.difference(srcProps, destProps);
      if (filter) {
        aliasProps = aliasProps.filter(filter);
      }
      results = [];
      for (i = 0, len = aliasProps.length; i < len; i++) {
        prop = aliasProps[i];
        results.push(defineAlias(prop));
      }
      return results;
    },

    /**
     * Aliases the source object properties which are not already
     * defined in the destination object and satisfy thew following
     * conditions:
     * * the property name does not begin with an underscore (_)
     *   or dollar sign ($)
     * * the source property value is not a function
     *
     * @method aliasPublicDataProperties
     * @param source the copy source object
     * @param dest the copy destination object
     */
    aliasPublicDataProperties: function(source, dest) {
      var filter;
      filter = function(prop) {
        var ref;
        return (ref = prop[0], indexOf.call('_$', ref) < 0) && !_.isFunction(source[prop]);
      };
      return this.aliasProperties(source, dest, filter);
    },

    /**
     * Parses the JSON data into a Javascript object and creates
     * camelCase property aliases for underscore property names.
     * If the input data is an array Eve REST result, signified
     * by the presence of an _items array property, then this
     * method returns an array of Javascript objects, each of
     * which is recursively transformed by this function.
     *
     * @method fromJson
     * @param data the REST JSON data
     * @return the Javascript object
     */
    fromJson: function(data) {

      /**
       * Aliases the given underscore property.
       *
       * @method camelizeProperty
       * @param obj the input object to modify
       * @param property the input property to alias
       */
      var camelizeProperties, camelizeProperty, i, item, len, obj, ref, results, visited;
      camelizeProperty = function(obj, property) {
        var alias;
        alias = property[0] + _s.camelize(property.substring(1));
        if (_.isObject(obj) && !obj.hasOwnProperty(alias)) {
          Object.defineProperty(obj, alias, {
            enumerable: true,
            get: function() {
              return obj[property];
            },
            set: function(value) {
              return obj[property] = value;
            }
          });
          return Object.defineProperty(obj, property, {
            enumerable: false,
            value: obj[property],
            writable: true
          });
        }
      };

      /**
       * Aliases underscore properties with camelCase properties.
       *
       * @method camelizeProperties
       * @param obj the input object to modify
       * @return the input object
       */
      camelizeProperties = function(obj, visited) {
        var i, item, key, len, val;
        if (visited == null) {
          visited = [];
        }
        if (_.isObject(obj) && indexOf.call(visited, obj) < 0) {
          visited.push(obj);
          for (key in obj) {
            val = obj[key];
            if (key.lastIndexOf('_') > 0) {
              camelizeProperty(obj, key);
            }
            if (_.isArray(val)) {
              for (i = 0, len = val.length; i < len; i++) {
                item = val[i];
                camelizeProperties(item, visited);
              }
            } else {
              camelizeProperties(val, visited);
            }
          }
        }
        return obj;
      };
      obj = JSON.parse(data);
      if (obj.hasOwnProperty('_items')) {
        visited = [];
        ref = obj._items;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          results.push(camelizeProperties(item, visited));
        }
        return results;
      } else {
        return camelizeProperties(obj);
      }
    }
  };

  export { ObjectHelper as default };

}).call(this);
