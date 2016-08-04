/**
 * The Collection Correlations component.
 *
 */
import { Component } from '@angular/core';

import {
  CollectionCorrelationComponent
} from './correlation.component.ts';

@Component({
  selector: 'qi-collection-correlations',
  templateUrl: '/public/html/collection/correlations.html',
  directives: [CollectionCorrelationComponent],
})

/**
 * The Collection Correlations component.
 *
 * @class CollectionCorrelationsComponent
 */
export class CollectionCorrelationsComponent {

  @Input subjects(): Object[];

  /**
   * The required initial chart configuration specification objects.
   * Each specification contains the following properties:
   *
   * * `x` - the X axis data accessor property naem
   * * `y` - the Y axis data accessor property name
   *
   * There is one specification object per chart.
   *
   * @example
   *      [{'deltaKTrans', 'rcb'}, {'vE', 'tumorSize}]
   *
   * @property chartAxes {Object[]}
   */
  configs: Object[];
  
  constructor() {
    // TODO - get this from a user config on a per-user basis.
    this.configs = [
      {x: 'deltaKTrans', y: 'rcb'},
      {x: 'deltaKTrans', y: 'rcb'}
    ];
  }
}
