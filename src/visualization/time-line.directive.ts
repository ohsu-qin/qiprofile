import * as _ from 'lodash';
import * as _s from 'underscore.string';
import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, OnInit
} from '@angular/core';

//import SYMBOL_TYPES from './symbol-types.ts';

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
   * Makes the D3 SVG root group element and draws the line.
   */
  ngOnInit() {
    // Add the data series specification to the given accumulator.
    let accumSpec = (accum, pair, i) => {
      let [key, data] = pair;
      let spec = {
        data: data,
        value: _.get(this.value, key) || _.identity,
        index: i
      };
      accum[key] = spec;
    };
    // The sorted [key, data] pairs.
    let sorted = _.toPairs(this.data).sort(_.first);
    // Collects the {datum, dataSeries} data objects.
    let accumData = (accum, pair, i) => {
      let [key, data] = pair;
      let seriesValue = _.get(this.value, key) || _.identity;
      let dataSeries = {
        key: key,
        value: seriesValue,
        index: i
      };
      let toDataPoint = d => {
        return {datum: d, dataSeries: dataSeries};
      };
      let seriesData = data.map(toDataPoint);
      return accum.concat(seriesData);
    };
    // The flattened data points.
    let dataPoints = sorted.reduce(accumData, []);
    // The X value accessor delegates to the data series.
    let xValue = d => d.dataSeries.value(d);
    // The [min, max] X domain.
    let xDomain = [
      d3.min(dataPoints, xValue),
      d3.max(dataPoints, xValue)
    ];
    // The Y value is always zero.
    let yValue = _.constant(0);
    let yDomain = [0, 0];

    // The line to plot.
    this.line = d3.line()
      .defined(d => !_.isNil(xValue(d)))
      .x(xValue)
      .y(yValue);

    // The root SVG group element.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('class', 'spark-line')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    // The line element.
    this.svg.append('g')
      .attr('class', 'plot')
      .select('path')
      .data(dataPoints)
      .enter().append('path')
        .attr('d', d => this.line(d));

    // TODO - Make the legend.

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
      let data = dataChange.currentValue;
      this.svg.select('path')
        .attr('d', this.line(data));
    }
  }
}
