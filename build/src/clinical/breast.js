(function() {
  import * as _ from "lodash";
  import ObjectHelper from "../common/object-helper.coffee";
  var Breast, RCB, STAGES, _rcbClass, _rcbIndex, _recurrenceScore;

  STAGES = [['1A', '2A', '3A', '3C'], ['1A', '2A', '3A', '3C'], ['2A', '2B', '3A', '3C'], ['2B', '3A', '3A', '3C'], ['3B', '3B', '3B', '3C']];

  _rcbIndex = function(extent, rcb) {
    var PROPS, inSitu, invasion, invasionFactor, missingProp, nodeBase, nodeFactor, overall, posNodeFactor, size;
    PROPS = ['tumorCellDensity', 'dcisCellDensity', 'positiveNodeCount', 'largestNodalMetastasisLength'];
    missingProp = function() {
      return _.some(PROPS, function(prop) {
        return _.isNil(rcb[prop]);
      });
    };
    if (_.isNil(extent) || _.isNil(rcb) || missingProp()) {
      return null;
    }
    size = Math.sqrt(extent.tumorLength * extent.tumorWidth);
    overall = rcb.tumorCellDensity / 100;
    inSitu = rcb.dcisCellDensity / 100;
    invasion = (1 - inSitu) * overall;
    invasionFactor = 1.4 * Math.pow(invasion * size, 0.17);
    posNodeFactor = 1 - Math.pow(0.75, rcb.positiveNodeCount);
    nodeBase = 4 * posNodeFactor * rcb.largestNodalMetastasisLength;
    nodeFactor = Math.pow(nodeBase, 0.17);
    return invasionFactor + nodeFactor;
  };

  _rcbClass = function(index) {
    if (_.isNil(index)) {
      return null;
    }
    if (index === 0) {
      return 0;
    } else if (index < 1.36) {
      return 1;
    } else if (index < 3.28) {
      return 2;
    } else {
      return 3;
    }
  };


  /**
   * The BreastPathology residual cancer burden.
   * The index and class properties are calculated as described in
   * <JCO 25:28 4414-4422 http://jco.ascopubs.org/content/25/28/4414.full>.
   *
   * @module clinical
   * @class RCB
   */

  RCB = {
    extend: function(rcb, tumor) {
      rcb.tumor = tumor;
      Object.defineProperties(rcb, {

        /**
         * The RCB index.
         *
         * @class RCB
         * @property index
         */
        index: {
          get: function() {
            return _rcbIndex(this.tumor.extent, this);
          }
        },

        /**
         * The RCB class based on the RCB index cut-offs.
         *
         * @class RCB
         * @property class
         */
        "class": {
          get: function() {
            return _rcbClass(this.index);
          }
        }
      });
      return rcb;
    }
  };

  _recurrenceScore = function(assay) {
    var er, erUnscaled, her2, her2Unscaled, invasion, proliferation, proliferationUnscaled, recurrenceScaled, recurrenceUnscaled;
    her2Unscaled = (0.9 * assay.her2.grb7) + (0.1 * assay.her2.her2);
    her2 = Math.max(8, her2Unscaled);
    erUnscaled = (0.8 * assay.estrogen.er) + (1.2 * assay.estrogen.pgr) + assay.estrogen.bcl2 + assay.estrogen.scube2;
    er = erUnscaled / 4;
    proliferationUnscaled = (assay.proliferation.survivin + assay.proliferation.ki67 + assay.proliferation.mybl2 + assay.proliferation.ccnb1 + assay.proliferation.stk15) / 5;
    proliferation = Math.max(6.5, proliferationUnscaled);
    invasion = (assay.invasion.ctsl2 + assay.invasion.mmp11) / 2;
    recurrenceUnscaled = (0.47 * her2) - (0.34 * er) + (1.04 * proliferation) + (0.10 * invasion) + (0.05 * assay.cd68) - (0.08 * assay.gstm1) - (0.07 * assay.bag1);
    if (isNaN(recurrenceUnscaled)) {
      return null;
    }
    recurrenceScaled = Math.round(20 * (recurrenceUnscaled - 6.7));
    return Math.max(0, Math.min(recurrenceScaled, 100));
  };


  /**
   * The static breast utility.
   *
   * @module clinical
   * @class Breast
   * @static
   */

  Breast = {

    /**
     * The breast cancer grade determinants, consisting of the
     * following properties:
     * * *RANGES* - the three grade score ranges, as follows:
     *   - Grade 1: score 3,5
     *   - Grade 2: score 6,7
     *   - Grade 3: score 8,9
     * * *SCORES* - the grade score factor properties
     *   `tubularFormation`, `mitoticCount` and `nuclearPleomorphism`
     *
     * @property Grade
     * @static
     */
    Grade: {
      RANGES: [[3, 4, 5], [6, 7], [8, 9]],
      SCORES: ['tubularFormation', 'mitoticCount', 'nuclearPleomorphism']
    },

    /**
     * @method extend
     * @param encounter the Breast patient clinical encounter
     * @return the augmented clinical encounter object
     */
    extend: function(encounter) {
      var assay, i, len, ref, results, tumor;
      if (encounter.pathology) {
        ref = encounter.pathology.tumors;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          tumor = ref[i];

          /**
           * The Breast pathology.
           *
           * @module clinical
           * @class BreastPathology
           */
          if (tumor.rcb) {
            RCB.extend(tumor.rcb, tumor);
          }
          assay = _.get(tumor, 'geneticExpression.normalizedAssay');
          if (assay) {

            /**
             * The Breast gene expression normalized assay.
             *
             * @module clinical
             * @class BreastNormalizedAssay
             */
            results.push(Object.defineProperties(assay, {

              /**
               * Returns the cancer recurrence score. This score is calculated from
               * a genetic expression assay according to algorithm in Figure 1 of
               * the following paper:
               *
               *   Paik, et al., 'A Multigene Assay to Predict Recurrence of
               *   Tamoxifen-Treated, Node-Negative Breast Cancer',
               *   N Engl J Med 2004; 351:2817-2826
               *   (http://www.nejm.org/doi/full/10.1056/NEJMoa041588)
               *
               * 1f metastasis exists (M1), then the stage is 4.
               * Otherwise, the stage is determined by T and N scores as
               * defined in the tumor type factory STAGES associative
               * lookup table.
               *
               * @class BreastNormalizedAssay
               * @property recurrenceScore
               */
              recurrenceScore: {
                get: function() {
                  return _recurrenceScore(this);
                }
              }
            }));
          } else {
            results.push(void 0);
          }

          /**
           * The Breast pathology.
           *
           * @module clinical
           * @class BreastPathology
           */
        }
        return results;
      }
    },

    /**
     * @module clinical
     * @class Breast
     * @method stageExtent
     * @return the sorted stage values
     */
    stageExtent: function() {
      var plus4;
      plus4 = _.partialRight(_.union, ['4']);
      return _.flow(_.flatten, plus4, _.uniq, _.sort)(STAGES);
    },

    /**
     * Returns the cancer stage.
     *
     * 1f metastasis exists (M1), then the stage is 4.
     * Otherwise, the stage is determined by T and N scores as
     * defined in the tumor type factory STAGES associative
     * lookup table.
     *
     * @module clinical
     * @class Breast
     * @method stage
     * @param tnm the TNM object
     * @return the cancer stage object, as described in tnm.coffee
     *    stage
     */
    stage: function(tnm) {
      var find, n, t;
      if (tnm.metastasis) {
        return '4';
      }
      t = tnm.size.tumorSize;
      n = tnm.lymphStatus;
      find = function(table, value) {
        var result;
        return result = table[value] || (function() {
          throw new ReferenceError(("Unsupported " + tnm.tumorType) + (" TNM: " + (ObjectHelper.prettyPrint(tnm))));
        })();
      };
      return _.reduce([t, n], find, STAGES);
    }
  };

  export { Breast as default };

}).call(this);
