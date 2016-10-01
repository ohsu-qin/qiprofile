import * as _ from 'lodash';
import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange
} from '@angular/core';

@Directive({
  selector: '[qi-scatter-plot]'
})

/**
 * Draws a D3 scatter plot. The
 * {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
 * input, optionally filtered by the
 * {{#crossLink "ScatterPlotDirective/selection:property"}}{{/crossLink}},
 * is the domain used to acquire the
 * {{#crossLink "ScatterPlotDirective/x:property"}}{{/crossLink}}
 * and
 * {{#crossLink "ScatterPlotDirective/y:property"}}{{/crossLink}},
 * data points. The axis labels are determined by the
 * {{#crossLink "ConfigurationService/getLabel"}}{{/crossLink}} function
 * called on the respective accessor property name.
 *
 * @module visualization
 * @class ScatterPlotDirective
 */
export class ScatterPlotDirective implements OnChanges, OnInit {
  /**
   * The data object array.
   *
   * @property data {Object[]}
   */
  @Input() data: Object[];

  /**
   * The optional selection function filters the data domain. The default
   * is to use all of the data objects. Missing inputs are always ignored.
   *
   * @property selection {function}
   */
  @Input() selection: (input: Object) => boolean;

  /**
   * The required X value property name or path.
   *
   * @property x {string}
   */
  @Input() x: string;

  /**
   * The required Y value property name or path.
   *
   * @property y {string}
   */
  @Input() y: string;

  /**
   * The optional axis callback function.
   *
   * @property axis {function}
   */
  @Input() axis: Function;

  /**
   * The optional property name or path whose value determines the data point
   * (color, opacity) assignment. A data point is assigned a color and opacity
   * based on the result of calling the color function. Distinct data points
   * are assigned the same (color, opacity) combination if and only if applying
   * the color function returns the same color value.
   *
   * The default color function is the zero-based position of the input object in
   * the {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * array.
   *
   * @property color {string}
   */
  @Input() color: string;

  /**
   * The optional chart width. The default width is the parent
   * element width.
   *
   * @property width {number}
   */
  @Input() width;

  /**
   * The optional chart height. The default height is the
   * {{#crossLink "ScatterPlotDirective/width:property"}}{{/crossLink}}
   * times the
   * {{#crossLink "ScatterPlotDirective/aspect:property"}}{{/crossLink}}.
   *
   * @property height {number}
   */
  @Input() height;

  /**
   * The optional chart width:height ratio. The default is 1.
   *
   * @property height {number}
   */
  @Input() aspect;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   */
  private svg: d3.Selection<any>;

  /**
   * The data point X cooordinate function.
   *
   * @property cx {function}
   */
  private cx: (d: Object) => number;

  /**
   * The data point Y cooordinate function.
   *
   * @property cy {function}
   */
  private cy: (d: Object) => number;

  constructor(private elementRef: ElementRef) {
  }

  /**
   * Handle the following changes:
   * * If the
   *   {{#crossLink "ScatterPlotDirective/selection:property"}}{{/crossLink}}
   *   changed, then reset the visibility.
   * * If the
   *   {{#crossLink "ScatterPlotDirective/x:property"}}{{/crossLink}} or
   *   {{#crossLink "ScatterPlotDirective/y:property"}}{{/crossLink}}
   *   property changed, then reset the data point coordinates.
   */
  ngOnChanges(changes: SimpleChange) {
    let dataChange = changes['data'];
    if (dataChange && dataChange.previousValue && !dataChange.isFirstChange()) {
      throw new Error("Scatter plot domain data cannot be changed");
    }
    let heightChange = changes['height'];
    if (heightChange && heightChange.previousValue && !heightChange.isFirstChange()) {
      throw new Error("Scatter plot height cannot be changed");
    }
    if ((dataChange || heightChange) && this.data) {
      // Lazy chart initialization.
      this.createChart();
    }

    // Detect a real change.
    let isChanged = (key) =>
      changes[key] && !changes[key].isFirstChange();

    if (isChanged('selection')) {
      // Reset the visibility.
      this.svg.selectAll('circle')
        .transition()
        .duration(500)
        .style('visibility', this.visibility);
    }

    if (isChanged('x') || isChanged('y')) {
      // Reset the scale domains.
      this.xScale.domain(this.getDomain(this.xValue));
      this.yScale.domain(this.getDomain(this.yValue));
      // Reset the data points.
      this.svg.selectAll('circle')
        .transition()
        .duration(500)
        .ease()
        .attr('cx', this.cx)
        .attr('cy', this.cy);
    }
  }

