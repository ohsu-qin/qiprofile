define ['ngmocks', 'helpers', 'moment'], (mocks, helpers, moment) ->
  describe 'Unit Testing Helpers', ->
    describe 'ObjectHelper', ->
      ObjectHelper = null

      beforeEach ->
        # Obtain the Helpers service.
        angular.mock.module('qiprofile.helpers')
        inject ['ObjectHelper', (_ObjectHelper_) ->
          ObjectHelper = _ObjectHelper_
        ]

      describe 'copyNonNullPublicProperties', ->
        it 'should copy public properties', ->
          src = {a: 1}
          dest = {}
          ObjectHelper.copyNonNullPublicProperties(src, dest)
          expect(dest.a, 'A public property was not copied').to.equal(src.a)

        it 'should replace null public properties', ->
          src = {a: 1}
          dest = {a: null}
          ObjectHelper.copyNonNullPublicProperties(src, dest)
          expect(dest.a, 'A public property was not copied').to.equal(src.a)

        it 'should not copy private properties', ->
          src = {_a: 2}
          dest = {}
          ObjectHelper.copyNonNullPublicProperties(src, dest)
          expect(dest._a, 'A private property was copied').to.not.exist

        it 'should not overwrite non-null properties', ->
          src = {a: 1}
          dest = {a: 2}
          ObjectHelper.copyNonNullPublicProperties(src, dest)
          expect(dest.a, 'A non-null destination property was overrwritten')
            .to.not.equal(src.a)

    describe 'DateHelper', ->
      DateHelper = null

      beforeEach ->
        # Obtain the Helpers service.
        angular.mock.module('qiprofile.helpers')
        inject ['DateHelper', (_DateHelper_) ->
          DateHelper = _DateHelper_
        ]

      describe 'asMoment', ->
        it 'should parse a string date', ->
          dateStr = 'Aug 14, 2012'
          expected = moment(dateStr)
          actual = DateHelper.asMoment(dateStr)
          expect(actual, 'A string date was not parsed').to.eql(expected)

        it 'should parse an integer date', ->
          dateInt = moment().valueOf()
          actual = DateHelper.asMoment(dateInt)
          expect(actual.valueOf(), 'An integer date was not parsed').to.eql(dateInt)

        it 'should not parse null', ->
          expect(DateHelper.asMoment(null), 'A null date was parsed').to.be.null

      describe 'anonymize', ->
        it 'should set the month to July', ->
          date = moment('Aug 14, 2012')
          anon = DateHelper.anonymize(date)
          expect(anon.month(), 'The anonymized month is not July').to.equal(6)

        it 'should seet the day of the month to 7', ->
          date = moment('Aug 14, 2012')
          anon = DateHelper.anonymize(date)
          expect(anon.date(), 'The anonymized day of the month is not 7').to.equal(7)
