import {
  Directive, ElementRef, OnChanges, SimpleChange, AfterViewInit
} from '@angular/core';
import * as d3 from 'd3';

@Directive({
  selector: 'qi-scatter-chart',
  inputs: ['data']
})

/**
 * The d3 scatter chart component
 *
 * @module visualization
 * @class ScatterChartComponent
 */
export class ScatterChartComponent implements OnChanges, AfterViewInit {
  /**
   * The d3 root element.
   *
   * @property root
   */
  private root: d3.Selection<any>;

  constructor(elementRef: ElementRef) {
    let elt = elementRef.nativeElement;
    this.root = d3.select(elt);
  }
  
  ngOnChanges(changes: SimpleChange) {
    this.render(this.data);
  }
  
  ngAfterViewInit() {
    this.data;
    // TODO - build the d3 container.
  }
  
  render(newValue) {
    if (!newValue) { return; }
    // TODO
  }
}
