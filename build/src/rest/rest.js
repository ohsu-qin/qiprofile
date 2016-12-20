(function() {
  import * as _ from "lodash";
  import * as _s from "underscore.string";

  /**
   * REST utility functions.
   *
   * @module rest
   * @class REST
   * @static
   */
  var REST,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  REST = {

    /**
     * Formats the {where: condition} Eve REST query parameter. Each key
     * in the condition parameters is quoted. The condition value is
     * unquoted for numbers, escape-quoted otherwise. A non-numeric
     * condition value is converted to a string before being quoted.
     *
     * Examples:
     *     where({number: 2}) => {where:"{\"number: 2}"
     *
     *     where({project: QIN}) => {where:"{\"project: \"QIN\"}"
     *
     * TODO - add moment parameter date conversion.
     *
     * TODO - add object parameter embedded document conversion, e.g.:
     *   where({session: {number: 3}}) => {where:"{\"session.number\": 3}"
     *
     * @method where
     * @param params the input parameters
     * @return the REST condition query parameter
     */
    where: function(params) {

      /**
       * @method formatFieldCondition
       * @private
       * @param field the request field
       * @param value the request value
       * @return the formatted Eve {where: condition}
       */
      var cond, fieldConds, formatFieldCondition, pair;
      formatFieldCondition = function(field, value) {
        var condValue;
        if (typeof value === 'number') {
          condValue = value;
        } else {
          condValue = "\"" + value + "\"";
        }
        return "\"" + field + "\":" + condValue;
      };
      fieldConds = (function() {
        var i, len, ref, results;
        ref = _.toPairs(params);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          pair = ref[i];
          results.push(formatFieldCondition.apply(null, pair));
        }
        return results;
      })();
      cond = fieldConds.join(',');
      return {
        where: "{" + cond + "}"
      };
    },

    /**
     * Formats the {field: flag} Eve REST query projection parameter.
     * The fields argument can be a single field name or an array of
     * field names.
     *
     * @method map
     * @param fields the Javascript camelCase data properties to select
     * @return the formatted Eve {projection: critierion}
     */
    map: function(fields) {
      var criterion, flags;
      if (_.isString(fields)) {
        fields = [fields];
      }
      flags = fields.map(function(field) {
        return "\"" + field + "\": 1";
      });
      criterion = flags.join(',');
      return {
        projection: "{" + criterion + "}"
      };
    },

    /**
     * Formats the {field: flag} Eve REST query projection parameter.
     *
     * @method omit
     * @param fields the Javascript camelCase data properties to exclude
     * @return the formatted Eve {projection: critierion}
     */
    omit: function(fields) {
      var critierion, flags;
      flags = fields.map(function(field) {
        return "\"" + field + "\": 0";
      });
      critierion = flags.join(',');
      return {
        projection: "{" + critierion + "}"
      };
    },

    /**
     * Parses the JSON data into a Javascript object and creates
     * camelCase property aliases for underscore property names.
     * If the input data is an array Eve REST result, signified
     * by the presence of an _items array property, then this
     * method returns an array of Javascript objects, each of
     * which is recursively transformed by this function.
     *
     * @method transformResponse
     * @param res the HTTP response object
     * @return the Javascript object
     */
    transformResponse: function(response) {

      /**
       * Aliases the given underscore property.
       *
       * @method camelizeProperty
       * @private
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
       * @private
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
      obj = response.json();
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

  export { REST as default };

}).call(this);
