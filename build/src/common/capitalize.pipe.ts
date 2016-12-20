import * as _s from 'underscore.string';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Capitalizes string input.
 */
@Pipe({name: 'capitalize'})
export class CapitalizePipe implements PipeTransform {

  constructor() { }

  /**
   * @method transform
   * @param value {boolean} the string or null input
   * @return {string} the captalized string
   */
  transform(value: boolean): string {
    return value ? _s.capitalize(value) : value;
  }
}
