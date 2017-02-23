import * as _ from 'lodash';
import * as d3 from 'd3';
import {
  Directive, Input, Output, ElementRef, EventEmitter,
  OnChanges, SimpleChange
} from '@angular/core';

import ObjectHelper from '../common/object-helper.coffee';
import DateHelper from '../common/date-helper.coffee';
import * as math from '../math/math.ts';
import * as language from '../language/language.ts';

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
 * data points.
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
  @Input() data;

  /**
   * The optional selection array filters the data domain. The default
   * is to use all of the data objects. Missing inputs are always ignored.
   *
   * @property selection {boolean[]}
   */
  @Input() selection: boolean[];

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
   * The optional property name or path whose value determines the data point
   * (color, opacity) assignment. A data point is assigned a color and opacity
   * based on the result of calling the color function. Distinct data points
   * are assigned the same (color, opacity) combination if and only if applying
   * the color function returns the same color value.
   *
   * The default color function is the zero-based position of the input object
   * in the {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * array.
   *
   * @property color {string}
   */
  @Input() color: string;

  /**
   * The flag indicating whether the X domain is discrete rather than
   * continuous. The default is `true` if the first non-nil X value
   * is a string or boolean, `false` otherwise.
   *
   * @property xDiscrete {boolean}
   */
  @Input() xDiscrete: boolean;

  /**
   * The flag indicating whether the Y domain is discrete rather than
   * continuous. The default is `true` if the first non-nil Y value
   * is a string or boolean, `false` otherwise.
   *
   * @property yDiscrete {boolean}
   */
  @Input() yDiscrete: boolean;

  /**
   * The optional X {value: label} associative object for a discrete domain.
   *
   * @property xChoices {Object}
   */
  @Input() xChoices: Object;

  /**
   * The optional Y {value: label} associative object for a discrete domain.
   *
   * @property yChoices {Object}
   */
  @Input() yChoices: Object;

  /**
   * The optional symbol type function (default `circle`).
   *
   * @property symbolType {function}
   */
  @Input() symbolType: (d: Object) => string;

  /**
   * The optional chart width. The default width is the parent element
   * width.
   *
   * @property width {number}
   */
  @Input() width: number;

  /**
   * The optional chart height. The default height is the
   * {{#crossLink "ScatterPlotDirective/width:property"}}{{/crossLink}}
   * times the
   * {{#crossLink "ScatterPlotDirective/aspect:property"}}{{/crossLink}}.
   *
   * @property height {number}
   */
  @Input() height: number;

  /**
   * The optional chart [top, left, bottom, right] margin within the SVG
   * root element.
   *
   * @property margin {number[]}
   */
  @Input() margin: number[] = [0, 0, 0, 0];

  /**
   * The optional chart width:height ratio. The default is the window
   * aspect.
   *
   * @property aspect {number}
   */
  @Input() aspect: number;

  /**
   * The optional least squares trend line flag. The default is `false`.
   *
   * @property trendLine {boolean}
   */
  @Input() trendLine: boolean = false;

  /**
   * The axis customization callback.
   *
   * @property onAxis {function}
   */
  @Input() onAxis: (property: string, axis: Object) => void;

  /**
   * The plotted event transmits the root SVG group D3 selection
   * after the chart is drawn.
   *
   * @property plotted {EventEmitter<Object>}
   */
  @Output() plotted: EventEmitter<Object> = new EventEmitter(true);

  /**
   * The select event transmits the domain object selection state.
   *
   * @property select {EventEmitter<boolean[]>}
   */
  @Output() select: EventEmitter<boolean[]> = new EventEmitter(true);

  /**
   * The plot configuration parameters. This object is built by
   * {{#crossLink "ScatterPlotDirective/createChart"}}{{/crossLink}}
   * and consists of data-independent properties, e.g. the plot
   * origin and the visibility function.
   *
   * @property plot {Object}
   * @private
   */
  private plot;

  /**
   * The domain references encapsulation. This object is built
   * by
   * {{#crossLink "ScatterPlotDirective/createDomains"}}{{/crossLink}}
   * and consists of the following properties:
   * * _data_: the valid data object array
   * * _dataRefs_: the _data_ =>
   *   {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   *   index array
   * * _pointData_: the valid data points array
   * * _toData_: the data point => _data_ index array
   * * _fromData_: the _data_ => [data point] index array
   * * _x_, _y_: the {value, indexes, domain, scale} axis
   *   properties
   *
   * @property domains {Object}
   * @private
   */
  private domains;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   * @private
   */
  private svg: d3.Selection<any>;

  /**
   * The data point X cooordinate function.
   *
   * @property dx {function}
   * @private
   */
  private dx: (d: Object) => number;

  /**
   * The data point Y cooordinate function.
   *
   * @property dy {function}
   * @private
   */
  private dy: (d: Object) => number;

  /**
   * The time of the transitions in progress.
   *
   * @property pendingTransitionTime {number}
   * @private
   */
  private pendingTransitionTime: number = 0;

  /**
   * The internal chart padding to accomodate the top and
   * bottom axes. The right pad allows for the last X tick
   * label. The left pad accomodates a `-n.nn` number.
   * Non-numeric labels are slanted to fit within the pad.
   *
   * @property pad
   * @private
   */
  private const pad = [6, 30, 18, 18];

  constructor(private elementRef: ElementRef) {}

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
    let isXChanged = isChanged('x');
    let isYChanged = isChanged('y');
    if (isXChanged || isYChanged) {
      this.updatePlot();
    } else if (isChanged('selection')) {
      // The visibility depends on the selection array.
      this.resetVisibility();
    }
  }

  /**
   * Makes the D3 SVG root group element and draws the plot.
   *
   * @method createChart
   * @private
   */
  private createChart() {
    // There must be X and Y properties.
    if (!this.x) {
      throw new Error("Missing the scatter plot X property");
    }
    if (!this.y) {
      throw new Error("Missing the scatter plot Y property");
    }

    // The effective width and height.
    // Note: svg, as a replaced element, has a browser-dependent
    // default size, often 300px wide by 150px tall. A better
    // default size is based on the width as described in the height
    // property apidoc.
    // Note: use getBoundingClientRect() rather than clientWidth per
    // https://github.com/d3/d3-brush/blob/master/README.md#brushExtent.
    // Set the default width, if necessary.
    if (!this.width) {
      let rect = this.elementRef.nativeElement.getBoundingClientRect();
      this.width = rect.width;
    }
    // Set the default height, if necessary.
    if (!this.height) {
      let rect = document.body.getBoundingClientRect();
      let defAspect = rect.width / rect.height;
      let aspect = this.aspect || defAspect;
      this.height = Math.floor(this.width / aspect);
    }

    // Make the plot parameter object.
    this.configurePlot();

    // Define the domains, origin and accessors.
    this.createDomains();

    // The data point coordinate functions.
    this.dx = (d, i) =>
      this.domains.x.scale(this.domains.x.value(d, i));
    this.dy = (d, i) =>
      this.domains.y.scale(this.domains.y.value(d, i));

    // The root SVG group element.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('viewBox', `0 0 ${ this.width } ${ this.height }`)
      .attr('width', this.width)
      .attr('height', this.height);

    // The data points plot portion of the chart.
    let plot = this.svg.append('g')
      .attr('transform', `translate(${ this.pad[3] },0)`)
      .attr('class', 'plot');

    // Draw the axes.
    this.drawAxes();
    // Draw the points.
    this.drawPoints(plot);
    // The optional trend line.
    if (this.trendLine) {
      this.drawTrendLine(plot);
    }

    // Make a brush.
    let brush = this.createBrush();
    // Apply the brush to the plot.
    plot.append('g')
      .attr('class', 'brush')
      .call(brush);

    // Give watchers a change to bang on the chart.
    this.plotted.emit(this.svg);
  }

  /**
   * Makes the plot data-independent parameters.
   *
   * @method configurePlot
   * @private
   */
  private configurePlot() {
    // Set the scale range.
    let rightOffset = this.pad[1] + this.margin[1];
    let bottomOffset = this.pad[2] + this.margin[2];
    let x1 = this.pad[3] + this.margin[3];
    let x2 = this.width - rightOffset;
    let y1 = this.height - bottomOffset;
    let y2 = this.pad[0] + this.margin[0];

    // The origin is pushed right by the pad amount.
    let origin = {x: x1 + this.pad[3], y: y1};

    // The visibility function.
    let visibility = (d, i) =>
      this.isDataPointVisible(i) ? 'visibile' : 'hidden';

    // The color index function maps the input to a color reference value.
    // The default index function assigns each object to its position in
    // the data array.
    let defColorIndex = (d, i) =>
      this.domains.toData ? this.domains.toData[i] : i;
    let colorIndex = this.color ?
                     d => _.get(d, this.color) :
                     defColorIndex;

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

    // The symbol factory.
    const symbolSize = 40;
    let symbolType = this.symbolType || d3.symbolCircle;
    let symbol = d3.symbol().type(symbolType).size(symbolSize);

    // Localize the point transform function to work around
    // the brain-dead Javascript *this* confusion.
    let pointTransform = (d, i) => this.pointTransform(d, i);

    // Capture the plot parameters.
    this.plot = {
      origin: origin,
      visibility: visibility,
      opacity: opacity,
      color: color,
      symbol: symbol,
      pointTransform: pointTransform,
      x: {range: [x1, x2]},
      y: {range: [y1, y2]}
    };
  }

  /**
   * Reconfigures and redraws the D3 plot.
   *
   * @method updatePlot
   * @private
   */
  private updatePlot() {
    let plot = this.svg.select('.plot');
    // Reconfigure the plot.
    this.createDomains();
    // Remove the existing axes.
    this.svg.selectAll('g.axis').remove();
    // Draw the new axes.
    this.drawAxes();
    // Redraw the points.
    this.drawPoints(plot);
    // Recalculate the correlation.
    if (this.trendLine) {
      plot.selectAll('.trendline').remove();
      plot.selectAll('.r-squared').remove();
      this.drawTrendLine(plot);
    }

    // Reset the visibility.
    this.resetVisibility();
  }

  /**
   * Draws the D3 points in the given plot.
   *
   * @method drawPoints
   * @private
   * @param plot {Object} the D3 plot selection
   */
  private drawPoints(plot: Object) {
    // The D3 data join.
    let dataPoints = plot.selectAll('.point')
      .data(this.domains.pointData);

    // Reset the common data points with a fancy index-dependent
    // delay/duration.
    let n = this.domains.pointData.length;
    const total = 500;
    const avg = Math.floor(total / n);
    let delay = (d, i) => i * avg;
    let duration = (d, i) => (n - i) * avg;
    let remaining = n;
    let onEnd = () => {
      remaining -= 1;
      if (!remaining) {
        this.pendingTransitionTime -= total;
      }
    };
    this.pendingTransitionTime += total;

    // Relocate existing points, using the common transform
    // set in the data join merge below.
    dataPoints
      .transition()
      .delay(delay)
      .duration(duration)
      .on('end', onEnd);

    // Add new points.
    dataPoints.enter().append('path')
        .attr('class', 'point')
        .style('visibility', this.plot.visibility)
        .attr('d', this.plot.symbol)
      // The updated + new data join merge action. This
      // action applies styles and attributes which
      // depend on the data point data or data index.
      // Specifically, a change from an non-array
      // property to an array property requires a
      // recalculation of the color and opacity, since
      // those styles depend on the data point data index.
      // The transform always changes, since it depends
      // on dx and dy.
      .merge(dataPoints)
        .style('fill', this.plot.color)
        .style('opacity', this.plot.opacity)
        .attr('transform', this.plot.pointTransform);

    // Remove extra points.
    dataPoints.exit().remove();
  }

  /**
   * Resets the data point visibility style based on the
   * {{#crossLink "ScatterPlotDirective/isDataPointVisible"}}{{/crossLink}}
   * result.
   *
   * @method resetVisibility
   * @private
   */
  private resetVisibility() {
    let isVisible = (d, i) => this.isDataPointVisible(i);
    let isHidden = _.negate(isVisible);
    let delay = this.pendingTransitionTime;
    const duration = 200;
    let remaining = this.domains.pointData.length;
    let onEnd = () => {
      remaining -= 1;
      if (!remaining) {
        this.pendingTransitionTime -= duration;
      }
    };
    this.pendingTransitionTime += duration;
    this.svg.selectAll('.point')
      .filter(isHidden)
      .transition()
      .delay(delay)
      .duration(duration)
      .on('end', onEnd)
      .style('visibility', 'hidden');
    this.svg.selectAll('.point')
      .filter(isVisible)
      .transition()
      .delay(delay)
      .duration(duration)
      .on('end', onEnd)
      .style('visibility', null);
  }

  /**
   * Sets the data-dependent portion of the plot.
   *
   * @method createDomains
   * @private
   */
  private createDomains() {
    // The base accessors.
    // Note: we cannot use _.partialRight here because of Javascript
    // 'this' swizzling confusion.
    let getX = d => _.get(d, this.x);
    let getY = d => _.get(d, this.y);

    // The new domain encapsulation object. If there is an old
    // one, it is trashed.
    this.domains = {x: {}, y: {}};
    // Set up the domains.
    this.configureDomains(getX, getY);

    // A numeric property has a continuous linear scale.
    // A date property has a time scale.
    // Otherwise, use a discrete quantized scale.
    if (this.domains.x.discrete) {
      let xPadding = 2 / (this.domains.x.domain.length + 1);
      this.domains.x.scale =
        d3.scalePoint().domain(this.domains.x.domain)
          .range(this.plot.x.range).padding(xPadding);
    } else if (this.domains.x.isDate) {
      this.domains.x.scale =
        d3.scaleTime().domain(this.domains.x.domain)
          .range(this.plot.x.range).nice();
    } else {
      this.domains.x.scale =
        d3.scaleLinear().domain(this.domains.x.domain)
          .range(this.plot.x.range).nice();
    }
    if (this.domains.y.discrete) {
      let yPadding = 2 / (this.domains.y.domain.length + 1);
      this.domains.y.scale =
        d3.scalePoint().domain(this.domains.y.domain)
          .range(this.plot.y.range).padding(yPadding);
    } else if (this.domains.y.isDate) {
      this.domains.y.scale =
        d3.scaleTime().domain(this.domains.y.domain)
          .range(this.plot.y.range).nice();
    } else {
      this.domains.y.scale =
        d3.scaleLinear().domain(this.domains.y.domain)
          .range(this.plot.y.range).nice();
    }
  }

  /**
   * Creates the
   * {{#crossLink "ScatterPlotDirective/domain:property"}}{{/crossLink}}.
   *
   * @method configureDomains
   * @private
   * @param getX {function} the X accessor
   * @param getY {function} the Y accessor
   */
  private configureDomains(getX, getY) {
    // Add the domain reference properties.
    this.configureDomainRefs(getX, getY);

    // moments must be converted to JavaScript Dates.
    let accessor = (domain, getter) =>
      domain.isDate ? _.flow(getter, DateHelper.toDate) : getter;
    // Arrays must account for the index qualifier.
    let xValue;
    if (this.domains.x.indexes) {
      xValue = (d, i) => {
        let index = this.domains.x.indexes[i];
        let array = getX(d);
        if (array) {
          return array[index];
        }
      };
    } else {
      xValue = accessor(this.domains.x, getX);
    }
    let yValue;
    if (this.domains.y.indexes) {
      yValue = (d, i) => {
        let index = this.domains.y.indexes[i];
        let array = getY(d);
        if (array) {
          return array[index];
        }
      };
    } else {
      yValue = accessor(this.domains.y, getY);
    }

    // Set each value accessor. The discrete accessor
    // looks up the discrete value in the choices, if
    // such exists. Note that the calls to xValue or
    // yValue are not guarded by a valid data check,
    // since they are only called on the pre-filtered
    // data that is valid for both axes.
    if (this.xChoices) {
      let lookupX = v => this.xChoices[v] || v;
      this.domains.x.value = _.flow(xValue, lookupX);
    } else {
      this.domains.x.value = xValue;
    }
    if (this.yChoices) {
      let lookupY= v => this.yChoices[v] || v;
      this.domains.y.value = _.flow(yValue, lookupY);
    } else {
      this.domains.y.value = yValue;
    }

    // The discrete domain is the sorted value list.
    // The continuous domain is the [min, max].
    if (this.domains.x.discrete) {
      this.domains.x.domain = this.getDiscreteValues(
        this.domains.x.value, this.domains.y.value
      );
    } else {
      this.domains.x.domain = this.getContinuousDomain(
        this.domains.x.value
      );
    }
    if (this.domains.y.discrete) {
      this.domains.y.domain = this.getDiscreteValues(
        this.domains.y.value, this.domains.x.value
      );
    } else {
      this.domains.y.domain = this.getContinuousDomain(
        this.domains.y.value
      );
    }
  }

  /**
   * Collects the values for a discrete domain.
   * If there is a trend line, then the domain is sorted as
   * follows:
   * * If both axes are discrete, then the sort criterion is
   *   the orthogonal count.
   * * Otherwise, the discrete axis sort criterion is the
   *   orthogonal mean.
   * If there is not a trend line, then the domain is sorted
   * in the natural order.
   *
   * @method getDiscreteValues
   * @param discrete {function} the discrete axis value accessor
   *   object
   * @param other {function} the orthogonal axis value accessor
   * @return {any[]} the sorted discrete values
   */
  private getDiscreteValues(discrete, other) {
    // The unsorted values.
    let values = _.map(this.domains.pointData, discrete);
    if (this.trendLine) {
      // Sort relative to orthogonal values.
      //
      // Note: we cannot use the following to make the groups:
      //   _.groupBy(this.domains.pointData, discrete)
      // because the _.groupBy iteratee is only called with
      // one argument, the value, whereas an array property
      // accessor uses the iteratee index argument.
      //
      // The groupBy function below works around the following
      // lodash bug:
      // * the lodash groupBy iteratee is not called with an
      //   index argument
      let groupBy = (collection, iteratee) => {
        let accumGroups = (accum, d, i) => {
          let value = iteratee(d, i);
          let group = accum[value];
          if (!group) {
            group = accum[value] = [];
          }
          group.push(d);
        };
        return _.transform(collection, accumGroups, {});
      };
      let groups = groupBy(this.domains.pointData, discrete);
      let sortPrep = this.getDiscreteSortCriteria(groups, other);
      let sorter = v => sortPrep[v];
      return _.sortBy(_.keys(groups), sorter);
    } else {
      // Sort by natural order.
      // Silly brain-dead Javascript numeric sort work-around.
      let isNumeric = _.isNumber(values[0]);
      let sorted = isNumeric ? values.sort(_.subtract) : values.sort();
      // The valid unique sorted values.
      return _.sortedUniq(sorted);
    }
  }

  /**
   * The discrete groups are sorted as follows:
   * * If both axes are discrete, then the sort criterion is
   *   the orthogonal count.
   * * Otherwise, the discrete axis sort criterion is the
   *   orthogonal mean.
   *
   * @method getDiscreteSortCriterion
   * @param groups {Object} the discrete {value: [data objects]}
   *   object
   * @param other {function} the orthogonal value accessor
   * @return {Object} the group sort criteria
   */
  private getDiscreteSortCriteria(groups: Object, other) {
    if (this.domains.x.discrete && this.domains.y.discrete) {
      // Sort by orthogonal count.
      return _.mapValues(groups, a => a.length);
    } else {
      // Sort by orthogonal mean.
      return _.mapValues(groups, a => _.meanBy(a, other));
    }
  }

  /**
   * Sets the
   * {{#crossLink "ScatterPlotDirective/domains:property"}}{{/crossLink}}
   * properties `data`, `dataRefs`, `toData`, `fromData`, `x.discrete`,
   * `y.discrete`, `x.indexes` and `y.indexes`.
   *
   * @method configureDomainRefs
   * @private
   * @param getX {function} the X accessor
   * @param getY {function} the Y accessor
   */
  private configureDomainRefs(getX, getY) {
    // Filter for the well-defined data points.
    let isValidX = _.flow(getX, ObjectHelper.hasValidContent);
    let isValidY = _.flow(getY, ObjectHelper.hasValidContent);
    let isBothValid = d => isValidX(d) && isValidY(d);
    let isInvalid = _.negate(isBothValid);

    // It is common that all data is valid. Therefore,
    // first check whether at least one datum is invalid.
    // In that case, collect the valid data and this.data
    // references. Otherwise, the valid data is just the
    // this.data array, and there is no need for a dataRefs
    // array.
    if (_.some(this.data, isInvalid)) {
      this.domains.data = [];
      this.domains.dataRefs = [];
      let accumValid = (d, i) => {
        if (isBothValid(d)) {
          this.domains.dataRefs.push(i);
          this.domains.data.push(d);
        }
      };
      _.forEach(this.data, accumValid);
    } else {
      this.domains.data = this.data;
    }

    // The first valid input data object.
    let sampleInput = _.first(this.domains.data);
    // There must be at least one valid value.
    if (!sampleInput) {
      throw new Error("There is no valid data point for the properties" +
                      ` X ${ this.x } and Y ${ this.y } `);
    }
    let sample = {x: getX(sampleInput), y: getY(sampleInput)};
    // Strings and booleans are always discrete.
    let isValueDiscrete = v =>
      _.isString(v) || _.isBoolean(v) ||
      (_.isArray(v) && isValueDiscrete(v[0]));
    this.domains.x.discrete = this.xDiscrete || isValueDiscrete(sample.x);
    this.domains.y.discrete = this.yDiscrete || isValueDiscrete(sample.y);
    // Dates are handled specially.
    this.domains.x.isDate =
      !this.domains.x.discrete && DateHelper.isDate(sample.x);
    this.domains.y.isDate =
      !this.domains.y.discrete && DateHelper.isDate(sample.y);

    // Adjust for a multi-valued domain, if necessary.
    let indexGroups = {};
    let isXIndexed = _.isArray(sample.x);
    let isYIndexed = _.isArray(sample.y);

    // If both properties are multi-valued, then make
    // the cross-product index groups. Otherwise, make
    // the separate axis index groups, if necessary.
    if (isXIndexed) {
      let xIndexGroups = this.groupIndexes(getX);
      if (isYIndexed) {
        let yIndexGroups = this.groupIndexes(getY);
        // Make the cross-product index groups.
        let cross = (groupX, i) => {
          let groupY = yIndexGroups[i];
          let dupX = _.partialRight(language.dup, groupY.length);
          let dupedX = _.flatMap(groupX, dupX);
          let pairOff = y => groupX.map(x => [x, y]);
          let dupedY = _.flatMapDeep(groupY, pairOff);
          return {x: dupedX, y: dupedY};
        };
        let crossed = xIndexGroups.map(cross);
        indexGroups.x = _.map(crossed, 'x');
        indexGroups.y = _.map(crossed, 'y');
      } else {
        indexGroups.x = xIndexGroups;
      }
    } else if (isYIndexed) {
      indexGroups.y = this.groupIndexes(getY);
    }

    let flattenGroups = groups => groups.map(_.flatten);
    let indexes = _.mapValues(indexGroups, flattenGroups);
    // Pick any index groups, since we only use the
    // data index and the group lengths to make the
    // data point => data references, and if both
    // axes are indexed, then the group lengths of
    // each are identical.
    let someGroups = indexGroups.x || indexGroups.y;
    if (someGroups) {
      // The data point => data references.
      let dupTo = (group, i) => {
        return group ? language.dup(i, group.length) : i;
      };
      this.domains.toData = _.flatMap(someGroups, dupTo);

      // The data => [data points] references.
      let accumFrom = (accum, ref, i) => {
        let group = accum[ref];
        if (!group) {
          group = accum[ref] = [];
        }
        group.push(i);
      };
      this.domains.fromData = _.transform(this.domains.toData, accumFrom);

      // The data points mirror toData.
      let deref = ref => this.domains.data[ref];
      this.domains.pointData = this.domains.toData.map(deref);
    } else {
      // The data points are the same as the data.
      this.domains.pointData = this.domains.data;
    }

    if (indexGroups.x) {
      this.domains.x.indexes = _.flatten(indexes.x);
    }
    if (indexGroups.y) {
      this.domains.y.indexes = _.flatten(indexes.y);
    }
  }

  private groupIndexes(accessor) {
    let getGroup = d => {
      let value = accessor(d);
      if (!_.isEmpty(value)) {
        return _.range(value.length);
      }
    };
    return this.domains.data.map(getGroup);
  }

  /**
   * The point locator function.
   *
   * @method pointTransform
   * @private
   * @param d {Object} the data object
   * @param i {number} the data point (not *data*) index
   * @return {string} the `translate` SVG directive
   */
  private pointTransform(d: Object, i: number) {
    return `translate(${ this.dx(d, i) },${ this.dy(d, i) })`;
  }

  /**
   * Returns whether the data point at the given index is both
   * valid and selected.
   *
   * @method isDataPointVisible
   * @private
   * @param index {number} the data point (not *data*) array index
   * @return {boolean} whether the data point is selected and valid
   */
  private isDataPointVisible(index: number): boolean {
    let refs = this.domains.toData;
    let di = refs ? refs[index] : index;
    return !this.selection || this.selection[di];
  }

  private drawAxes() {
    // Make the axes.
    let xAxis = d3.axisBottom(this.domains.x.scale);
    let yAxis = d3.axisLeft(this.domains.y.scale);

    // Date ticks are formatted as mm/dd/yyyy.
    if (DateHelper.isDate(this.domains.x.domain[0])) {
      xAxis.tickFormat(d3.timeFormat('%m/%d/%Y'));
    }
    if (DateHelper.isDate(this.domains.y.domain[0])) {
      yAxis.tickFormat(d3.timeFormat('%m/%d/%Y'));
    }

    // Allow for the callback.
    if (this.onAxis) {
      this.onAxis(this.x, xAxis);
      this.onAxis(this.y, yAxis);
    }

    this.svg.append('g')
      .attr('transform', `translate(${ this.pad[3] },${ this.plot.origin.y })`)
      .attr('class', 'axis x')
      .call(xAxis);
    this.svg.append('g')
      .attr('transform', `translate(${ this.plot.origin.x },0)`)
      .attr('class', 'axis y')
      .call(yAxis);
    // Slant non-numeric discrete Y axis tick labels.
    if (this.domains.y.discrete && !_.isNumber(this.domains.y.domain[0])) {
      this.svg.selectAll('.y.axis text')
        .attr('transform', 'translate(-5,-20)rotate(-70)');
    }
  }

  /**
   * Makes the seletion D3 brush.
   *
   * @method createBrush
   * @return {Object} the D3 brush
   */
  private createBrush() {
    // The brush extent includes only the data points. The
    // offset is the amount to chop out, with the exception
    // noted below.
    let offset = _.map(this.pad, (v, i) => v + this.margin[i]);
    // For some reason, setting the brush extent first y value
    // to the offset chops out data points. Use the margin
    // instead.
    let extent = [
      [offset[0], this.margin[3]],
      [this.width - offset[1], this.height - offset[2]]
    ];
    // Make the brush.
    let brush = d3.brush().extent(extent);

    // Add the callbacks:

    let onBrushStart = () => {
      // Reshow all elements in this chart until the brush
      // selection is completed.
      let delay = this.pendingTransitionTime;
      // Every data point is visible at the start of the
      // brush action.
      this.svg.selectAll('.point')
        .transition()
        .delay(delay)
        .duration(0)
        .style('visibility', 'visibile');
    };

    // Flag to avoid an infinite loop (see below).
    let clearingBrush = false;
    let onBrushEnd = () => {
      // Ignore an empty selection.
      // The magical guard below avoids an infinite loop,
      // as described below.
      if (clearingBrush) { return; }

      // We apologize for the technical interruption and
      // return to the program in progress.
      let selected = this.selectedData();
      // If there is a change, then trigger the select callback.
      if (selected !== this.selection) {
        this.select.emit(selected);
      }

      // Due to technical difficulties described below, we
      // interrupt the normally scheduled program as follows:
      //
      // Clear the brush. The bizarre move/clear idiom is a D3 v4
      // "improvement" over D3 v3 brush.clear(). However, the
      // side-effect is an infinite loop trap for some obscure
      // reason adumbrated in https://github.com/d3/d3-brush/issues/10.
      // However, the work-around guards suggested there as:
      //   if (!d3.event.sourceEvent) return;
      //   if (!d3.event.selection) return;
      // don't apply here. The first guard never triggers. The
      // second guard defeats the purpose of sending the selection
      // all-clear signal to the parent component.
      //
      // Therefore, we introduce the clearingBrush flag kludge
      // below to work around the obscure, deficient unofficially
      // official D3 v4 work-around.
      clearingBrush = true;
      this.svg.select('.brush')
        .call(brush.move, null);
      clearingBrush = false;
    };

    // Register the callbacks.
    brush.on('start', onBrushStart);
    brush.on('end', onBrushEnd);

    return brush;
  }

  /**
   * Determines the subset of
   * {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * data points within the D3 brush bounding box.
   *
   * _Note_: this method is intended for use solely by the D3 callback.
   *
   * @method getSelectedData
   * @return the data selection
   */
  private selectedData() {
    // The selection bounding box.
    let box = d3.event.selection;
    // If some data points are selected, then map the data to
    // their selection state. Otherwise, the default null is
    // returned, which signifies that all data points are shown.
    if (!box) {
      return null;
    }

    // The callback functions.
    let isWithin = (x, y) =>
      x >= box[0][0] && x <= box[1][0] && y >= box[0][1] && y <= box[1][1];
    let isDataPointInBox = (d, i) =>
      isWithin(this.dx(d, i), this.dy(d, i), box);
    let isDataSelected = (d, i) => {
      if (this.domains.fromData) {
        // The data point indexes for the given datum.
        let refs = this.domains.fromData[i];
        // Check the (datum, data point index) pair.
        let isRefInBox = ref => isDataPointInBox(d, ref);
        // If any of the indexed data points is in the box,
        // then the datum is selected.
        return _.some(refs, isRefInBox);
      } else {
        // Check the (datum, data index) pair.
        return isDataPointInBox(d, i);
      }
    };

    return this.data.map(isDataSelected);
  }

  /**
   * Draws the correlation trend line and correlation
   * coefficient, if the correlation is well-defined, as
   * described in
   * {{#crossLink "ScatterPlotDirective/leastSquares"}}{{/crossLink}}.
   *
   * @method drawTrendLine
   * @private
   * @param plot {Object} the plot SVG element
   * @return the data selection
   */
  private drawTrendLine(plot) {
    let lsq = this.leastSquares();
    // If no correlation can be determined, then bail.
    if (!lsq) {
      return;
    }

    // The trend end-points.
    let m = lsq.slope;
    let b = lsq.intercept;
    let [rx1, rx2] = this.domains.x.scale.range();
    let [ry1, ry2] = this.domains.y.scale.range();
    let miny = Math.min(ry1, ry2);
    let maxy = Math.max(ry1, ry2);
    let lsqy1 = (m * rx1) + b;
    let y1 = _.max([_.min([lsqy1, maxy]), miny]);
    let x1 = Math.floor((y1 - b) / m);
    let lsqy2 = (m * rx2) + b;
    let y2 = _.max([_.min([lsqy2, maxy]), miny]);
    let x2 = Math.floor((y2 - b) / m);

    // The sole trend line datum is the array of line start
    // and end point domain values. The coordinates are then
    // scaled from this array.
    let trendData = [[x1, y1, x2, y2]];
    // Draw the trend line.
    plot.selectAll('.trendline')
      .data(trendData)
      .enter().append('line')
        .attr('class', 'trendline')
        .attr('x1', d => d[0])
        .attr('y1', d => d[1])
        .attr('x2', d => d[2])
        .attr('y2', d => d[3]);

    // Show the r-square value.
    let rSquareData = [[lsq.rSquare, x2, y2]];
    plot.selectAll('.r-squared')
      .data(rSquareData)
      .enter().append('text')
        .text(d => `r² = ${ d[0].toFixed(2) }`)
        .attr('class', 'r-squared')
        .attr('x', d => d[1] - 40)
        .attr('y', d => d[2]);
  }

  /**
   * Calculate the least-squares trend line parameters. This
   * function is adapted, with improvements, from
   * http://bl.ocks.org/benvandyke/8459843. The return value
   * is the {slope, intercept, rSquare} object, if well-defined,
   * otherwise null. The correlation is not well-defined if
   * either all of the X values or all of the Y values are equal.
   *
   * @method leastSquares
   * @private
   * @return {Object} the trend line slope, intercept and r-square
   */
  private leastSquares() {
    // The scaled X and Y values for valid data points.
    let xValues = this.domains.pointData.map(this.dx);
    let yValues = this.domains.pointData.map(this.dy);
    // The X and Y means.
    let xMean = _.mean(xValues);
    let yMean = _.mean(yValues);

    // The sums of squares.
    let diffSquare = (v, delta) => Math.pow(v - delta, 2);
    let dxSquares = xValues.map(v => diffSquare(v, xMean));
    let xx = _.sum(dxSquares);
    let dySquares = yValues.map(v => diffSquare(v, yMean));
    let yy = _.sum(dySquares);
    // If all of the X values or all of the Y values are equal,
    // then correlation is undefined so bail.
    if (xx === 0 || yy === 0) {
      return null;
    }
    let dxy = i => (xValues[i] - xMean) * (yValues[i] - yMean);
    let crossProduct = _.range(xValues.length).map(dxy);
    let xy = _.sum(crossProduct);

    // The least-squares coefficients.
    let slope = xy / xx;
    let intercept = yMean - (xMean * slope);
    let rSquare = Math.pow(xy, 2) / (xx * yy);

    return {slope: slope, intercept: intercept, rSquare: rSquare};
  }

  /**
   * Determines the continuous [min, max] domain for the
   * given value function applied over the
   * {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * input.
   *
   * @method getContinuousDomain
   * @private
   * @param accessor {function|string} the X or Y domain object => value
   *   accessor or property path
   * @return the [min, max] domain
   */
  private getContinuousDomain(accessor) {
    // The [min, max] data objects.
    let dataBounds = math.bounds(this.domains.pointData, accessor);

    return dataBounds.map(accessor);
  }
}
