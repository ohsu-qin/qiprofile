
/**
 * The Encounter REST data object extension utility.
 *
 * @module subject
 * @class Encounter
 * @static
 */

(function() {
  var Encounter;

  Encounter = {

    /**
     * @method extend
     * @param encounter the subject encounter
     * @param subject the parent subject REST object
     * @return the augmented encounter object
     */
    extend: function(encounter, subject) {
      if (encounter == null) {
        return encounter;
      }
      if (!encounter.date) {
        throw new Error("Encounter is missing a date");
      }

      /**
       * The parent {{#crossLink "Subject"}}{{/crossLink}} REST object.
       *
       * @property subject
       */
      encounter.subject = subject;

      /**
       * @method isSession
       * @return whether the encounter class is `Session`
       */
      encounter.isSession = function() {
        return this._cls === 'Session';
      };

      /**
       * @method isClinical
       * @return whether the encounter is not a session
       */
      encounter.isClinical = function() {
        return !this.isSession();
      };
      Object.defineProperties(encounter, {

        /**
         * The patient age at the time of the encounter.
         *
         * @property age
         */
        age: {
          get: function() {
            if (this.date && this.subject.birthDate) {
              return this.date.diff(this.subject.birthDate, 'years');
            }
          }
        }
      });
      return encounter;
    }
  };

  export { Encounter as default };

}).call(this);
