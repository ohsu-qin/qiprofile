
/**
 * String utilities.
 *
 * @module string
 * @main string
 */

(function() {
  import * as _s from "underscore.string";

  /**
   * The static StringHelper utility.
   *
   * @class StringHelper
   * @static
   */
  var StringHelper;

  StringHelper = {

    /**
     * Improves on underscore.string dasherize by converting each
     * sequence of two or more capital letters to lowercase without
     * dashes, e.g.:
     *     StringHelper.dasherize('TNM')
     * returns 'tnm' rather than the underscore.string result '-t-n-m'.
     *
     * @method dasherize
     * @param s the input string
     * @return the lowercase dashed conversion
     */
    dasherize: function(s) {
      var prep, prepped, sdashed;
      prep = function(match) {
        var first, last, rest;
        first = match[0];
        rest = match.substring(1);
        last = match[match.length - 1];
        if (last === last.toUpperCase()) {
          return first + rest.toLowerCase();
        } else {
          return first + rest.slice(0, -2).toLowerCase() + rest.slice(-2);
        }
      };
      prepped = s.replace(/[A-Z]{2,}.?/g, prep);
      sdashed = _s.dasherize(prepped);
      if (sdashed[0] === '-' && s[0] !== '-') {
        return sdashed.substring(1);
      } else {
        return sdashed;
      }
    },

    /**
     * Humanizes and capitalizes the input string.
     *
     * Example:
     *     StringHelper.labelize("abcDef_g");
     *     // => "Abc Def G"
     *
     * @method labelize
     * @param s the input string
     * @return the lowercase dashed conversion
     */
    labelize: function(s) {
      return _s.humanize(s).split(' ').map(_s.capitalize).join(' ');
    }
  };

  export { StringHelper as default };

}).call(this);
