(function() {
  import moment from "moment";
  import DateHelper from "./date-helper.coffee";

  /**
   * The {{#crossLink "DateHelper"}}{{/crossLink}} validator.
   *
   * @module data
   * @class DateHelperSpec
   */
  describe('DateHelper', function() {
    describe('asMoment', function() {
      it('should parse a string date', function() {
        var actual, dateStr, expected;
        dateStr = '14 Aug 2012';
        expected = moment(dateStr, 'DD MMM YYYY');
        actual = DateHelper.asMoment(dateStr);
        return expect(actual, 'The string date was not parsed accurately').to.eql(expected);
      });
      it('should parse an integer date', function() {
        var actual, dateInt;
        dateInt = moment().valueOf();
        actual = DateHelper.asMoment(dateInt).valueOf();
        return expect(actual.valueOf(), 'The integer date was not parsed').to.eql(dateInt);
      });
      return it('should not parse null', function() {
        return expect(DateHelper.asMoment(null), 'The null date was parsed').to.be["null"];
      });
    });
    return describe('anonymize', function() {
      it('should set the month to July', function() {
        var anon, date;
        date = moment('14 Aug 2012', 'DD MMM YYYY');
        anon = DateHelper.anonymize(date);
        return expect(anon.month(), 'The anonymized month is not July').to.equal(6);
      });
      return it('should set the day of the month to 7', function() {
        var anon, date;
        date = moment('14 Aug 2012', 'MMM DD, YYYY');
        anon = DateHelper.anonymize(date);
        return expect(anon.date(), 'The anonymized day of the month is not 7').to.equal(7);
      });
    });
  });

}).call(this);
