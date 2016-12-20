(function() {
  import * as _ from "lodash";
  import ImageSequence from "./image-sequence.data.coffee";
  import Registration from "./registration.data.coffee";

  /**
   * The Scan REST data object extension utility.
   *
   * @module session
   * @class Scan
   * @static
   */
  var Scan;

  Scan = {

    /**
     * Extends the scan REST object as follows:
     * * Adds the session parent reference property
     * * Converts the scan number to an integer
     * * Adds the ImageSequence properties
     * * Extends the reg follows:
     *   Registration.extend
     *
     * @method extend
     * @param scan the scan to extend
     * @param session the parent session object
     * @return the extended scan object
     */
    extend: function(scan, session) {
      var i, j, len, ref, reg;
      if (scan == null) {
        return scan;
      }
      ImageSequence.extend(scan);

      /**
       * The parent {{#crossLink "Session"}}{{/crossLink}}.
       *
       * @property session {Object}
       */
      scan.session = session;

      /**
       * The DICOM scan number.
       *
       * @property number {number}
       */
      scan.number = +scan.number;
      Object.defineProperties(scan, {

        /**
         * @method title
         * @return the display title
         */
        title: {
          get: function() {
            return this.session.title + " Scan " + this.number;
          }
        }
      });
      if (scan.registrations == null) {
        scan.registrations = [];
      }
      ref = scan.registrations;
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        reg = ref[i];
        Registration.extend(reg, session, scan, i + 1);
      }
      return scan;
    },

    /**
     * @method find
     * @param session the session object to search
     * @param number the scan number
     * @return the scan object
     * @throws ReferenceError if the session does not have the scan
     */
    find: function(session, number) {
      var match, target;
      match = function(scan) {
        return scan.number === number;
      };
      target = _.find(session.scans, match);
      if (target == null) {
        throw new ReferenceError((session.title + " does not have a scan with number") + (" " + number));
      }
      return target;
    }
  };

  export { Scan as default };

}).call(this);
