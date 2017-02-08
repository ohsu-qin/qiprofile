import * as _ from 'lodash';
import * as _s from 'underscore.string';
import * as d3 from 'd3';
import { Directive, Input, ElementRef, OnInit, DoCheck } from '@angular/core';

import StringHelper from '../string/string-helper.coffee';
import DateHelper from '../date/date-helper.coffee';
import * as math from '../math/math.ts';

/**
 * The default representation of a time line point is the HTML
 * nabla special character (the wedge-like math del operator).
 *
 * @property WEDGE {string}
 * @static
 */
const WEDGE = '\u2207';

/**
 * Roughly the height and width of a capitalized character.
 *
 * @property CHAR_SIZE {number}
 * @private
 * @static
 */
private const CHAR_SIZE = 12;

/**
 *  A small spacing pad.
 *
 * @property PAD {number}
 * @private
 * @static
 */
private const PAD = 2;

/**
 * The plot horizontal offset is five characters in order
 * to avoid truncating the leftmost and rightmost axis
 * 10-character date labels centered on the minimum and
 * maximum X coordinate, resp.
 *
 * The plot vertical offset is half a character.
 *
 * @property MARGIN {Object0}
 * @private
 * @static
 */
private const MARGIN = {top: 6, left: 30, bottom: 6, right: 30};

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
export class TimeLineDirective implements DoCheck, OnInit {
  /**
   * The required data specification.
   *
   * The specification for a homogeneous data time line is
   * a data object array.
   *
   * The specification for a heterogeneous data time line is a
   * {_key_: data object array} object with a property for
   * each data type _key_.
   *
   * @property data {Object[]|Object}
   */
  @Input() data: Object[] | Object;

  /**
   * The optional value access specification.
   *
   * The specification for a homogeneous data time line is a date
   * property name or path.
   *
   * The specification for a heterogeneous data time line is a
   * {_key_: property} object with a property for each
   * {{#crossLink "TimeLineDirective/data:property"}}{{/crossLink}}
   * _key_.
   *
   * The default accessor is the identity function.
   *
   * @property value {string|Object}
   */
  @Input() value: string | Object;

  /**
   * The optional inner text specification.
   *
   * The specification for a homogeneous data time line is a string
   * or a datum => string function.
   *
   * The specification for a heterogeneous data time line is a
   * {_key_: string|function} object with a property for each
   * {{#crossLink "TimeLineDirective/data:property"}}{{/crossLink}}
   * _key_. The default text is a
   * {{#crossLink "TimeLineDirective/WEDGE:property"}}{{/crossLink}}.
   *
   * @property text {any}
   */
  @Input() text: any;

  /**
   * The required data class specification.
   *
   * The data class specification for a homogeneous data time
   * line is a string or a datum => string function.
   *
   * The data class specification for a heterogeneous data time
   * line is a {_key_: string|function} object with property for each
   * {{#crossLink "TimeLineDirective/data:property"}}{{/crossLink}}
   * _key_.
   *
   * The CSS class is the lower-case dash-separated conversion
   * of the data class, e.g. `turbo-prop` for data class
   * `TurboProp`.
   *
   * @property class {any}
   */
  @Input() class: any;

  /**
   * The optional point data legend {_dataClass_: {label, name}}
   * specification.
   *
   * If the legend is specified, then it is drawn with one line per
   * {{#crossLink "TimeLineDirective/class:property"}}{{/crossLink}}
   * data class. Each legend line consists of a data class
   * label followed by a name. The legend line is styled by the
   * corresponding CSS class.
   *
   * The input legend specifies information for both point and span
   * data classes. There is one legend line per input legend point
   * specification. The legend point *label* is required. The legend
   * point *name* is optional, with default the labelized data class
   * name as specified in
   * {{#crossLink "StringHelper/labelized"}}{{/crossLink}},
   * e.g. `Turbo Prop`* for data class `TurboProp`.
   *
   * The span legend "label" is always a small bar, distinguished by
   * the span CSS class fill color. As with the input legend point,
   * the input legend span name is optional, with default the labelized
   * data class name.
   *
   * If the input legend property value is `false`, then no legend is
   * drawn. Otherwise, the input legend must be a
   * {_dataClass_: {label, name}} object as specified above. In that
   * case, there is one legend line per point data class in the
   * input legend and one legend line per span data class. Note that
   * only the points in the legend input are drawn in a legend line,
   * but every span legend line is drawn.
   *
   * @property legend {boolean|Object}
   */
  @Input() legend: boolean | Object;

