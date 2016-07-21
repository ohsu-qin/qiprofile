import { Component, Input } from '@angular/core';

import { ScatterChartComponent } from '../visualization/scatter-chart.component.ts';

@Component({
  selector: 'qi-collection-correlation',
  templateUrl: '/public/html/collection/collection-correlation.html',
  directives: [ScatterChartComponent]
})

/**
 * The Collection Detail correlation component
 *
 * @module collection-correlation
 * @class CollectionCorrelationComponent
 */
export class CollectionCorrelationComponent implements AfterViewInit {
  @Input() subjects;
  
  data: Array<number>;
   
  constructor() {
    this.data = [];
  }
}
