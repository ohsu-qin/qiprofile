###*
 * String utilities.
 *
 * @module string
 * @main string
###

`import * as _s from "underscore.string"`

###*
 * The static StringHelper utility.
 *
 * @class StringHelper
 * @static
###
StringHelper =
  ###*
   * Improves on underscore.string dasherize by converting each
   * sequence of two or more capital letters to lowercase without
   * dashes, e.g.:
   *     StringHelper.dasherize('TNM')
   * returns 'tnm' rather than the underscore.string result '-t-n-m'.
   *
   * @method dasherize
   * @param s the input string
   * @return the lowercase dashed conversion
  ###
  dasherize: (s) ->
    # Prepares the given match for underscore.string dasherize.
    prep = (match) ->
      # if the input string is 'aBCDeFG', then the matches
      # are 'BCDe' and 'FG'. For the initial match, *first*
      # is 'B', *rest* is 'CDe' and last is 'e'. This match
      # is prepped as 'BcDe' and dasherized as '-bc-de', and
      # the entire string is thus dasherized as 'a-bc-de-fg'.
      first = match[0]
      rest = match.substring(1)
      last = match[match.length - 1]
      if last == last.toUpperCase()
        first + rest.toLowerCase()
      else
        first + rest[...-2].toLowerCase() + rest[-2..]

    # Prepare the input string.
    prepped = s.replace(/[A-Z]{2,}.?/g, prep)
    # Delegate to underscore.string.
    sdashed = _s.dasherize(prepped)
    # Remove a bogus leading dash, if necessary.
    if sdashed[0] == '-' and s[0] != '-'
      sdashed.substring(1)
    else
      sdashed

  ###*
   * Humanizes and capitalizes the input string.
   *
   * Example:
   *     StringHelper.labelize("abcDef_g");
   *     // => "Abc Def G"
   *
   * @method labelize
   * @param s the input string
   * @return the lowercase dashed conversion
  ###
  labelize: (s) ->
    _s.humanize(s).split(' ').map(_s.capitalize).join(' ')

`export { StringHelper as default }`
