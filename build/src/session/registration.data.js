(function() {
  import * as _ from "lodash";
  import ImageSequence from "./image-sequence.data.coffee";

  /**
   * The Registration REST data object extension utility.
   *
   * @module session
   * @class Registration
   * @static
   */
  var Registration;

  Registration = {

    /**
     * Extends the given registration object as follows:
     * * Adds the scan parent reference property
     * * Adds the ImageSequence properties
     * * Sets the registration number
     * * Adds the title and session virtual properties
     *
     * @method extend
     * @param registration the Registration object to extend
     * @param scan the source scan
     * @param number the one-based registration number within the scan
     * @return the extended registration object
     */
    extend: function(registration, scan, number) {
      ImageSequence.extend(registration);
      registration.scan = scan;
      registration.number = number;
      Object.defineProperties(registration, {

        /**
         * @method title
         * @return the display title
         */
        title: {
          get: function() {
            return this.scan.title + " Registration " + this.number;
          }
        },

        /**
         * An ImageSequence present a uniform interface, which
         * includes a bolus arrival index and session reference.
         *
         * @method session
         * @return the registration scan session
         */
        session: {
          get: function() {
            return this.scan.session;
          }
        },

        /**
         * @method bolusArrivalIndex
         * @return the registration scan bolus arrival
         */
        bolusArrivalIndex: {
          get: function() {
            return this.scan.bolusArrivalIndex;
          }
        }
      });
      return registration;
    },

    /**
     * @method find
     * @param scan the Scan object to search
     * @param number the registration number within the scan
     * @return the scan object
     * @throws ReferenceError if the session does not have the scan
     */
    find: function(scan, number) {
      var match, target;
      match = function(reg) {
        return reg.number === number;
      };
      target = _.find(scan.registrations, match);
      if (target == null) {
        throw new ReferenceError((scan.title + " does not have a registration with number") + (" " + number));
      }
      return target;
    }
  };

  export { Registration as default };

}).call(this);
