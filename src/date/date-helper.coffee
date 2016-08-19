###*
 * The date utilities.
 *
 * @module date
###

`import * as _ from "lodash"`
`import moment from "moment"`

###*
 * The static DateHelper utility.
 *
 * @class DateHelper
 * @static
###
DateHelper =
  ###*
   * Converts the input to a moment. The input can be a date string,
   * e.g. '07 Sep 1986', or the number of milliseconds since
   * the Unix Epoch (Jan 1 1970 12AM UTC).
   *
   * A string input must contain the date in the format
   * DD MMM YYYY, e.g. 'Tue, 03 Feb 2012 00:00:00 GMT'.
   * Otherwise, an error is thrown. Note that the time in
   * the example input is ignored.
   *
   * @method asMoment
   * @param date the date integer or string
   * @return the parsed moment date, or the input date
   *    if the input date is undefined or null
  ###
  asMoment: (date) ->
    if date?
      if _.isString(date)
        match = /(\d{2}) ([A-Z][a-z]{2}) (\d{4})/.exec(date)
        if match
          moment(match[1..3].join(' '), 'DD MMM YYYY')
        else
          throw new Error("Input string does not contain a date" +
                          " formatted as DD MMM YYYY: #{ date }")
      else
        moment(date)
    else
      date

  ###*
   * Anonymizes the given date by changing the month and day to
   * July 7.
   *
   * @method anonymize
   * @param date the date to anonymize
   * @return the new anonymized date, or undefined
   *    if the input date is undefined or null
  ###
  anonymize: (date) ->
    # The quirky Javascript Date month is zero-based but the
    # day of month ('date' in Javascript Date's equally quirky
    # naming convention) is one-based.
    if date?
      moment([date.year(), 6, 7])
    else
      date

`export { DateHelper as default }`
