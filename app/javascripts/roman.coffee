# Functions to convert between an integer and a roman numeral.
# This module is freely adapted from the suggestions offered at
# http://stackoverflow.com/questions/9083037/convert-a-number-into-a-roman-numeral-in-javascript.

define ['lodash'], (_) ->
  # @param s the string to repeat
  # @param n the number of repititions
  # @returns the string repeated n times
  repeat = (s, n) ->
    new Array(n + 1).join(s)

  # @param one the one character
  # @param five the five character
  # @param ten the ten character
  # @param max the number of roman numerals to generate
  #   (0 to 10, default 10)
  # @returns an array of the roman numerals
  # @throws Error if one of the characters or the max is invalid
  genRomans = (one, five, ten, max=10) ->
    # @param n the input integer
    # @returns the corresponding roman numeral
    #    in one, five and ten units
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

  # The maximum supported value.
  incrementMax = (sum, place) ->
    (sum * 10) + ROMANS[place].length - 1
  MAX = _.reduceRight([0...ROMANS.length], incrementMax, 0)

  # @param s the input string or integer
  # @returns the roman numeral string
  # @throws TypeError if the input value is not a string consisting of
  #   positive digits
  romanize: (s) ->
    s = s.toString()
    n = parseInt(s)
    if not n or n < 0
      throw new RangeError("The romanize input value cannot be converted" +
                          " to a positive integer: #{ s }")

    if n > MAX
      throw new RangeError("The romanize input value exceeds the maximum" +
                      " supported value of #{ MAX }: #{ s }")

    # The string digits.
    # Note: cannot use parseInt directly as the map argument, since the
    # second parseInt argument is incorrectly interpreted as a radix
    # (cf. http://stackoverflow.com/questions/262427/javascript-arraymap-and-parseint)
    digits = s.split('').map((n) -> parseInt(n))

    # The place indexes.
    places = [0...digits.length]

    # Prepends the roman numeral conversion of the right-most digit to the
    # given roman numeral. This function removes the right-most digit from
    # the digits array.
    #
    # @param roman the roman numeral to augment
    # @param place the ROMANS place index
    # @returns the augmented roman numeral
    prepend = (roman, place) ->
      digit = digits.pop()
      ROMANS[place][digit] + roman

    # Make the roman numeral by converting each digit from right to left. 
    _.reduce(places, prepend, '')
