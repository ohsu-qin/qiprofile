`import * as _s from "underscore.string"`

###*
 * The static StringHelper utility.
 *
 * @module common
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

`export { StringHelper as default }`
