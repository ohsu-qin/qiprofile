
/**
 * Roman numeral conversion utilities.
 *
 * @module roman
 * @main roman
 */

(function() {
  import * as _ from "lodash";

  /**
   * @method repeat
   * @private
   * @param s the string to repeat
   * @param n the number of repititions
   * @return the string repeated n times
   */
  var HUNDREDS, MAX, ONES, ROMANS, Roman, TENS, THOUSANDS, genRomans, i, incrementMax, ref, repeat, results;

  repeat = function(s, n) {
    return new Array(n + 1).join(s);
  };


  /**
   * @method genRomans
   * @private
   * @param one the one character
   * @param five the five character
   * @param ten the ten character
   * @param max the number of roman numerals to generate
   *   (0 to 10, default 10)
   * @return an array of the roman numerals
   * @throws RangeError if the max parameter is not in the inclusive
   *   range [0, 10]
   * @throws Error if one of the characters or the max is invalid
   */

  genRomans = function(one, five, ten, max) {
    var genRoman, i, results;
    if (max == null) {
      max = 10;
    }

    /**
     * @method genRoman
     * @private
     * @param n the input integer
     * @return the corresponding roman numeral in one, five
     *    and ten units
     */
    genRoman = function(n) {
      var ones;
      ones = n % 5;
      if (n < 4 || !five) {
        return repeat(one, n);
      } else if (n < 6) {
        return repeat(one, 5 - n) + five;
      } else if (n < 9) {
        return five + repeat(one, n - 5);
      } else {
        return repeat(one, 10 - n) + ten;
      }
    };
    if (max <= 0 || max > 10) {
      throw new RangeError("The roman numeral generator count must be in" + (" the range 1 to 10: " + max));
    }
    if (!one) {
      throw new Error("The roman numeral generator is missing a one character");
    }
    if (five && !ten) {
      throw new Error("The roman numeral generator is missing a ten character");
    }
    if (ten && !five) {
      throw new Error("The roman numeral generator is missing a five character");
    }
    return (function() {
      results = [];
      for (var i = 0; 0 <= max ? i <= max : i >= max; 0 <= max ? i++ : i--){ results.push(i); }
      return results;
    }).apply(this).map(genRoman);
  };

  ONES = genRomans('I', 'V', 'X');

  TENS = genRomans('X', 'L', 'C');

  HUNDREDS = genRomans('C', 'D', 'M');

  THOUSANDS = genRomans('M', '', '');

  ROMANS = [ONES, TENS, HUNDREDS, THOUSANDS];


  /**
   * @method incrementMax
   * @private
   * @return the input `sum` shifted left one unit place
   *   and incremented by the number of roman numerals for
   *   the given `place`.
   */

  incrementMax = function(sum, place) {
    return (sum * 10) + ROMANS[place].length - 1;
  };

  MAX = _.reduceRight((function() {
    results = [];
    for (var i = 0, ref = ROMANS.length; 0 <= ref ? i < ref : i > ref; 0 <= ref ? i++ : i--){ results.push(i); }
    return results;
  }).apply(this), incrementMax, 0);


  /**
   * The static Roman utility.
   * Provides the `romanize`  function to convert between an
   * integer and a roman numeral.
   *
   * This module is freely adapted from the suggestions offered at
   * http://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript.
   *
   * @class Roman
   * @static
   */

  Roman = {

    /**
     * @method romanize
     * @param value the input string or integer
     * @return the roman numeral string
     * @throws RangeError if the string value is not a string consisting of
     *   positive digits less than 4000
     */
    romanize: function(value) {
      var digits, j, n, places, prepend, ref1, results1;
      n = _.isInteger(value) ? value : parseInt(value.toString());
      if (!n || n < 0) {
        throw new RangeError("The romanize input value cannot be converted" + (" to a positive integer: " + value));
      }
      if (n > MAX) {
        throw new RangeError("The romanize input value exceeds the maximum" + (" supported value of " + MAX + ": " + value));
      }
      digits = n.toString().split('').map(function(n) {
        return parseInt(n);
      });
      places = (function() {
        results1 = [];
        for (var j = 0, ref1 = digits.length; 0 <= ref1 ? j < ref1 : j > ref1; 0 <= ref1 ? j++ : j--){ results1.push(j); }
        return results1;
      }).apply(this);

      /**
       * Prepends the roman numeral conversion of the right-most digit to the
       * given roman numeral. This function removes the right-most digit from
       * the digits array.
       *
       * @method prepend
       * @private
       * @param roman the roman numeral to augment
       * @param place the roman numeral place index
       * @return the augmented roman numeral
       */
      prepend = function(roman, place) {
        var digit;
        digit = digits.pop();
        return ROMANS[place][digit] + roman;
      };
      return _.reduce(places, prepend, '');
    }
  };

  export { Roman as default };

}).call(this);
