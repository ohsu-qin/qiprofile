import * as _ from 'lodash';
import * as d3 from 'd3';
import moment from 'moment';
import {
  Directive, Input, Output, ElementRef, EventEmitter,
  OnChanges, SimpleChange
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
   * The valid array flags whether the values are valid.
   *
   * @property valid {boolean[]}
   * @private
   */
  private valid: boolean[];

  /**
   * The X values [min, max] array.
   *
   * @property xDomain {number[]}
   * @private
   */
  private xDomain: number[];

  /**
   * The Y values [min, max] array.
   *
   * @property yDomain {number[]}
   * @private
   */
  private yDomain: number[];

  /**
   * The D3 X scale.
   *
   * @property xScale {Object}
   * @private
   */
  private xScale: Object;

  /**
   * The D3 Y scale.
   *
   * @property yScale {Object}
   * @private
   */
  private yScale: Object;

  /**
   * The point locator function.
   *
   * @property pointTransform {function}
   * @private
   */
  private pointTransform: (d: Object) => string;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   * @private
   */
  private svg: d3.Selection<any>;

  /**
   * The plot origin {x, y} point relative to the chart area.
   *
   * @property origin {Object}
   * @private
   */
  private origin: Object;

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
    // Clear the discrete flag for a changed property.
    if (isXChanged) {
      this.xDiscrete = null;
    }
    if (isYChanged) {
      this.yDiscrete = null;
    }
    if (isXChanged || isYChanged) {
      this.updatePlot();
    } else if (isChanged('selection')) {
      // Reset the visibility.
      this.resetVisibility();
    }
  }

  private updatePlot() {
    // Reconfigure the plot.
    this.configurePlot();

    // Remove the existing axes.
    this.svg.selectAll('g.axis').remove();
    // Draw the new axes.
    this.drawAxes();

    // Reset the data points with a fancy index-dependent
    // delay/duration.
    let n = this.data.length;
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
    this.svg.selectAll('.point')
      .transition()
      .delay(delay)
      .duration(duration)
      .on('end', onEnd)
      .attr('transform', this.pointTransform);

    // Recalculate the correlation.
    if (this.trendLine) {
      let plot = this.svg.select('.plot');
      plot.selectAll('.trendline').remove();
      plot.selectAll('.r-squared').remove();
      this.drawTrendLine(plot);
    }

    // Reset the visibility.
    this.resetVisibility();
  }

  /**
   * Filters the data points to select only those
   * {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * which have a valid X and Y value.
   *
   * @method filterValidData
   * @param {function} the X value accessor
   * @param {function} the Y value accessor
   * @private
   */
  private filterValidData(x, y) {
    // The validity checkers.
    let isInvalidValue = v => _.isNil(v) || Number.isNaN(v);
    let isValidValue = _.negate(isInvalidValue);
    let isValidX = _.flow(x, isValidValue);
    let isValidY = _.flow(y, isValidValue);
    let isValid = d => isValidX(d) && isValidY(d);
    // The validity flag array.
    this.valid = this.data.map(isValid);
  }

  /**
   * Resets the data point visibility style based on the
   * {{#crossLink "ScatterPlotDirective/isVisible"}}{{/crossLink}}
   * value.
   *
   * @method resetVisibility
   * @private
   */
  private resetVisibility() {
    let isVisible = (d, i) => this.isVisible(i);
    let isHidden = _.negate(isVisible);
    let delay = this.pendingTransitionTime;
    const duration = 200;
    let remaining = this.data.length;
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
   * Returns whether the given
   * {{#crossLink "ScatterPlotDirective/data:property"}}{{/crossLink}}
   * item is selected.
   * The selection flag array determines whether to show a data
   * point (default is to show the point).
   *
   * @method isVisible
   * @private
   * @param i {number} the *data* array index
   * @return {boolean} whether the data point is selected and valid
   */
  private isVisible(i): boolean {
    return this.valid[i] && (!this.selection || this.selection[i]);
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

    // Define the domains and accessors.
    this.configurePlot();

    // Adjust the value accessor to set invalid values to the
    // minimum value. This adjustment is for charting purposes
    // only, and does not affect the r-square calcuation.
    let xValue = (d, i) => {
      return this.valid[i] ? this.xValue(d) : this.xDomain[0];
    };
    let yValue = (d, i) => {
      return this.valid[i] ? this.yValue(d) : this.yDomain[0];
    };

    // The data point coordinate functions.
    this.dx = (d, i) => this.xScale(xValue(d, i));
    this.dy = (d, i) => this.yScale(yValue(d, i));

    // The visibility
    this.visibility = (d, i) =>
      this.isVisible(i) ? 'visibile' : 'hidden';

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
      .attr('viewBox', `0 0 ${ this.width } ${ this.height }`)
      .attr('width', this.width)
      .attr('height', this.height);

    // Draw the axes.
    this.drawAxes();

    // The data points plot portion of the chart.
    let plot = this.svg.append('g')
      .attr('transform', `translate(${ this.pad[3] },0)`)
      .attr('class', 'plot');

    // The symbol factory.
    const symbolSize = 40;
    let symbolType = this.symbolType || d3.symbolCircle;
    let symbol = d3.symbol().type(symbolType).size(symbolSize);

    // The point locator.
    this.pointTransform = (d, i) =>
      `translate(${ this.dx(d, i) },${ this.dy(d, i) })`;

    // Draw the plot.
    plot.selectAll('.point')
      .data(this.data)
      .enter().append('path')
        .attr('class', 'point')
        .style('visibility', this.visibility)
        .style('fill', color)
        .style('opacity', opacity)
        .attr('d', symbol)
        .attr('transform', this.pointTransform);

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
   * Sets the value-dependent portion of the plot.
   *
   * @method configurePlot
   * @private
   */
  private configurePlot() {
    // The base accessors.
    // Note: we cannot use _.partialRight here because of Javascript
    // 'this' swizzling confusion.
    let getX = d => _.get(d, this.x);
    let getY = d => _.get(d, this.y);
    // Filter for the well-defined data points.
    this.filterValidData(getX, getY);

    // Set up the accessors and domains.
    this.configureDomains(getX, getY);

    // Set the scale domain and range.
    let rightOffset = this.pad[1] + this.margin[1];
    let bottomOffset = this.pad[2] + this.margin[2];
    let x1 = this.pad[3] + this.margin[3];
    let x2 = this.width - rightOffset;
    let y1 = this.height - bottomOffset;
    let y2 = this.pad[0] + this.margin[0];
    // The origin is pushed right by the pad amount.
    this.origin = {x: x1 + this.pad[3], y: y1};

    // A numeric property has a continuous linear scale.
    // A non-numeric property has a discrete quantized scale.
    if (this.xDiscrete) {
      let xPadding = 2 / (this.xDomain.length + 1);
      this.xScale = d3.scalePoint().domain(this.xDomain)
        .range([x1, x2]).padding(xPadding);
    } else {
      this.xScale = d3.scaleLinear().domain(this.xDomain)
        .range([x1, x2]).nice();
    }
    if (this.yDiscrete) {
      let yPadding = 2 / (this.yDomain.length + 1);
      this.yScale = d3.scalePoint().domain(this.yDomain)
        .range([y1, y2]).padding(yPadding);
    } else {
      this.yScale = d3.scaleLinear().domain(this.yDomain)
        .range([y1, y2]).nice();
    }
  }

  private configureDomains(getX, getY) {
    // The first valid value.
    let isValid = (d, i) => this.valid[i];
    let sample = _.first(this.data, isValid);
    // There must be at least one valid value.
    if (!sample) {
      throw new Error("There is no valid data point for the properties" +
                      ` X ${ this.x } and Y ${ this.y } `);
    }
    // Strings and booleans are always discrete.
    let isValueDiscrete = v => _.isString(v) || _.isBoolean(v);
    if (_.isNil(this.xDiscrete)) {
      this.xDiscrete = isValueDiscrete(getX(sample));
    }
    if (_.isNil(this.yDiscrete)) {
      this.yDiscrete = isValueDiscrete(getY(sample));
    }

    // Configure the discrete axes.
    if (this.xDiscrete || this.yDiscrete) {
      // If both axes are discrete, then the sort criterion is the
      // orthogonal count. Otherwise, the discrete axis sort
      // criterion is the orthogonal mean.
      let mapSortValues = (groups, other) => {
        if (this.xDiscrete && this.yDiscrete) {
          return _.mapValues(groups, a => a.length);
        } else {
          return _.mapValues(groups, a => _.meanBy(a, other));
        }
      };

      // Make the value map from the given discrete axis property
      // and the other axis property. If we will draw a trend line,
      // then the sort criterion is given by mapSortValues.
      // Otherwise, the domain is sorted in the natural order.
      let valid = _.filter(this.data, isValid);
      let getDiscreteValues = (discrete, other) => {
        if (this.trendLine) {
          let groups = _.groupBy(valid, discrete);
          let sortPrep = mapSortValues(groups, other);
          let sorter = v => sortPrep[v];
          return _.sortBy(_.keys(groups), sorter);
        } else {
          let values = _.map(valid, discrete);
          // Silly brain-dead Javascript numeric sort work-around.
          let isNumeric = _.isNumber(values[0]);
          let sorted = isNumeric ? values.sort(_.subtract) : values.sort();
          // The valid unique sorted values.
          return _.sortedUniq(sorted);
        }
      };

      // The discrete domain is the sorted label list.
      if (this.xDiscrete) {
        let lookupX = v => _.get(this.xChoices, v) || v;
        this.xValue = _.flow(getX, lookupX);
        this.xDomain = getDiscreteValues(this.xValue, getY);
      }
      if (this.yDiscrete) {
        let lookupY = v => _.get(this.yChoices, v) || v;
        this.yValue = _.flow(getY, lookupY);
        this.yDomain = getDiscreteValues(this.yValue, getX);
      }
    }

    // The continuous accessor is the getter property.
    // The continuous domain is the [min, max].
    if (!this.xDiscrete) {
      this.xValue = getX;
      this.xDomain = this.getContinuousDomain(this.xValue);
    }
    if (!this.yDiscrete) {
      this.yValue = getY;
      this.yDomain = this.getContinuousDomain(this.yValue);
    }
  }

  private drawAxes() {
    // Make the axes.
    let xAxis = d3.axisBottom(this.xScale);
    let yAxis = d3.axisLeft(this.yScale);

    // Date ticks are formatted as mm/dd/yyyy.
    let isDate = v => moment.isMoment(v) || moment.isDate(v);
    if (isDate(this.xDomain[0])) {
      xAxis.tickFormat(d3.timeFormat('%m/%d/%Y'));
    }
    if (isDate(this.yDomain[0])) {
      yAxis.tickFormat(d3.timeFormat('%m/%d/%Y'));
    }

    // Allow for the callback.
    if (this.onAxis) {
      this.onAxis(this.x, xAxis);
      this.onAxis(this.y, yAxis);
    }

    this.svg.append('g')
      .attr('transform', `translate(${ this.pad[3] },${ this.origin.y })`)
      .attr('class', 'axis x')
      .call(xAxis);
    this.svg.append('g')
      .attr('transform', `translate(${ this.origin.x },0)`)
      .attr('class', 'axis y')
      .call(yAxis);
    // Slant non-numeric discrete Y axis tick labels.
    if (this.yDiscrete && !_.isNumber(this.yDomain[0])) {
      this.svg.selectAll('.y.axis text')
        .attr('transform', 'translate(-5,-20)rotate(-70)');
    }
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
  private createBrush() {
    // The callback functions.
    let isWithin = (x, y, box) =>
      x >= box[0][0] && x <= box[1][0] && y >= box[0][1] && y <= box[1][1];
    let isDataSelected = (d, i, box) =>
      this.valid[i] && isWithin(this.dx(d, i), this.dy(d, i), box);
    let selectedData = () => {
      // The selection bounding box.
      let box = d3.event.selection;
      // If some data points are selected, then map the
      // data to their selection state.
      // Otherwise, the default null is returned,
      // which signifies that all data points are shown.
      return box ? this.data.map((d, i) => isDataSelected(d, i, box)) : null;
    };

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
      this.svg.selectAll('.point')
        .transition()
        .delay(delay)
        .duration(0)
        .style('visibility', (d, i) => this.valid[i]);
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
      let selected = selectedData();
      // If there is a change, then trigger the select callback.
      if (selected !== this.selected) {
        this.select.emit(selected);
      }

      // Due to technical difficulties described below, we
      // interrupt the normally scheduled program as follows:
      //
      // Clear the brush. The bizarre move clear idiom is a D3 v4
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
      // official D3 work-around.
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
    let [rx1, rx2] = this.xScale.range();
    let miny = _.min(this.yScale.range());
    let maxy = _.max(this.yScale.range());
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
    // The valid X and Y values and means.
    let isValid = (d, i) => this.valid[i];
    let xAllValues = this.data.map(this.dx);
    let xValues = _.filter(xAllValues, isValid);
    let yAllValues = this.data.map(this.dy);
    let yValues = _.filter(yAllValues, isValid);
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
   * @param accessor {function|string} the X or Y value accessor or
   *   property path
   * @return the [min, max] domain
   */
  private getContinuousDomain(accessor) {
    let min = _.flow(_.minBy, accessor)(this.data, accessor);
    let max = _.flow(_.maxBy, accessor)(this.data, accessor);

    return [min, max];
  }
}
