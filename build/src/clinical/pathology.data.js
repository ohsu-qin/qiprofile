(function() {
  import * as _ from "lodash";
  import * as _s from "underscore.string";

  /**
   * The clinical pathology REST data object extension utility.
   *
   * @module clinical
   * @class Pathology
   * @static
   */
  var Pathology;

  Pathology = {

    /**
     * @method extend
     * @param pathology the pathology REST object
     * @return the augmented pathology object
     */
    extend: function(pathology) {
      var altProp, i, j, len, len1, prop, ref, ref1, tumor;
      ref = pathology.tumors;
      for (i = 0, len = ref.length; i < len; i++) {
        tumor = ref[i];
        if (tumor.extent) {
          ref1 = ['length', 'width', 'depth'];
          for (j = 0, len1 = ref1.length; j < len1; j++) {
            prop = ref1[j];
            if (prop in tumor.extent) {
              altProp = 'tumor' + _s.capitalize(prop);
              tumor.extent[altProp] = tumor.extent[prop];
              delete tumor.extent[prop];
            }
          }
        }
      }
      Object.defineProperties(pathology, {

        /**
         * The largest TNM tumor size over all tumors.
         *
         * @property tumorSize
         */
        tumorSize: {
          get: function() {
            return _.maxBy(this.tumors, 'tnm.size.tumorSize');
          }
        },

        /**
         * The aggregate tumor length over all tumors.
         *
         * @property tumorLength
         */
        tumorLength: {
          get: function() {
            return _.sumBy(this.tumors, 'extent.tumorLength');
          }
        }
      });
      return pathology;
    }
  };

  export { Pathology as default };

}).call(this);
