
/**
 * The date utilities.
 *
 * @module date
 */

(function() {
  import * as _ from "lodash";
  import moment from "moment";
  var DateHelper, _TODAY, _toDate;

  _toDate = function(value) {
    if (moment.isMoment(value)) {
      return value.toDate();
    } else if (moment.isDate(value) || _.isNil(value)) {
      return value;
    } else {
      return Date(value);
    }
  };

  _TODAY = moment.now();


  /**
   * The static DateHelper utility.
   *
   * @class DateHelper
   * @static
   */

  DateHelper = {

    /**
     * The uniform fixed date at the point when this component is loaded.
     *
     * @property TODAY {Object}
     * @private
     * @static
     */
    TODAY: _TODAY,

    /**
     * @method isDate
     * @param value the value to check
     * @return whether the value is a JavaScript `Date` or
     *   moment object
     */
    isDate: function(value) {
      return moment.isMoment(value) || moment.isDate(value);
    },

    /**
     * @method toDate
     * @param value the value to convert
     * @return the value as a JavaScript `Date`
     */
    toDate: _toDate,

    /**
     * @method valueOf
     * @param value the value to convert
     * @return the number of millisecond since midnight January 1, 1970 UTC
     */
    valueOf: function(value) {
      var date;
      date = _toDate(value);
      if (_.isNil(date)) {
        return date;
      } else {
        return date.valueOf();
      }
    },

    /**
     * Converts the input to a moment. The input can be a date
     * string, e.g. `07 Sep 1986`, or the number of milliseconds
     * since the Unix Epoch (Jan 1 1970 12AM UTC).
     *
     * A string input must contain the date in the format
     * DD MMM YYYY, e.g. `Tue, 03 Feb 2012 00:00:00 GMT`.
     * Otherwise, an error is thrown. Note that the time in
     * the example input is ignored.
     *
     * @method toMoment
     * @param date the date integer or string
     * @return the parsed moment date, or the input date
     *    if the input date is undefined or null
     */
    toMoment: function(date) {
      var match;
      if (date != null) {
        if (_.isString(date)) {
          match = /(\d{2}) ([A-Z][a-z]{2}) (\d{4})/.exec(date);
          if (match) {
            return moment(match.slice(1, 4).join(' '), 'DD MMM YYYY');
          } else {
            throw new Error("Input string does not contain a date" + (" formatted as DD MMM YYYY: " + date));
          }
        } else {
          return moment(date);
        }
      } else {
        return date;
      }
    },

    /**
     * Anonymizes the given date by changing the month and day to
     * July 7.
     *
     * @method anonymize
     * @param date the date to anonymize
     * @return the new anonymized date, or undefined
     *    if the input date is undefined or null
     */
    anonymize: function(date) {
      if (date != null) {
        return moment([date.year(), 6, 7]);
      } else {
        return date;
      }
    }
  };

  export { DateHelper as default };

}).call(this);
