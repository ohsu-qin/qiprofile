import * as _ from 'lodash';
import { Component, Input, OnInit } from '@angular/core';

import { ScatterChartDirective } from '../visualization/scatter-chart.directive.ts';

@Component({
  selector: 'qi-collection-correlation',
  templateUrl: '/public/html/collection/collection-correlation.html',
  directives: [ScatterChartDirective]
})

/**
 * The Collection Detail correlation component
 *
 * @module collection-correlation
 * @class CollectionCorrelationComponent
 */
export class CollectionCorrelationComponent implements OnInit {
  @Input() subjects;
  @Input() config;
  
  data: Array<number>;
  
  /**
   * Makes the data accessors.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    this.data = _.map(this.subjects, 'number');
  }
}
