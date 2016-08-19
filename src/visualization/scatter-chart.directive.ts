/**
 * The D3 charting module.
 *
 * @module visualization
 */

import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, AfterViewInit
} from '@angular/core';
import * as d3 from 'd3';

@Directive({
  selector: '[qi-scatter]'
})

/**
 * The d3 scatter chart directive
 *
 * @class ScatterChartDirective
 */
export class ScatterChartDirective implements OnChanges, AfterViewInit {
  /**
   * The data object array.
   *
   * @property data {Object[]}
   */
  @Input() data;

  /**
   * The {#crossLink "Axis"}}{{/crossLink}} {x, y} axis settings
   *
   * @property axes {Object}
   */
  @Input() config;
  
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
    // TODO - build the d3 container.
  }
  
  render(newValue) {
    if (!newValue) { return; }
    // TODO
  }
}
