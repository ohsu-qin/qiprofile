import * as _ from 'lodash';
import * as _s from 'underscore.string';
import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, OnInit
} from '@angular/core';

@Directive({
  selector: '[qi-spark-line]'
})

/**
 * Draws a D3 spark line which plots a uniform sequential
 * one-based index vs values. The X values are the discrete
 * one-based
 * {{#crossLink "SparkLineDirective/data:property"}}{{/crossLink}}
 * indexes. The
 * {{#crossLink "SparkLineDirective/data:property"}}{{/crossLink}}
 * items are the Y axis data points.
 *
 * @class SparkLineDirective
 */
export class SparkLineDirective implements OnChanges, OnInit {
  /**
   * The data objects. The data can be either an input array for
   * a single data series or a {_key_: array, ...} for one or
   * more data series, where _key_ is the data series designator.
   *
   * @property data {Object|Object[]}
   */
  @Input() data: Object|Object[];

  /**
   * The [min, max] domain extent.
   * The default is the data min and max.
   *
   * @property domain {number[]}
   */
  @Input() domain: number[];

  /**
   * The optional X value access property name or
   * property path. The default is to input data
   * point index.
   *
   * @property x {string}
   */
  @Input() x: any;

  /**
   * The optional Y value accessor property name or
   * property path. The default is to use the input
   * data directly.
   *
   * @property y {string}
   */
  @Input() y: any;

  /**
   * The optional additional data access argument.
   *
   * @property extra {any}
   */
  @Input() extra: any;

  /**
   * The optional domain arrays, used as folows:
   * * If the input is an array of two items, then the
   *   Y domain is that input.
   * * Otherwise, if the input is a {x, y} object, e.g.
   * `{x: [0, 12], y: [1, 100]}`, then the X and Y domains
   * are the respective property values.
   *
   * The default X or Y domain is the respective mapped data
   * min and max.
   *
   * @property domain {any}
   */
  @Input() domain: any;

  /**
   * The line width.
   *
   * @property width {number}
   */
  @Input() width;

  /**
   * The line height.
   *
   * @property height {number}
   */
  @Input() height;

  /**
   * A flag indicating whether to draw a dotted
   * vertical guide line in the middle of the
   * spark line.
   *
   * @property guide {boolean}
   */
  @Input() guide;

  /**
   * The optional {_key_: _label_} legend, where _key_ is the
   * data series designator. The default for a single series is
   * no legend, otherwise the default is the capitalized data key.
   *
   * @property legend {Object}
   */
  @Input() legend;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   */
  private svg: d3.Selection<any>;

  /**
   * The D3 line.
   *
   * @property line {d3.Line<number, number>}
   */
  private line: d3.Line<number, number>;

  constructor(private elementRef: ElementRef) {
  }

  /**
   * Makes the D3 SVG root group element and draws the plot.
   */
  ngOnInit() {
    // Convert simple array input to a {series: data} specification.
    let dataSpec = _.isArray(this.data) ? {series: this.data} : this.data;
    let keys = _.keys(dataSpec);
    let values = _.values(dataSpec);
    // Convert the {*series*: *values*, ...} data spec to a
    // [{id: *series*, values: values}, ...] array.
    let addItem = (accum, v, k) => accum.push({id: k, values: v});
    let data = _.transform(dataSpec, addItem, []);

    // Make a default legend for multiple data series.
    let legendSpec = this.legend;
    if (!legendSpec && keys.length > 1) {
      let addLegend = (accum, v) => { accum[v] = _s.capitalize(v); };
      legendSpec = _.transform(keys, addLegend, {});
    }
    let legend;
    if (legendSpec) {
      let addLabel = (accum, v, k) => accum.push({id: k, value: v});
      legend = _.transform(legendSpec, addLabel, []);
    }

    // The value accessors.
    let xValue = _.isNil(this.x) ? (d, i) => i : this.valueFunction(this.x);
    let yValue = _.isNil(this.y) ? _.identity : this.valueFunction(this.y);

    // The domains.
    let xDomain;
    let yDomain;
    if (this.domain) {
      if (_.isArray(this.domain)) {
        yDomain = this.domain;
      } else {
        xDomain = this.domain.x;
        yDomain = this.domain.y;
      }
    }
    if (!xDomain) {
      xDomain = [
        d3.min(values, (v) => d3.min(v, xValue)),
        d3.max(values, (v) => d3.max(v, xValue))
      ];
    }
    if (!yDomain) {
      yDomain = [
        d3.min(values, (v) => d3.min(v, yValue)),
        d3.max(values, (v) => d3.max(v, yValue))
      ];
    }

    // Account for the legend in the plot height.
    let plotHeight = this.height;
    if (legend) {
      plotHeight -= 12;
    }

    // The scales.
    let x = d3.scaleLinear()
      .domain(xDomain)
      .range([0, this.width]);
    let y = d3.scaleLinear()
      .domain(yDomain)
      .range([plotHeight, 0]);

    // The line to plot.
    this.line = d3.line()
      .curve(d3.curveMonotoneX)
      .defined(d => !_.isNil(d))
      .x(_.flowRight(x, xValue))
      .y(_.flowRight(y, yValue));

    // The root SVG group element.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('class', 'spark-line')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    // The optional guide.
    if (this.guide) {
      let midPoint = Math.floor(this.width / 2);
      this.svg.append('line')
        .attr('class', 'guide')
        .attr('x1', midPoint)
        .attr('y1', 0)
        .attr('x2', midPoint)
        .attr('y2', plotHeight);
    }

    // The optional legend.
    if (legend) {
      // Partition the width among the legend labels.
      let halfWidth = Math.floor(this.width / (2 * legend.length));
      // The label index => X offset function.
      let labelX = i => ((2 * i) + 1) * halfWidth;
      this.svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(0, ${ this.height })`)
        .selectAll('text')
        .data(legend)
        .enter().append('text')
          .attr('class', (d => d.id))
          .attr('text-anchor', 'middle')
          .attr('transform', (d, i) => `translate(${ labelX(i) }, 0)`)
          .text(d => d.value);
    }

    // Make the lines.
    this.svg.append('g')
      .attr('class', 'plot')
      .selectAll('path')
      .data(data)
      .enter().append('path')
        .attr('class', d => d.id)
        .attr('d', d => this.line(d.values));
  }

  /**
   * Handle the following changes:
   * * If the data changed, then reset the line data, which will
   *   induce d3 to replot the line.
   *
   * _Note_: the other inputs are for initialization only, and
   * changes to them are ignored. For example, resizing the window
   * resets the width input, but that is ignored. Handling a resize
   * necessitates detaching and recreating the entire plot, which
   * results in a DOM memory leak.
   */
  ngOnChanges(changes: SimpleChange) {
    let dataChange = changes['data'];
    if (dataChange && !dataChange.isFirstChange()) {
      // Draw the new values.
      let input = dataChange.currentValue;
      let data = _.isArray(input) ? {series: input} : input;
      for (let key in data) {
        this.svg.select(`path.${ key }`)
          .attr('d', this.line(data[key]));
      }
    }
  }

  private valueFunction(definition: string|number|Function) {
    if (_.isString(definition)) {
      return _.partialRight(_.get, definition);
    } else if (_.isNumber(definition)) {
      return _.constant(definition);
    } else if (this.extra) {
      return (d) => definition(d, extra);
    } else {
      return definition;
    }
  }
}
