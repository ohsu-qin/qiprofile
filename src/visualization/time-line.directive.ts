import * as _ from 'lodash';
import * as _s from 'underscore.string';
import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, OnInit
} from '@angular/core';

import DateHelper from '../date/date-helper.coffee';
import SYMBOL_TYPES from './symbol-types.ts';

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
   * The required data series {_key_: _data_} data properties.
   * The _data_ is an array of data objects. This property is
   * customarily bound in a template to a parent component
   * property.
   *
   * @property data {Object}
   */
  @Input() data: Object;

  /**
   * The {_key_: _property_} data series value accessors, where _key_
   * is the
   * {{#crossLink "TimeLineDirective/data:property"}}{{/crossLink}}
   * series key and _property_ is the corresponding value access
   * date property name or path. The default accessor is the identity
   * function.
   *
   * @property value {Object}
   */
  @Input() value: string;

  /**
   * The line width.
   *
   * @property width {number}
   */
  @Input() width: number;

  /**
   * Flag indicating whether to draw the X axis
   * with date ticks for each X value (default false).
   *
   * @property axis {boolean}
   */
  @Input() axis: boolean = false;

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
      .attr('height', 20)
      .append('g');
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
    // Make the series value accessor functions.
    let seriesAccessor = (data, key) => {
      // The (possibly undefined) series value function.
      // The result might be a moment, which will need to
      // be converted to a JavaScript date.
      let base = _.get(this.value, key);
      // Delegate to the base function, if defined,
      // otherwise default to the input data object
      // itself.
      if (base) {
        let unconverted = d => _.get(d, base);
        return _.flow(unconverted, DateHelper.toDate);
      } else {
        return DateHelper.toDate;
      }
    };
    // The series value access functions.
    let seriesAccessors = _.mapValues(this.data, seriesAccessor);

    // The common [min, max] domain over all points.
    let bounds;
    let accumBounds = (data, series) => {
      let accessor = seriesAccessors[series];
      let values = data.map(accessor);
      let seriesMin = _.min(values);
      let seriesMax = _.max(values);
      if (bounds) {
        bounds[0] = Math.min(bounds[0], seriesMin);
        bounds[1] = Math.max(bounds[0], seriesMax);
      } else {
        bounds = [seriesMin, seriesMax];
      }
    }
    _.forEach(this.data, accumBounds);

    // The data series X scale.
    this.scale = d3.scaleTime()
      .domain(bounds)
      .range([0, this.width]);

    // The Y value is always zero.
    let zero = _.constant(0);

    // The line generator function depends on the series key.
    let line = key => {
      // Convert the value to a date.
      let xValue = seriesAccessors[key];

      // The X display coordinate function.
      // Note: we can't use _.flow(xValue, xScale) here
      // since that returns NaN, possibly due to a
      // secondary function parameter side-effect.
      let x = v => this.scale(xValue(v));

      // The filter for whether to plot the point.
      let isDefined = d => !_.isNil(xValue(d));
      // The d3 line function.
      let line = d3.line()
        .defined(isDefined)
        .x(x)
        .y(zero);

      return line;
    };

    // Convert the series data instance variable to a
    // {id, data} array sorted by the series id.
    let accumSeries = (accum, v, k) => {
      accum.push({id: k, data: v});
    };
    let seriesUnsorted = _.transform(this.data, accumSeries, []);
    let seriesData = _.sortBy(seriesUnsorted, 'id');

    // The line function makes a d3 line function.
    // Calling this line function makes the path
    // d attribute points value.
    let seriesPoints = series => {
      let x = line(series.id)(series.data);
      return x;
    }

    // The data series line elements.
    let seriesSelection = this.svg.append('g')
      .attr('class', 'plot')
      .selectAll('.series')
      .data(seriesData)
      .enter().append('g')
        .attr('class', d => `series ${ d.id }`)
        .append('path')
          .attr('class', 'line')
          .attr('d', seriesPoints);

    // Draw the axis.
    if (this.axis) {
      this.drawAxis();
    }




    // TODO - First, cut this comment, merge to master and push.
    // Then, undo or paste the cut. Then, add symbols.
    // In parent, add treatment pseudo-series with
    // two data points each (start and end). Set
    // symbol for session and treatment to null.
    // Add output to emit {svg, scale}.
    // Make treatment color-bars directly under
    // the time line. Add session numbers directly
    // above the time line.





    // TODO - Make the legend.

  }

  private drawAxis() {
    let axis = d3.axisBottom(this.scale);
    // Date ticks are formatted as mm/dd/yyyy.
    axis.tickFormat(d3.timeFormat('%m/%d/%Y'));
    // Make the tick element.
    this.svg.append('g')
      .attr('class', 'axis x')
      .call(axis);
  }
}
