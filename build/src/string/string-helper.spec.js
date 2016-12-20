(function() {
  import StringHelper from "./string-helper.coffee";

  /**
   * The {{#crossLink "StringHelper"}}{{/crossLink}} validator.
   *
   * @module string
   * @class StringHelperSpec
   */
  describe('StringHelper', function() {
    return describe('dasherize', function() {
      return it('should convert a sequence of more than one capital letter to a single dashed component', function() {
        var expected, result, results, s, tests;
        tests = {
          ABC: 'abc',
          '-a': '-a',
          'a-': 'a-',
          'A-Bc': 'a-bc',
          AbC: 'ab-c',
          ABc: 'a-bc',
          ABcDEFghIjKL: 'a-bc-de-fgh-ij-kl'
        };
        results = [];
        for (s in tests) {
          expected = tests[s];
          result = StringHelper.dasherize(s);
          results.push(expect(result, "Dasherized " + s + " incorrect").to.equal(expected));
        }
        return results;
      });
    });
  });

}).call(this);
