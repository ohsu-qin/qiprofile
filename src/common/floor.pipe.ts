// This pipe is stolen from ngx-pipes to work around the
// following ngx-pipes bug:
// * ngx-pipes index.d.ts results in the following typings error:
//     Unable to read "src/app.d.ts"
//   Several attempts to work around this bug were unsuccessful.
//
// TODO - revisit the deficient jspm / typings interaction once
// jspm matures.
//

import { PipeTransform, Pipe } from '@angular/core';

@Pipe({name: 'floor'})

/**
 * Gets the floor of a number.
 *
 * @module common
 * @class FloorPipe
 */
export class FloorPipe implements PipeTransform {

  transform(num: number, precision=0): number {
    if (precision <= 0) {
      return Math.floor(num);
    }

    const tho = 10 ** precision;
    return Math.floor(num * tho) / tho;
  }
}
