`import moment from "moment"`

`import DateHelper from './date-helper.service.coffee'`

describe 'DateHelper', ->

  describe 'asMoment', ->
    it 'should parse a string date', ->
      dateStr = '14 Aug 2012'
      expected = moment(dateStr, 'DD MMM YYYY')
      actual = DateHelper.asMoment(dateStr)
      expect(actual, 'The string date was not parsed accurately')
        .to.eql(expected)

    it 'should parse an integer date', ->
      dateInt = moment().valueOf()
      actual = DateHelper.asMoment(dateInt).valueOf()
      expect(actual.valueOf(), 'The integer date was not parsed')
        .to.eql(dateInt)

    it 'should not parse null', ->
      expect(DateHelper.asMoment(null), 'The null date was parsed')
        .to.be.null

  describe 'anonymize', ->
    it 'should set the month to July', ->
      date = moment('14 Aug 2012', 'DD MMM YYYY')
      anon = DateHelper.anonymize(date)
      expect(anon.month(), 'The anonymized month is not July').to.equal(6)

    it 'should set the day of the month to 7', ->
      date = moment('14 Aug 2012', 'MMM DD, YYYY')
      anon = DateHelper.anonymize(date)
      expect(anon.date(), 'The anonymized day of the month is not 7')
        .to.equal(7)
