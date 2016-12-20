
/**
 * The static clinical utilities.
 *
 * @module clinical
 * @main clinical
 */

(function() {
  import * as _ from "lodash";
  import Breast from "./breast.coffee";
  import Sarcoma from "./sarcoma.coffee";
  var SERVICES, TNM, _summaryGrade, tumorTypeService,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  SERVICES = {
    Breast: Breast,
    Sarcoma: Sarcoma
  };


  /**
   * @method tumorTypeService
   * @protected
   * @param tumorType the tumor type name, e.g. 'Breast'
   * @return the tumorTypeService factory for that tumor type
   */

  tumorTypeService = function(tumorType) {
    return SERVICES[tumorType] || (function() {
      throw new ReferenceError("Unsupported tumor type: " + tumorType);
    })();
  };

  _summaryGrade = function(tnm) {

    /**
     * Calculates the cumulative grade as the sum of the component
     * tumor type factory SCORES property values.
     *
     * @method cumulativeGrade
     * @protected
     * @param tnm the TNM object
     * @return the cumulative grade, or null if a score is missing
     */
    var cGrade, cumulativeGrade, grade, inRange, index, ranges;
    cumulativeGrade = function() {
      var accumulate, props;
      accumulate = function(sum, prop) {
        return sum + grade[prop];
      };
      if (typeof grade === "undefined" || grade === null) {
        return null;
      }
      props = tumorTypeService(tnm.tumorType).Grade.SCORES;
      if (_.every(props, function(prop) {
        return grade[prop] != null;
      })) {
        return _.reduce(props, accumulate, 0);
      } else {
        return null;
      }
    };
    grade = tnm.grade;
    if (grade == null) {
      return null;
    }
    cGrade = cumulativeGrade();
    if (cGrade == null) {
      return null;
    }
    ranges = tumorTypeService(tnm.tumorType).Grade.RANGES;
    inRange = function(range) {
      return indexOf.call(range, cGrade) >= 0;
    };
    index = _.findIndex(ranges, inRange);
    if (index < 0) {
      throw new ReferenceError(("Unsupported " + tnm.tumorType) + (" cumulative grade: " + cGrade));
    }
    return 1 + index;
  };


  /**
   * The static TNM utility.
   *
   * @class TNM
   * @static
   */

  TNM = {

    /**
     * @method formatSize
     * @param size the size composite object
     * @return the standard size string, e.g. 'p2b'
     * @throws Error if the tumorSize property value is missing
     */
    formatSize: function(size) {
      var prefix, sizeSuffix, suffix;
      sizeSuffix = function() {
        var inSituSuffix;
        inSituSuffix = function(inSitu) {
          if (inSitu.invasiveType === 'ductal') {
            return 'is(DCIS)';
          } else if (inSitu.invasiveType === 'lobular') {
            return 'is(LCIS)';
          } else {
            return 'is';
          }
        };
        if (size.inSitu != null) {
          return inSituSuffix(size.inSitu);
        } else if (size.suffix != null) {
          return size.suffix;
        } else {
          return '';
        }
      };
      if (size.tumorSize == null) {
        throw new Error("The TNM tumor size is missing");
      }
      prefix = size.prefix || '';
      suffix = sizeSuffix();
      return "" + prefix + size.tumorSize + suffix;
    },

    /**
     * Calculates the summary grade based on the cumulative grade
     * as defined in the tumor type factory RANGES lookup table.
     *
     * @method summaryGrade
     * @param grade the grade composite object
     * @return the summary grade
     * @throws ReferenceError if the grade scores are not supported
     */
    summaryGrade: _summaryGrade,

    /**
     * Calculates the tumor stage for the given TNM composite
     * object.
     *
     * This function returns the cancer stage as a string
     * consisting of a digit in the range 1 to 4 optionally
     * followed by a suffix A, B or C. This facilitates
     * accurate comparison, in contrast to the roman numeral
     * grade, e.g. '1A' < '2B' , but 'IA' > 'IIB'.
     * The romanize filter can be used to display the stage
     * in the standard archaic medical format.
     *
     * @method stage
     * @param tnm the TNM object.
     * @return the cancer stage object
     */
    stage: function(tnm) {
      var grade;
      grade = _summaryGrade(tnm);
      return tumorTypeService(tnm.tumorType).stage(tnm, grade);
    }
  };

  export { TNM as default };

}).call(this);
