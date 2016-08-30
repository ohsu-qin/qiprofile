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
 * Draws a D3 scatter plot.
 *
 * @class ScatterPlotDirective
 */
export class ScatterPlotDirective implements OnChanges, AfterViewInit {
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
    let svg = this.root.append('svg');
    svg.attr('width', width).attr('height', height);

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
