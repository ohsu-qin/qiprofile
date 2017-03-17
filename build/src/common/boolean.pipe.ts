import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'boolean'})

/**
 * Formats the display value of a three-valued boolean input.
 *
 * @module common
 * @class BooleanPipe
 */
export class BooleanPipe implements PipeTransform {
  constructor() { }

  /**
   * Returns the string representation of the given input value
   * as follows:
   * * true => the *trueStr*
   * * false => the *falseStr*
   * * null or undefined => *nilStr*
   *
   * @method transform
   * @param value {boolean} the boolean or null input
   * @param trueStr {string} the true conversion (default `True`)
   * @param falseStr {string} the false conversion (default `False`)
   * @param nilStr {string} the nil conversion (default `Not Specified`)
   * @return {string} the string representation
   * @throws {TypeError} if the value is not boolean, null or undefined
   */
  transform(
    value: boolean, trueStr='True', falseStr='False', nilStr='Not Specified'
  ): string {
    if (value === true) {
      return trueStr;
    } else if (value === false) {
      return falseStr;
    } else if (_.isNil(value)) {
      return nilStr;
    } else {
      throw new TypeError('The input value is not boolean, null or' +
                          ` undefined: ${ value }`);
    }
  }
}
