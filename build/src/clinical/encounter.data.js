(function() {
  import Pathology from "./pathology.data.coffee";
  import Breast from "./breast.coffee";

  /**
   * The clinical Encounter REST data object extension utility.
   *
   * @module clinical
   * @class ClinicalEncounter
   * @static
   */
  var ClinicalEncounter;

  ClinicalEncounter = {

    /**
     * @method extend
     * @param encounter the clinical encounter
     * @param subject the parent subject REST object
     * @return the augmented clinical encounter object
     */
    extend: function(encounter, subject) {

      /**
       * @method isBiopsy
       * @return whether the encounter class is `Biopsy`
       */
      encounter.isBiopsy = function() {
        return this._cls === 'Biopsy';
      };

      /**
       * @method isSurgery
       * @return whether the encounter class ends in `Surgery`
       */
      encounter.isSurgery = function() {
        return this._cls.endsWith('Surgery');
      };
      Object.defineProperties(encounter, {

        /**
         * 'Surgery' for a surgery encounter,
         *  otherwise the encounter class
         *
         * @property title
         */
        title: {
          get: function() {
            if (this.isSurgery()) {
              return 'Surgery';
            } else {
              return this._cls;
            }
          }
        }
      });
      if (encounter.pathology) {
        Pathology.extend(encounter.pathology);
      }
      if (encounter.subject.collection === 'Breast') {
        Breast.extend(encounter);
      }
      return encounter;
    }
  };

  export { ClinicalEncounter as default };

}).call(this);
