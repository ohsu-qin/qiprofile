import { Pipe, PipeTransform } from '@angular/core';

import TNM from './tnm.coffee';

/**
 * Formats the database TNM object to a stage display value.
 */
@Pipe({name: 'tnmStage'})
export class TnmStagePipe implements PipeTransform {

  constructor() { }

  /**
   * Computes the stage of the input TNM object for display.
   *
   * @method transform
   * @param value {Object} the TNM input
   * @return {string} the stage display string
   */
  transform(value: Object): string {
    return value && TNM.stage(value);
  }
}
