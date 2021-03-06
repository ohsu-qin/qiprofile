###*
 * Roman numeral conversion utilities.
 *
 * @module roman
 * @main roman
###

`import * as _ from "lodash"`

###*
 * @method repeat
 * @private
 * @param s the string to repeat
 * @param n the number of repititions
 * @return the string repeated n times
###
repeat = (s, n) ->
  new Array(n + 1).join(s)

###*
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
###
genRomans = (one, five, ten, max=10) ->
  ###*
   * @method genRoman
   * @private
   * @param n the input integer
   * @return the corresponding roman numeral in one, five
   *    and ten units
  ###
  genRoman = (n) ->
    ones = n % 5
    if n < 4 or not five
      repeat(one, n)
    else if n < 6
      repeat(one, 5 - n) + five
    else if n < 9
      five + repeat(one, n - 5)
    else
      repeat(one, 10 - n) + ten

  if max <= 0 or max > 10
    throw new RangeError("The roman numeral generator count must be in" +
                         " the range 1 to 10: #{ max }")
  if not one
    throw new Error("The roman numeral generator is missing a one character")
  if five and not ten
    throw new Error("The roman numeral generator is missing a ten character")
  if ten and not five
    throw new Error("The roman numeral generator is missing a five character")

  [0..max].map(genRoman)

ONES = genRomans('I', 'V', 'X')

TENS = genRomans('X', 'L', 'C')

HUNDREDS = genRomans('C', 'D', 'M')

THOUSANDS = genRomans('M', '', '')

ROMANS = [ONES, TENS, HUNDREDS, THOUSANDS]

###*
 * @method incrementMax
 * @private
 * @return the input `sum` shifted left one unit place
 *   and incremented by the number of roman numerals for
 *   the given `place`.
###
incrementMax = (sum, place) ->
  (sum * 10) + ROMANS[place].length - 1

# The maximum supported value.
MAX = _.reduceRight([0...ROMANS.length], incrementMax, 0)

###*
 * The static Roman utility.
 * Provides the `romanize`  function to convert between an
 * integer and a roman numeral.
 *
 * This module is freely adapted from the suggestions offered at
 * http://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript.
 *
 * @class Roman
 * @static
###
Roman =
  ###*
   * @method romanize
   * @param value the input string or integer
   * @return the roman numeral string
   * @throws RangeError if the string value is not a string consisting of
   *   positive digits less than 4000
  ###
  romanize: (value) ->
    n = if _.isInteger(value) then value else parseInt(value.toString())
    if not n or n < 0
      throw new RangeError("The romanize input value cannot be converted" +
                          " to a positive integer: #{ value }")

    if n > MAX
      throw new RangeError("The romanize input value exceeds the maximum" +
                      " supported value of #{ MAX }: #{ value }")

    # The string digits.
    # Note: cannot use parseInt directly as the map argument, since the
    # second parseInt argument is incorrectly interpreted as a radix
    # (cf. http://stackoverflow.com/questions/262427/javascript-arraymap-and-parseint)
    digits = n.toString().split('').map((n) -> parseInt(n))

    # The place indexes.
    places = [0...digits.length]

    ###*
     * Prepends the roman numeral conversion of the right-most digit to the
     * given roman numeral. This function removes the right-most digit from
     * the digits array.
     *
     * @method prepend
     * @private
     * @param roman the roman numeral to augment
     * @param place the roman numeral place index
     * @return the augmented roman numeral
    ###
    prepend = (roman, place) ->
      digit = digits.pop()
      ROMANS[place][digit] + roman

    # Make the roman numeral by converting each digit from right to left.
    _.reduce(places, prepend, '')

`export { Roman as default }`
