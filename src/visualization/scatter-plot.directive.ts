import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, OnInit
} from '@angular/core';

@Directive({
  selector: '[qi-scatter-plot]'
})

/**
 * Draws a D3 scatter plot.
 *
 * @class ScatterPlotDirective
 */
export class ScatterPlotDirective implements OnChanges, OnInit {
  /**
   * The data object array.
   *
   * @property data {Object[]}
   */
  @Input() data;

  /**
   * The {margin, x, y} configuration, where:
   * * _margin_ is the plot margin within this directive's view
   * * _x_ is the x {#crossLink "Axis"}}{{/crossLink}}
   * * _y_ is the y {#crossLink "Axis"}}{{/crossLink}}
   *
   * @property config {Object}
   */
  @Input() config;

  /**
   * The D3 SVG canvas element.
   *
   * @property canvas {d3.Selection<any>}
   */
  private canvas: d3.Selection<any>;

  constructor(elementRef: ElementRef) {
    let margin = config.margin;
    // The plot dimensions.
    let width = config.x.size + (margin * 2);
    let height = config.y.size + (margin * 2);
    // Make the plot SVG canvas.
    let elt = elementRef.nativeElement;
    this.canvas = d3.select(elt).append('svg');
    this.canvas.attr('width', width).attr('height', height);

    // The X axis settings.
    let x = {
      value: config.x.value,
      scale: d3.scale.linear().range([0, width]),
      map: function (d) { return this.scale(this.value(d)); },
      orientation: config.x.orientation || 'bottom'
    };
    // Set the X domain.
    this.addDomain(x.scale, x.value, this.data);
    // The X axis.
    x.axis = d3.svg.axis().scale(x.scale).orient(x.orientation);

    // The Y axis settings.
    let y = {
      value: config.y.value,
      scale: d3.scale.linear().range([0, height]),
      map: function (d) { return this.scale(this.value(d)); },
      orientation: config.y.orientation || 'left'
    };
    // Set the Y domain.
    this.addDomain(y.scale, y.value, this.data);
    // The Y axis.
    y.axis = d3.svg.axis().scale(y.scale).orient(y.orientation);

    // The conventional d3 color chooser.
    let color = d3.scale.category10();
    // The plot group container.
    this.canvas.append("g")
      .attr('transform', `translate(${ margin }, ${ margin })`);
    // Draw the data points.
    this.canvas.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 3.5)
      .attr("cx", x.map)
      .attr("cy", y.map)
      .style("fill", (d) => color(cValue(d)));
  }

  /**
   * Sets the given axis scale domain. The domain min and max
   * are padded by `max - min / data.length`, i.e. the average
   * separation between tick marks, in order to move the data
   * points off of the orthogonal axis.
   *
   * @method addDomain
   * @private
   * @param scale {d3.Scale} the d3 scale
   * @param data {Object[]} the plot data
   * @param value {ValueAccessor} the data point value accessor
   */
  private addDomain(scale, data, value) {
    let min = d3.min(data, value);
    let max = d3.max(data, value);
    let extent = max - min;
    let pad = extent / data.length;
    scale.domain(min - pad, max + pad);
  }

  ngOnChanges(changes: SimpleChange) {
    //this.render(this.data);
  }

  ngOnInit() {
    //this.render(this.data);
  }
  //
  // private render(data) {
  //   // TODO - build the D3 container here?
  // }
}
