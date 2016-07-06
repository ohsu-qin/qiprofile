`import Rest from "./rest.service.coffee"`

describe 'Unit Testing the REST Service', ->
  describe 'where', ->
    it 'should quote strings', ->
      input = a: 'a'
      expected = where: '{"a":"a"}'
      actual = Rest.where(input)
      expect(actual, "The string condition is incorrect").to.deep.equal(expected)
    it 'should not quote numbers', ->
      input = a: 1
      expected = where: '{"a":1}'
      actual = Rest.where(input)
      expect(actual, "The numeric condition is incorrect").to.deep.equal(expected)

  describe 'map', ->
    it 'should project the fields', ->
      input = ['a', 'b']
      expected = projection: '{"a": 1,"b": 1}'
      actual = Rest.map(input)
      expect(actual, "The string condition is incorrect").to.deep.equal(expected)

  describe 'omit', ->
    it 'should project all but the fields', ->
      input = ['a', 'b']
      expected = projection: '{"a": 0,"b": 0}'
      actual = Rest.omit(input)
      expect(actual, "The string condition is incorrect").to.deep.equal(expected)