  /**
   * The line width.
   *
   * @property width {number}
   */
  @Input() width: number;

  /**
   * The optional tick display flag (default true).
   *
   * If set to `false`, then the axis line is displayed without tick
   * marks or values. Otherwise, the earliest and latest tick marks
   * are displayed.
   *
   * @property ticks {boolean}
   */
  @Input() ticks = true;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   */
  private svg: d3.Selection<any>;

  /**
   * The previous
   * {{#crossLink "TimeLineDirective/data:property"}}{{/crossLink}}
   * value.
   *
   * @property previousData {Object}
   */
  private previousData: Object;

  constructor(private elementRef: ElementRef) {
  }

  /**
   * Makes the D3 SVG root group element and draws the line.
   */
  ngOnInit() {
    // The root SVG group element. The height is computed
    // after the inputs are bound.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('class', 'time-line')
      .attr('width', this.width);
  }

  /**
   * If
   * {{#crossLink "TimeLineDirective/data:property"}}{{/crossLink}}
   * is an object whose property changed, then redraw the time line.
   *
   * _Note_: the other inputs are for initialization only, and changes
   * to those properties are ignored.
   */
  ngDoCheck() {
    // Convert to an object if necessary.
    let currentData = _.isArray(this.data) ? {default: this.data} : this.data;
    if (currentData && !_.every(currentData, _.isEmpty)) {
      let isChanged = (data, key) => data !== this.previousData[key];
      if (!this.previousData || _.some(currentData, isChanged)) {
        this.draw();
      }
      this.previousData = _.clone(currentData);
    }
  }

