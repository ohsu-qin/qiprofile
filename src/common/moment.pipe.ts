import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'moment'})

/**
 * Transforms a moment date value to a display value.
 *
 * @module common
 * @class MomentPipe
 */
export class MomentPipe implements PipeTransform {
  constructor() { }

  /**
   * Looks up the input value within the `choices.cfg` section
   * for the given topic. If found, then this method returns
   * the look-up result, otherwise this method returns the
   * input value. If the input value is an array, then this
   * method collects the item transformations.
   *
   * @method transform
   * @param value {Object} the moment date input
   * @param format {string} the optional date format
   * @return {string} the display string
   */
  transform(value: Object, format='MM/DD/YYYY'): string {
    return value && value.format(format);
  }
}
