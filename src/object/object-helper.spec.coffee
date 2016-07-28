`import ObjectHelper from "./object-helper.coffee"`

###*
 * The ObjectHelper validator.
 *
 * @class ObjectHelper
 * @static
###
describe 'ObjectHelper', ->

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
      expect('anInt' of obj, 'The alias is not defined as an enumerable' +
                             ' property')
        .to.be.true
      expect(obj.anInt, 'The alias value is incorrect')
        .to.equal(mock.an_int)
      obj.an_int = obj.an_int + 1
      expect(obj.anInt, 'The alias value does not reflect an underscore' +
                        ' change')
        .to.equal(obj.an_int)
      obj.anInt = obj.anInt + 1
      expect(obj.an_int, 'The underscore value does not reflect an alias' +
                         ' change')
        .to.equal(obj.anInt)

    it 'should make the camelCase alias enumerable', ->
      expect('anInt' in Object.keys(obj), 'The camelCase property is' +
                                          ' still enumerable')
        .to.be.true

    it 'should make the underscore property non-enumerable', ->
      expect('an_int' in Object.keys(obj), 'The underscore property is' +
                                           ' still enumerable')
        .to.be.false

    it 'should make the underscore property nonenumerable', ->
      expect(obj.an_int, 'an_int is incorrect').to.equal(mock.an_int)

    it 'should add camelCase aliases to inner objects', ->
      expect('anObj' of obj.inner, 'The inner underscore scalar property' +
                                   ' is not aliased')
        .to.be.true
      expect(obj.inner.anObj.anInt, 'The inner reference alias value is' +
                                    ' incorrect')
        .to.eql(mock.inner.an_obj.an_int)

    it 'should add camelCase aliases to arrays', ->
      expect('anArray' of obj.inner.anObj, 'The inner underscore array' +
                                           ' property is not aliased')
        .to.be.true
      expect(obj.inner.anObj.anArray.length, 'the inner array length is' +
                                             ' incorrect')
        .to.equal(1)
      item = obj.inner.anObj.anArray[0]
      expect('anInt' of item, 'The inner array item scalar property' +
                              ' is not aliased').to.be.true

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
