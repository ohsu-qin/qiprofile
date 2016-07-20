import {
  Component, Input, ViewContainerRef, Renderer, AfterViewInit
} from '@angular/core';
import * as d3 from 'd3/d3';

@Component({
  selector: 'qi-scatter-chart',
  template: `div`
})

/**
 * The d3 scatter chart component
 *
 * @module common
 * @class ScatterChartComponent
 */
export class ScatterChartComponent implements AfterViewInit {
  @Input() subjects;
  
  constructor(
    private renderer: Renderer,
    private viewContainerRef: ViewContainerRef
  ) {}
  
  ngAfterViewInit() {
    let elt = this.viewContainerRef.element.nativeElement;
    let graph = d3.select(elt);
    this.divs = graph
      .append('div')
      .attr('class', 'chart')
      .selectAll('div')
  }
  
  render(data: Object): {
    if (!data) return;
    this.divs.data(data)
      .enter()
      .append('div')
      .transition()
      .ease('elastic')
      .style('width', d => d + '%')
      .text(d => d + '%')
  }
}
