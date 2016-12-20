import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats the display value of a three-valued boolean input.
 */
@Pipe({name: 'boolean'})
export class BooleanPipe implements PipeTransform {

  constructor() { }

  /**
   * Returns the string representation of the given input value
   * as follows:
   * * true => the *trueStr*
   * * false => the *falseStr*
   * * null or undefined => 'Not Specified'
   *
   * @method transform
   * @param value {boolean} the boolean or null input
   * @param trueStr {string} the true conversion (default `True`)
   * @param falseStr {string} the false conversion (default `False`)
   * @return {string} the string representation
   * @throws {TypeError} if the value is not boolean, null or undefined
   */
  transform(value: boolean, trueStr='True', falseStr='False'): string {
    if (value === true) {
      return trueStr;
    } else if (value === false) {
      return falseStr;
    } else if (_.isNil(value)) {
      return 'Not Specified';
    } else {
      throw new TypeError('The input value is not boolean, null or' +
                          ` undefined: ${ value }`);
    }
  }
}
