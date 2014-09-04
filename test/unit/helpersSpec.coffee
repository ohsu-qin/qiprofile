define ['ngmocks', 'helpers', 'moment'], (mocks, helpers, moment) ->
  describe 'Unit Testing Helpers', ->
    describe 'ObjectHelper', ->
      ObjectHelper = null

      beforeEach ->
        # Obtain the ObjectHelper service.
        angular.mock.module('qiprofile.helpers')
        inject ['ObjectHelper', (_ObjectHelper_) ->
          ObjectHelper = _ObjectHelper_
        ]
      
      describe 'fromJSON', ->
        mock =
          _id: 1
          an_int: 1
          inner:
            an_obj:
              an_int: 3
        obj = null
        
        beforeEach ->
          data = JSON.stringify(mock)
          obj = ObjectHelper.fromJson(data)
        
        it 'should add camelCase aliases to underscore properties', ->
          expect('anInt' in Object.keys(obj), "the alias is not defined as an enumerable property")
            .to.be.true
          expect(obj.anInt, "the alias value is incorrect").to.equal(mock.an_int)
          obj.an_int = obj.an_int + 1
          expect(obj.anInt, "the alias value does not reflect an underscore change")
            .to.equal(obj.an_int)
          obj.anInt = obj.anInt + 1
          expect(obj.an_int, "the underscore value does not reflect an alias change")
            .to.equal(obj.anInt)

        it 'should make the camelCase alias enumerable', ->
          expect('anInt' in Object.keys(obj), "the underscore property is still enumerable")
            .to.be.true   

        it 'should make the underscore property non-enumerable', ->
          expect('an_int' in Object.keys(obj), "the underscore property is still enumerable")
            .to.be.false   

        it 'should make the underscore property nonenumerable', ->
          expect(obj.an_int, "an_int is incorrect").to.equal(mock.an_int)   

        it 'should add camelCase aliases to inner objects', ->
          expect('anObj' in Object.keys(obj.inner), "the inner underscore property is not aliased")
            .to.be.true
          expect(obj.inner.anObj.anInt, "the inner reference alias value is incorrect")
            .to.eql(mock.inner.an_obj.an_int)

      describe 'aliasPublicDataProperties', ->
        it 'should alias public value properties', ->
          src = {a: 1}
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.a, 'The public value property was not aliased').to.equal(src.a)

        it 'should alias public virtual properties', ->
          src = {a: 1}
          Object.defineProperty src, 'b',
            enumerable: true
            get: -> src.a
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.b, 'The public virtual property was not aliased').to.equal(src.b)

        it 'should alias non-eumerable public properties', ->
          src = {}
          Object.defineProperty src, 'a',
            enumerable: false
            value: 1
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.a, 'The public virtual property was not aliased').to.equal(src.a)

        it 'should not alias private properties', ->
          src = {_a: 2}
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest._a, 'A private property was aliased').to.not.exist

        it 'should not alias existing properties', ->
          src = {a: 1}
          dest = {a: null}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.a, 'A non-null destination property was overrwritten')
            .to.not.equal(src.a)

    describe 'DateHelper', ->
      DateHelper = null

      beforeEach ->
        # Obtain the DateHelper service.
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