  /**
   * Makes the D3 SVG root group element and draws the plot.
   */
  private createChart() {
    // The effective width and height.
    // Note: svg, as a replaced element, has a browser-dependent
    // default size, often 300px wide by 150px tall. A better
    // default size is based on the width as described in the height
    // property apidoc.
    let defWidth = this.elementRef.nativeElement.clientWidth;
    let width = this.width || defWidth;
    let aspect = this.aspect || 1;
    let defHeight = Math.floor(width / aspect);
    let height = this.height || defHeight;

    // The value accessors.
    this.xValue = d => _.get(d, this.x);
    this.yValue = d => _.get(d, this.y);

    // The scales.
    const pad = 40;
    // d3 clips the right-most X tick, so pad out
    // the X scale an additional 6 pixels.
    const xPad = pad + 6;
    this.xScale = d3.scaleLinear()
      .domain(this.getDomain(this.xValue))
      .nice()
      .range([0, width - xPad]);
    this.yScale = d3.scaleLinear()
      .domain(this.getDomain(this.yValue))
      .nice()
      .range([height - pad, 0]);

    // The data point coordinate functions.
    this.cx = _.flow(this.xValue, this.xScale);
    this.cy = _.flow(this.yValue, this.yScale);

    // The axes.
    let xAxis = d3.axisBottom(this.xScale);
    let yAxis = d3.axisLeft(this.yScale);
    if (this.axis) {
      this.axis(this.x, xAxis);
      this.axis(this.y, yAxis);
    }

    // The selection function filters whether to show a data point.
    let isSelected = i => this.selection ? this.selection[i] : true;

    // The visibility chooser maps the input to the CSS visibility state.
    let hasDataPoint = (d) =>
      _.isFinite(this.xValue(d)) && _.isFinite(this.yValue(d));
    let isVisible = (d, i) => isSelected(i) && hasDataPoint(d);
    this.visibility = (d, i) => isVisible(d, i) ? 'visibile' : 'hidden';

    // The color index function maps the input to a color reference value.
    // The default index function assigns each object to its position in
    // the data array.
    const DEF_COLOR_INDEX = (d, i) => i;
    let colorIndex = this.color ?
                     d => _.get(d, this.color) :
                     DEF_COLOR_INDEX;

    // The color chooser maps the input to a RGB color.
    // First, group the objects by the color index mod the color count.
    let colorDomain = _.flow(_.map, _.uniq, _.sortBy)(this.data, colorIndex);
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(colorDomain);
    let color = _.flow(colorIndex, colorScale);

    // The opacity chooser maps the input to an opacity from 1.0 to 0.5.
    let opacityValue = (d, i) =>
      Math.floor(colorDomain.indexOf(colorIndex(d, i)) / 10);
    let opacityMax = Math.floor(_.last(colorDomain) / 10);
    let opacityDomain = [0, opacityMax];
    let opacityScale = d3.scaleLinear()
      .domain(opacityDomain)
      .range([0, 0.5]);
    // Convert to [1, 0.5] range.
    let inverse = (o) => 1 - o;
    let opacity = _.flow(opacityValue, opacityScale, inverse);

    // The root SVG group element.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('class', 'scatter-plot')
      .attr('viewBox', `0 0 ${ width } ${ height }`)
      .attr('width', width)
      .attr('height', height);

    // Draw the axes.
    this.svg.append('g')
      .attr('transform', `translate(${ pad },${ height - 40 })`)
      .attr('class', 'axis')
      .attr('class', 'x')
      .call(xAxis);
    this.svg.append('g')
      .attr('transform', `translate(${ pad },0)`)
      .attr('class', 'axis')
      .attr('class', 'y')
      .call(yAxis);

    // Draw the data points.
    this.svg.append('g')
      .attr('transform', `translate(${ pad },0)`)
      .attr('class', 'plot')
      .selectAll('circle')
      .data(this.data)
      .enter().append('circle')
        .style('visibility', this.visibility)
        .style('fill', color)
        .style('opacity', opacity)
        .attr('r', 4)
        .attr('cx', this.cx)
        .attr('cy', this.cy);
  }

  /**
   * Determines the continuous [min, max] domain for the
   * given value function applied over the
   * {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * input.
   *
   * @method getDomain
   * @param value {function} the input => value function
   * @return the [min, max] domain
   */
  private getDomain(value) {
    let values = this.data.map(value);
    let min = _.min(values);
    let max = _.max(values);
    // d3.nice doesn't pad out an integer domain,
    // so do that here.
    if (min === Math.floor(min)) {
      min--;
    }
    if (max === Math.ceil(max)) {
      max++;
    }

    return [min, max];
  }
}
