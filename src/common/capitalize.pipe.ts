import * as _s from 'underscore.string';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Capitalizes string input.
 */
@Pipe({name: 'capitalize'})
/**
 * Capitalizes string input.
 *
 * @module common
 * @class CapitalizePipe
 */
export class CapitalizePipe implements PipeTransform {
  constructor() { }

  /**
   * @method transform
   * @param value {string} the input string or null
   * @return {string} the captalized string
   */
  transform(value: string): string {
    return value ? _s.capitalize(value) : value;
  }
}