  /**
   * Draws the time line.
   */
  private draw() {
    //** Data prep **//

    // Convert a simple data array to a {default: data} object.
    let dataSpecs =
      _.isArray(this.data) ? {default: this.data} : this.data;

    // Data spec reference validator.
    let isMissingData = key => !dataSpecs[key];
    // Validate the value input property.
    if (_.isPlainObject(this.value)) {
      let missingData = _.find(_.keys(this.value), isMissingData);
      if (missingData) {
        throw new Error('The time line data property is missing for' +
                        ` the value property ${ missingData }`);
      }
    }
    // Validate the class input property.
    if (_.isPlainObject(this.class)) {
      let missingData = _.find(_.keys(this.class), isMissingData);
      if (missingData) {
        throw new Error('The time line data property is missing for' +
                        ` the class property ${ missingData }`);
      }
      let isMissingClass = key => !this.class[key];
      let missingClass = _.find(_.keys(this.data), isMissingClass);
      if (missingClass) {
        throw new Error('The time line class property is missing for' +
                        ` the data property ${ missingClass }`);
      }
    } else if (_size(dataSpecs) > 1) {
      throw new Error('The time line class property is missing for' +
                      ' the heterogenous data time line');
    }

    // Correlate the data and value inputs.
    // Delegate to the value property getter, if defined,
    // otherwise default to the input data object itself.
    // The value might be a moment, which will need to
    // be converted to a JavaScript date.
    // For a span, the default start and end date is today.
    let spanDate = v => v || DateHelper.TODAY;
    let convertSpanDate = _.flow(spanDate, DateHelper.toDate);
    let convertSpan = span => span.map(convertSpanDate);
    let convert = v => _.isArray(v) ? convertSpan(v) : DateHelper.toDate(v);
    let valueFor = key => {
      let base = _.isPlainObject(this.value) ? this.value[key] : this.value;
      if (base) {
        let getter = _.isFunction(base) ? base : d => _.get(d, base);
        return _.flow(getter, convert);
      } else {
        return DateHelper.toDate;
      }
    };
    let combine = (data, key) => {
      return {data: data, value: valueFor(key)};
    };
    let allSpecs = _.mapValues(dataSpecs, combine);
    // Partition into points and spans.
    let firstValue = spec => {
      for (let d of spec.data) {
        let v = spec.value(d);
        if (v) {
          return v;
        }
      }
    };
    let isSpan = _.flow(firstValue, _.isArray);
    let spanSpecs = _.pickBy(allSpecs, isSpan);
    let pointSpecs = _.omit(allSpecs, _.keys(spanSpecs));

    // Makes the data class function for the given
    // data specification key.
    let dataClassFor = key => {
      if (this.class) {
        let base;
        if (_.isPlainObject(this.class)) {
          base = this.class[key];
        } else {
          base = this.class;
        }
        return _.isFunction(base) ? base : d => _.get(d, base);
      }
    };
    // The CSS classes include the type and the key CSS class.
    let join = _.partial(_s.join, ' ');
    // Makes the data class => CSS classes function
    // for the given point or span type.
    let toCssClassesFunction = type => {
      // Joins the type and data CSS classes.
      let joiner = _.partial(join, type);
      // Return the CSS class function.
      return _.flow(StringHelper.dasherize, joiner);
    };
    let cssClassesFor = (type, dataClass) => {
      return _.flow(dataClass, toCssClassesFunction(type));
    };
    // type is 'point' or 'bar'.
    // spec is an allSpecs member.
    // key is the this.data and allSpecs key.
    let setClassesFor = (type, spec, key) => {
      // The data class function.
      let dataClass = dataClassFor(key);
      if (dataClass) {
        spec.dataClass = dataClassFor(key);
        spec.cssClass = cssClassesFor(type, spec.dataClass);
      }
    };
    let setPointClasses = _.partial(setClassesFor, 'point');
    _.forEach(pointSpecs, setPointClasses);
    let setSpanClasses = _.partial(setClassesFor, 'bar');
    _.forEach(spanSpecs, setSpanClasses);

    // Build the legend items.
    let legendHeight;
    let pointLegends;
    let spanLegends;
    if (this.legend === false) {
      legendHeight = 0;
    } else {
      let flatten = _.flow(_.flatMap, _.sortBy, _.sortedUniq);
      let classesFor = spec => _.map(spec.data, spec.dataClass);
      let spanClasses = flatten(spanSpecs, classesFor);
      let legendFor = dataClass =>
        _.merge({dataClass: dataClass}, this.legend[dataClass]);
      spanLegends = spanClasses.map(legendFor);
      let legendClasses = _.keys(this.legend);
      let pointClasses = _.difference(legendClasses, spanClasses).sort();
      pointLegends = pointClasses.map(legendFor);

      // The legend lines count.
      let legendCnt = pointLegends.length + spanLegends.length;
      legendHeight = legendCnt * (CHAR_SIZE + PAD);
    }

    // The domain input includes the data and the spans.
    let toValues = spec => spec.data.map(spec.value);
    let allValues = _.flow(_.map, _.flattenDeep)(allSpecs, toValues);
    // The common [min, max] domain.
    let domain = math.bounds(allValues);

    // The date scale is offset by margins to the left and right.
    // Logically, the range should be shrunk by the same
    // margin on both sides. However, that setting trunctates
    // the right tick value. Doubling the right margin works,
    // although it is unknown why that is necessary.
    let scale = d3.scaleTime()
      .domain(domain)
      .range([MARGIN.left, this.width - (MARGIN.left + MARGIN.right)]);

    // Add the point X coordinate functions.
    let addXForPoint = spec => {
      spec.x = _.flow(spec.value, scale);
    };
    _.forEach(pointSpecs, addXForPoint);

    // Add the text functions.
    let addTextForPoint = (spec, key) => {
      if (_.isFunction(this.text)) {
        spec.text = this.text;
      } else {
        spec.text = this.text[key] || WEDGE;
      }
    };
    _.forEach(pointSpecs, addTextForPoint);

    // Add the span bar X coordinate and width functions.
    let extendSpanSpec = spec => {
      spec.x = _.flow(spec.value, _.first, scale);
      let scaleSpan = span => span.map(scale);
      // If the span start and end are the same, then the
      // span is made long enough to show up as a narrow
      // bar.
      let spanWidth = span => Math.max(8, span[1] - span[0]);
      spec.width = _.flow(spec.value, scaleSpan, spanWidth);
    };
    _.forEach(spanSpecs, extendSpanSpec);

    //** Plot **//

    // The plot accomodates the legend, if necessary.
    let plotOffset = legendHeight ? legendHeight + CHAR_SIZE : 0;
    // The bottom of the plot.
    let pointsHeight = _.isEmpty(pointSpecs) ? 0 : CHAR_SIZE;
    let pointsBottom = plotOffset + pointsHeight;

    // The axis tick marks extend past any span bar.
    const axisTickSize = CHAR_SIZE + PAD;
    // The axis bottom, including the axis tick marks.
    let axisBottom = pointsBottom + CHAR_SIZE + PAD;
    if (this.ticks) {
      axisBottom += axisTickSize;
    }

    // Compute the viewport height.
    let height = MARGIN.top + axisBottom + MARGIN.bottom;
    this.svg.attr('height', height);

    // Scooch the draw region viewport down for the margin.
    let viewport = this.svg.append('g')
      .attr('transform', `translate(0,${ MARGIN.top })`);

    // The plot parent.
    let plot = viewport.append('g')
      .attr('class', 'plot');

    //** Points **//

    // `this` is bound to the series DOM element
    // (cf. \https://github.com/d3/d3-selection/blob/master/README.md#control-flow).
    let drawPointSeries = function (series) {
      let spec = pointSpecs[series];
      d3.select(this)
        .selectAll('.point')
        .data(spec.data)
        .enter().append('text')
          .attr('class', spec.cssClass)
          .attr('x', spec.x)
          .attr('y', 0)
          .text(spec.text);
    };

    // Push the plot down for the legend, if necessary.
    if (plotOffset) {
      plot.attr('transform', `translate(0,${ plotOffset })`);
    }

    // Draw the time line points. The points are placed directly
    // above the axis.
    plot.append('g')
      .attr('class', 'points')
      .attr('transform', `translate(0,${ CHAR_SIZE })`)
      .selectAll('.series')
      .data(_.keys(pointSpecs))
      .enter().append('g')
        .attr('class', series => `points series ${ series }`)
        .each(drawPointSeries);

    // ** Spans **//

    // Draws the span for the given data series.
    let drawSpanSeries = function (series) {
      let spec = spanSpecs[series];
      d3.select(this)
        .selectAll('.bar')
        .data(spec.data)
        .enter().append('rect')
          .attr('class', spec.cssClass)
          .attr('width', spec.width)
          .attr('height', CHAR_SIZE)
          .attr('x', spec.x)
          .attr('y', 0);
    };

    // Draw the time line spans. The spans are placed directly
    // under the axis.
    plot.append('g')
      .attr('class', 'spans')
      .attr('transform', `translate(0,${ CHAR_SIZE })`)
      .selectAll('.series')
      .data(_.keys(spanSpecs))
      .enter().append('g')
        .attr('class', series => `spans series ${ series }`)
        .each(drawSpanSeries);

    //** Axis **//

    // The axis.
    let axis = d3.axisBottom(scale);
    // There is always an axis, but ticks can be optionally
    // suppressed.
    if (this.ticks) {
      axis.tickSize(axisTickSize)
        // Date ticks are formatted as mm/dd/yyyy.
        .tickFormat(d3.timeFormat('%m/%d/%Y'))
        // The bounds axis only adds tick marks at the
        // start and end of the time line.
        .tickValues(domain);
    } else {
      axis.tickValues([]);
    }
    // Draw the axis.
    viewport.append('g')
      .attr('class', 'axis x')
      // Place the axis below the time line points.
      .attr('transform', `translate(0,${ pointsBottom })`)
      .call(axis);

    // ** Legend **//

    if (this.legend !== false) {
      // The legend label function.
      let label = legend => legend.label;

      // The legend name function.
      let name = legend =>
        legend.name || StringHelper.labelize(legend.dataClass);

      // The legend CSS class function.
      let cssClass = legend =>
        StringHelper.dasherize(legend.dataClass);

      // Draws the point legend label.
      let drawLabel = function (legend) {
        return d3.select(this)
          .append('text')
          .attr('text-anchor', 'end')
          .attr('x', 0)
          .attr('y', 0)
          .text(label);
      };

      // Draws the small span legend bar.
      let drawBar = function (legend) {
        return d3.select(this)
          .append('rect')
          .attr('height', CHAR_SIZE)
          .attr('width', CHAR_SIZE)
          // Align the end of the bar to the start of the name.
          .attr('x', -CHAR_SIZE)
          // Since the text is drawn above the baseline,
          // whereas the rectangle is drawn below the baseline,
          // push the bar up to align with the text by setting
          // the y value to a negative offset (ain't SVG fun?!).
          .attr('y', -CHAR_SIZE);
      };

      // Draws the legend name.
      let drawName = function (legend) {
        return d3.select(this)
          .append('text')
          .attr('text-anchor', 'start')
          // Add a small separator from the label.
          .attr('x', PAD)
          .attr('y', 0)
          .text(name);
      };

      // The legend is embedded in a local viewport placed in the
      // right third of the viewport with a one-character right
      // margin.
      let legendWidth = this.width / 3;

      // preserveAspectRatio below and many variations don't work--
      // the legend is always drawn in the upper right. Work-around
      // is to fix a text axis to the right.
      // let legend = viewport.append('svg')
      //   .attr('class', 'legend')
      //   .attr('width', legendWidth)
      //   .attr('height', legendHeight)
      //   .attr('viewBox', `0 0 ${ legendWidth } ${ legendHeight }`)
      //   // Align the legend to the upper right corner of the
      //   // time line viewport and add a one-character vertical
      //   // margin.
      //   .attr('preserveAspectRatio', 'xMaxYMin meet')
      //   .append('g')
      //     .attr('transform', `translate(0,${ CHAR_SIZE })`);

      let legendXOffset = this.width - legendWidth + (4 * CHAR_SIZE);
      let legend = viewport.append('g')
        .attr('class', 'legend')
        .append('g')
          .attr('transform', `translate(${ legendXOffset },${ CHAR_SIZE })`);

      // Each legend item is placed under the previous item, if any.
      let transform = (d, i) => {
        let offset = i * (CHAR_SIZE + PAD);
        return `translate(0,${ offset })`;
      };

      // Draw the point legends.
      legend.append('g')
        .attr('class', 'points')
        .selectAll('.point')
        .data(pointLegends)
        .enter().append('g')
          .attr('class', d => `point ${ cssClass(d) }`)
          .attr('transform', transform)
          .each(drawLabel)
          .each(drawName);

      // The span legends follow the point legends.
      let spansOffset = pointLegends.length * (CHAR_SIZE + PAD);
      // Draw the span legends.
      legend.append('g')
        .attr('class', 'bars')
        .attr('transform', `translate(0,${ spansOffset })`)
        .selectAll('.bar')
        .data(spanLegends)
        .enter().append('g')
          .attr('class', d => `bar ${ cssClass(d) }`)
          .attr('transform', transform)
          .each(drawBar)
          .each(drawName);
    }
  }
}
