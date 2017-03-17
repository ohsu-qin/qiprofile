
/**
 * The Treatment REST data object extension utility.
 *
 * @module clinical
 * @class Treatment
 * @static
 */

(function() {
  var Treatment;

  Treatment = {

    /**
     * @method extend
     * @param treatment the subject treatment
     * @param subject the parent subject REST object
     * @return the augmented treatment object
     */
    extend: function(treatment, subject) {
      if (treatment == null) {
        return treatment;
      }
      if (!treatment.startDate) {
        throw new Error("Treatment is missing the start date");
      }

      /**
       * The parent {{#crossLink "Subject"}}{{/crossLink}} REST object.
       *
       * @property subject
       */
      treatment.subject = subject;
      Object.defineProperties(treatment, {

        /**
         * The treatment [start, end] span.
         *
         * @property span
         */
        span: {
          get: function() {
            return [this.startDate, this.endDate];
          }
        },

        /**
         * The treatment duration in days, if there is both a start
         * and an end date, otherwise undefined.
         *
         * @property duration
         */
        duration: {
          get: function() {
            if (this.startDate && this.endDate) {
              return this.endDate.diff(this.startDate, 'days');
            }
          }
        }
      });
      return treatment;
    }
  };

  export { Treatment as default };

}).call(this);
