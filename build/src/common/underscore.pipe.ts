import * as _s from 'underscore.string';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'underscore'})

/**
 * Converts the string to a lower-case underscore.
 *
 * @module common
 * @class UnderscorePipe
 */
export class UnderscorePipe implements PipeTransform {
  constructor() { }

  /**
   * @method transform
   * @param value {string} the input string or null
   * @return {string} the underscored string
   */
  transform(value: string): string {
    return value ? _s.underscored(value) : value;
  }
}
