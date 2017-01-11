import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formats a nil input value.
 */
@Pipe({name: 'unspecified'})
export class UnspecifiedPipe implements PipeTransform {

  constructor() { }

  /**
   * Converts a null or undefined input value to the *nilStr*
   * string.
   *
   * @method transform
   * @param value {any} the input value
   * @param nilStr {string} the nil conversion (default `Not Specified`)
   * @return {string} the string representation
   */
  transform(value: boolean, nilStr='Not Specified'): string {
    return _.isNil(value) ? nilStr : value;
  }
}
