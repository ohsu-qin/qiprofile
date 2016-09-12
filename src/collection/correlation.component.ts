import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-collection-correlation',
  templateUrl: '/public/html/collection/correlation.html'
})

/**
 * The Collection Detail correlation component
 *
 * @class CollectionCorrelationComponent
 */
export class CollectionCorrelationComponent {
  /**
   * The {{#crossLink "Subject"}}{{/crossLink}} REST data objects.
   *
   * @property subjects {Object[]}
   */
  @Input() subjects: Object[];

  /**
   * The plot configuration [{x, y}, ...] specification objects.
   * Each specification contains the following properties:
   *
   * * _x_: the X axis data accessor property name
   * * _y_: the Y axis data accessor property name
   *
   * There is one specification object per chart.
   *
   * @example
   *      [{x: 'deltaKTrans', y: 'rcb'}, {x: 'vE', y: 'tumorSize}]
   *
   * @property config {Object[]}
   */
  @Input() config: Object[];

  /**
   * The
   * {{#crossLink "CollectionCorrelationComponent/subjects:property"}}{{/crossLink}}
   * subset selected for display.
   *
   * @property selection {Object[]}
   * @private
   */
  //private selection: Object[];
}
