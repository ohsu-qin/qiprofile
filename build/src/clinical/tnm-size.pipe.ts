import { Pipe, PipeTransform } from '@angular/core';

import TNM from './tnm.coffee';

/**
 * Formats the database TNM size object to a display value.
 */
@Pipe({name: 'tnmSize'})
export class TnmSizePipe implements PipeTransform {

  constructor() { }

  /**
   * Formats the size of the input TNM size object for display.
   *
   * @method transform
   * @param value {Object} the TNM size input
   * @return {string} the size display string
   */
  transform(value: Object): string {
    return value && TNM.formatSize(value);
  }
}
