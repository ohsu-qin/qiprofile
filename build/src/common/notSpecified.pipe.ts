import * as _ from 'lodash';
import { Pipe, PipeTransform } from '@angular/core';

/**
 * Adds `Not Specified` as the value for missing data.
 */
@Pipe({name: 'notSpecified'})
export class NotSpecifiedPipe implements PipeTransform {

  constructor() { }

  /**
   * @method transform
   * @param value {any} the input
   * @return {any} the input, if it exists, otherwise `Not Specified`
   */
  transform(value: any): any {
    return _.isNil(value) ? 'Not Specified' : value;
  }
}
