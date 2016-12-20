(function() {
  import REST from "./rest.coffee";

  /**
   * The {{#crossLink "REST"}}{{/crossLink}} validator.
   *
   * @module rest
   * @class RESTSpec
   */
  describe('The REST Service', function() {
    describe('where', function() {
      it('should quote strings', function() {
        var actual, expected, input;
        input = {
          a: 'a'
        };
        expected = {
          where: '{"a":"a"}'
        };
        actual = REST.where(input);
        return expect(actual, "The string condition is incorrect").to.deep.equal(expected);
      });
      return it('should not quote numbers', function() {
        var actual, expected, input;
        input = {
          a: 1
        };
        expected = {
          where: '{"a":1}'
        };
        actual = REST.where(input);
        return expect(actual, "The numeric condition is incorrect").to.deep.equal(expected);
      });
    });
    describe('map', function() {
      return it('should project the fields', function() {
        var actual, expected, input;
        input = ['a', 'b'];
        expected = {
          projection: '{"a": 1,"b": 1}'
        };
        actual = REST.map(input);
        return expect(actual, "The string condition is incorrect").to.deep.equal(expected);
      });
    });
    return describe('omit', function() {
      return it('should project all but the fields', function() {
        var actual, expected, input;
        input = ['a', 'b'];
        expected = {
          projection: '{"a": 0,"b": 0}'
        };
        actual = REST.omit(input);
        return expect(actual, "The string condition is incorrect").to.deep.equal(expected);
      });
    });
  });

}).call(this);
