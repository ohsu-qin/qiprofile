import * as _ from 'lodash';
import * as _s from 'underscore.string';
import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, OnInit
} from '@angular/core';

import DateHelper from '../date/date-helper.coffee';
import * as math from '../math/math.ts';

/**
 * The default representation of a time line point is the HTML
 * nabla special character (the wedge-like math del operator).
 *
 * @property WEDGE {string}
 * @private
 * @static
 */
const WEDGE = '\u2207';

@Directive({selector: '[qi-time-line]'})

/**
 * Draws a horizontal D3 line which plots event data by time.
 * The events are heterogenous date-valued data series. Each
 * data series is plotted with a different symbol on the line.
 *
 * @example
 *     <qi-timeline [data]="{hurricane: hurricanes, tornado: tornadoes}"
 *     <qi-timeline [value]="{hurricane: 'start', tornado: 'date'}"
 *
 * @class TimeLineDirective
 */
export class TimeLineDirective implements OnChanges, OnInit {
  /**
   * The array of input data objects. This property is
   * customarily bound in a template to a parent component
   * property.
   *
   * @property data {Object[]}
   */
  @Input() data: Object[];

  /**
   * The optional array of data objects which are included
   * in determining the X axis domain but are not displayed.
   *
   * @property extra {Object[]}
   */
  @Input() extra: Object[];

  /**
   * The value access date property name or path.
   * The default accessor is the identity function.
   *
   * @property value {Object}
   */
  @Input() value: string;

  /**
   * The optional datum => inner text function.
   * The default text is a wedge character.
   *
   * @property text {function}
   */
  @Input() text: (Object) => string;

  /**
   * The optional datum => CSS class function.
   *
   * @property cssClass {function}
   */
  @Input() cssClass: (Object) => string;

  /**
   * The line width.
   *
   * @property width {number}
   */
  @Input() width: number;

  /**
   * Flag indicating whether to draw the X axis
   * with date ticks as follows:
   * * nil or boolean `false` => no axis (default)
   * * boolean `true` => tick marks for each X value
   * * string `bounds` => earliest and latest tick marks only
   *
   * @property axis {boolean|string}
   */
  @Input() axis = false;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   */
  private svg: d3.Selection<any>;

  constructor(private elementRef: ElementRef) {
  }

  /**
   * Makes the D3 SVG root group element and draws the line.
   */
  ngOnInit() {
    // The root SVG group element.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('class', 'time-line')
      .attr('width', this.width)
      .attr('height', 48);
  }

  /**
   * If the
   * {{#crossLink "SparkLineDirective/data:property"}}{{/crossLink}}
   * changed, then reset the line data, which will induce d3 to
   * replot the line.
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
      this.draw();
    }
  }

  /**
   * Draws the time line.
   */
  private draw() {
    // A text line is roughly 20 pixels high.
    const lineHeight = 20;
    // A small spacing pad.
    const pad = 2;
    // The plot width offset.
    const margin = 30;
    // Delegate to the value property getter, if defined,
    // otherwise default to the input data object itself.
    // The value might be a moment, which will need to
    // be converted to a JavaScript date.
    let xValue;
    if (this.value) {
      let unconverted = d => _.get(d, this.value);
      xValue = _.flow(unconverted, DateHelper.toDate);
    } else {
      xValue = DateHelper.toDate;
    }
    // The date values.
    let domainValues = this.data.map(xValue);
    // If there are extra values, then those also go into
    // making the domain.
    if (this.extra) {
      domainValues = domainValues.concat(this.extra);
    }
    // The [min, max] domain.
    let domain = math.bounds(domainValues);

    // The date scale.
    // Logically, the range should be shrunk by the same
    // margin on both sides. However, that setting trunctates
    // the right tick value. Doubling the right margin works,
    // although it is unknown why that is necessary.
    let scale = d3.scaleTime()
      .domain(domain)
      .range([margin, this.width - (2 * margin)]);

    // The filter for whether to plot the point.
    let isDefined = d => !_.isNil(xValue(d));
    // The data point X coordinate function.
    let dx = _.flow(xValue, scale);
    // The text function.
    let text = this.text || WEDGE;
    // The class function.
    let klass;
    if (this.cssClass) {
      klass = (d, i) => `point ${ this.cssClass(d, i) }`;
    } else {
      klass = 'point';
    }

    // The data series line elements.
    let selection = this.svg.append('g')
      .attr('class', 'plot')
      .selectAll('.point')
      .data(this.data)
      .enter().append('text')
        .attr('class', klass)
        .attr('x', dx)
        .attr('dx', lineHeight)
        .attr('y', lineHeight + pad)
        .text(text);

    // If the axis flag is set, then draw the axis.
    if (this.axis) {
      let axis = d3.axisBottom(scale);
      // Date ticks are formatted as mm/dd/yyyy.
      axis.tickFormat(d3.timeFormat('%m/%d/%Y'));
      // The bounds axis only adds tick marks at the
      // start and end of the time line.
      if (this.axis === 'bounds') {
        axis.tickValues(domain);
      }
      // Draw the axis.
      let axisOffset = {x: lineHeight, y: lineHeight + (2 * pad)};
      this.svg.append('g')
        .attr('class', 'axis x')
        .attr('transform', `translate(${ axisOffset.x },${ axisOffset.y })`)
        .call(axis);
    }

    // TODO - Make treatment color-bars directly under
    // the time line.

    // TODO - Make the legend.
    if (this.legend) {

    }
  }
}
