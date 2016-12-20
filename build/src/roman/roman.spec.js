(function() {
  import chai, { expect } from "chai";
  import Roman from "./roman.coffee";

  /**
   *  {{#crossLink "Roman"}}{{/crossLink}} validator.
   *
   * @class RomanSpec
   */
  describe('The Roman service', function() {
    return it('should convert a string or an integer to a roman numeral', function() {
      var HUNDREDS, ONES, TENS, THOUSANDS, actual, c, expected, i, j, m, n, ref, results, x;
      ONES = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
      TENS = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC'];
      HUNDREDS = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM'];
      THOUSANDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function(i) {
        return new Array(i).join('M');
      });
      results = [];
      for (m = j = 0, ref = THOUSANDS.length; 0 <= ref ? j < ref : j > ref; m = 0 <= ref ? ++j : --j) {
        results.push((function() {
          var k, ref1, results1;
          results1 = [];
          for (c = k = 0, ref1 = HUNDREDS.length; 0 <= ref1 ? k < ref1 : k > ref1; c = 0 <= ref1 ? ++k : --k) {
            results1.push((function() {
              var l, ref2, results2;
              results2 = [];
              for (x = l = 0, ref2 = TENS.length; 0 <= ref2 ? l < ref2 : l > ref2; x = 0 <= ref2 ? ++l : --l) {
                results2.push((function() {
                  var o, ref3, results3;
                  results3 = [];
                  for (i = o = 0, ref3 = ONES.length; 0 <= ref3 ? o < ref3 : o > ref3; i = 0 <= ref3 ? ++o : --o) {
                    n = m * 1000 + c * 100 + x * 10 + i;
                    if (n) {
                      expected = THOUSANDS[m] + HUNDREDS[c] + TENS[x] + ONES[i];
                      actual = Roman.romanize(n);
                      results3.push(expect(actual, "Romanized value for " + n + " is incorrect").to.equal(expected));
                    } else {
                      results3.push(void 0);
                    }
                  }
                  return results3;
                })());
              }
              return results2;
            })());
          }
          return results1;
        })());
      }
      return results;
    });
  });

}).call(this);
