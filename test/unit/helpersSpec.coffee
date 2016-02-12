define ['ngmocks', 'moment', 'expect', 'helpers'], (ng, moment, expect) ->
  describe 'Unit Testing the Helpers', ->
    beforeEach ->
      # Fake the Helpers service.
      ng.module('qiprofile.helpers')

    describe 'StringHelper', ->
      StringHelper = null

      beforeEach ->
        # Obtain the StringHelper service.
        inject ['StringHelper', (_StringHelper_) ->
          StringHelper = _StringHelper_
        ]

      describe 'dasherize', ->
        it 'should convert a sequence of more than one capital letter to a single dashed component', ->
          tests =
            ABC: 'abc'
            '-a': '-a'
            'a-': 'a-'
            'A-Bc': 'a-bc'
            AbC: 'ab-c'
            ABc: 'a-bc'
            ABcDEFghIjKL: 'a-bc-de-fgh-ij-kl'

          for s, expected of tests
            result = StringHelper.dasherize(s)
            expect(result, "Dasherized #{ s } incorrect").to.equal(expected)

    describe 'ObjectHelper', ->
      ObjectHelper = null

      beforeEach ->
        # Obtain the ObjectHelper service.
        inject ['ObjectHelper', (_ObjectHelper_) ->
          ObjectHelper = _ObjectHelper_
        ]

      describe 'fromJSON', ->
        mock =
          _id: 1
          an_int: 1
          inner:
            an_obj:
              an_array: [
                an_int: 3
              ]
            
        obj = null

        beforeEach ->
          data = JSON.stringify(mock)
          obj = ObjectHelper.fromJson(data)

        it 'should add camelCase aliases to underscore properties', ->
          expect('anInt' in Object.keys(obj),
                 "The alias is not defined as an enumerable property")
            .to.be.true
          expect(obj.anInt, "the alias value is incorrect").to.equal(mock.an_int)
          obj.an_int = obj.an_int + 1
          expect(obj.anInt, "The alias value does not reflect an underscore change")
            .to.equal(obj.an_int)
          obj.anInt = obj.anInt + 1
          expect(obj.an_int, "The underscore value does not reflect an alias change")
            .to.equal(obj.anInt)

        it 'should make the camelCase alias enumerable', ->
          expect('anInt' in Object.keys(obj),
                 "The underscore property is still enumerable").to.be.true

        it 'should make the underscore property non-enumerable', ->
          expect('an_int' in Object.keys(obj),
                 "The underscore property is still enumerable").to.be.false

        it 'should make the underscore property nonenumerable', ->
          expect(obj.an_int, "an_int is incorrect").to.equal(mock.an_int)

        it 'should add camelCase aliases to inner objects', ->
          expect('anObj' in Object.keys(obj.inner),
                 "the inner underscore scalar property is not aliased")
            .to.be.true
          expect(obj.inner.anObj.anInt,
                 "The inner reference alias value is incorrect")
            .to.eql(mock.inner.an_obj.an_int)

        it 'should add camelCase aliases to arrays', ->
          expect('anArray' in Object.keys(obj.inner.anObj),
                 "The inner underscore array property is not aliased").to.be.true
          expect(obj.inner.anObj.anArray.length, "the inner array length is incorrect")
            .to.equal(1)
          item = obj.inner.anObj.anArray[0]
          expect('anInt' in Object.keys(item), "the inner array item scalar property" +
                                               " is not aliased").to.be.true

      describe 'prettyPrint', ->
        cycle =
          d: 3
        cycle.ref = cycle
        mock =
          a: 1
          b: [
            c:
              d: 2
          ]
          cycle: cycle

        it 'should print the hierarchy', ->
          expected = [
            '{'
            '  "a": 1,'
            '  "b": ['
            '    {'
            '      "c": {'
            '        "d": 2'
            '      }'
            '    }'
            '  ],'
            '  "cycle": {'
            '    "d": 3,'
            '    "ref": "..."'
            '  }'
            '}'
          ]
          actual = ObjectHelper.prettyPrint(mock).split("\n")
          for i in [0...Math.min(actual.length, expected.length)]
            expect(actual[i], "prettyPrint result line #{ i } is incorrect")
              .to.equal(expected[i])
          expect(actual.length, "prettyPrint result line count is incorrect")
            .to.equal(expected.length)

      describe 'aliasPublicDataProperties', ->
        it 'should alias public value properties', ->
          src = {a: 1}
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.a, 'The public value property was not aliased')
            .to.equal(src.a)

        it 'should alias public virtual properties', ->
          src = {a: 1}
          Object.defineProperty src, 'b',
            enumerable: true
            get: -> src.a
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.b, 'The public virtual property was not aliased')
            .to.equal(src.b)

        it 'should alias non-eumerable public properties', ->
          src = {}
          Object.defineProperty src, 'a',
            enumerable: false
            value: 1
          dest = {}
          ObjectHelper.aliasPublicDataProperties(src, dest)
          expect(dest.a, 'The public virtual property was not aliased')
            .to.equal(src.a)

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
        inject ['DateHelper', (_DateHelper_) ->
          DateHelper = _DateHelper_
        ]

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
