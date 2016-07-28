`import StringHelper from './string-helper.service.coffee'`

describe 'StringHelper', ->

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
