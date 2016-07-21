import {
  Component, Input, ViewContainerRef, Renderer, AfterViewInit
} from '@angular/core';
import d3 from 'd3';

@Component({
  selector: 'qi-scatter-chart',
  templateUrl: '/public/html/visualization/scatter-chart.html'
})

/**
 * The d3 scatter chart component
 *
 * @module visualization
 * @class ScatterChartComponent
 */
export class ScatterChartComponent implements AfterViewInit {
  @Input() data;
  
  /**
   * The d3 container element.
   *
   * @property container
   */
  private container: any;

  constructor(private renderer: Renderer,
              private viewContainerRef: ViewContainerRef): {}
  
  ngAfterViewInit() {
    let elt = this.viewContainerRef.element.nativeElement;
    let graph = d3.select(elt);
    this.container = graph.select('div');
  }
  
  render() {
    if (!this.data) { return; }
    this.container.data(this.data);
  }
}
