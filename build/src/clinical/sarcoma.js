(function() {
  import * as _ from "lodash";
  import ObjectHelper from "../common/object-helper.coffee";
  var STAGES, Sarcoma;

  STAGES = {
    1: [['1A', '2A', '2C'], ['3', '3', '3']],
    2: [['1B', '2B', '3'], ['3', '3', '3']]
  };


  /**
   * The static sarcoma utility.
   *
   * @module clinical
   * @class Sarcoma
   * @static
   */

  Sarcoma = {

    /**
     * The sarcoma cancer grade determinants, consisting of the
     * following properties:
     * * _RANGES_ - the three grade score ranges, as follows:
     *   - Grade 1: score 2,3
     *   - Grade 2: score 4,5
     *   - Grade 3: score 6,8
     * * _SCORES_ - the grade score factor properties
     *   `differentiation`, `mitoticCount` and `necrosisScore`
     *
     * @property Grade
     * @static
     */
    Grade: {
      RANGES: [[2, 3], [4, 5], [6, 7, 8]],
      SCORES: ['differentiation', 'mitoticCount', 'necrosisScore']
    },

    /**
     * @method stageExtent
     * @return the sorted stage values
     */
    stageExtent: function() {
      return _.chain(STAGES).values().flattenDeep().union(['4']).uniq().sort().value();
    },

    /**
     * Returns the cancer stage.
     *
     * If metastasis exists (M1), then the stage is 4.
     * Otherwise, the stage is determined by T and N scores as
     * defined in the tumor type factory STAGES associative
     * lookup table.
     *
     * @method stage
     * @param tnm the TNM object
     * @param summaryGrade the summary grade (1 to 3)
     * @return the cancer stage object, as described in tnm.coffee
     *    stage
     */
    stage: function(tnm, summaryGrade) {
      var find, g, n, t;
      if (tnm.metastasis) {
        return '4';
      }
      t = tnm.size.tumorSize;
      n = tnm.lymphStatus;
      g = summaryGrade;
      find = function(table, value) {
        var result;
        return result = table[value] || (function() {
          throw new ReferenceError(("Unsupported " + tnm.tumorType) + (" TNM: " + (ObjectHelper.prettyPrint(tnm))) + (" Summary Grade: " + g));
        })();
      };
      return _.reduce([t, n, g - 1], find, STAGES);
    }
  };

  export { Sarcoma as default };

}).call(this);
