import { Pipe, PipeTransform } from '@angular/core';

import Roman from './roman.coffee';

/**
 * Transforms an Arabic integer to a Roman numberal (seriously).
 */
@Pipe({name: 'romanize'})
export class RomanizePipe implements PipeTransform {

  constructor() { }

  /**
   * Delegates to
   * {{#crossLink "Roman/romanize"}}{{/crossLink}}.
   *
   * @method transform
   * @param value {number} the input integer
   * @return {string} the corresponding roman numberal
   */
  transform(value: number): string {
    return value && Roman.romanize(value);
  }
}
