`import chai, { expect } from "chai"`

`import Roman from "./roman.service.coffee"`

describe 'The Roman Service', ->
  it 'should convert a string or an integer to a roman numeral', ->
    ONES = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX']

    TENS = ['', 'X', 'XX', 'XXX', 'XL', 'L', 'LX', 'LXX', 'LXXX', 'XC']

    HUNDREDS = ['', 'C', 'CC', 'CCC', 'CD', 'D', 'DC', 'DCC', 'DCCC', 'CM']

    THOUSANDS = [1..10].map((i) -> new Array(i).join('M'))

    for m in [0...THOUSANDS.length]
      for c in [0...HUNDREDS.length]
        for x in [0...TENS.length]
          for i in [0...ONES.length]
            n = m * 1000 + c * 100 + x * 10 + i
            if n
              expected = THOUSANDS[m] + HUNDREDS[c] + TENS[x] + ONES[i]
              actual = Roman.romanize(n)
              expect(actual, "Romanized value for #{ n } is incorrect")
                .to.equal(expected)
