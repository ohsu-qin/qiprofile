import * as _ from 'lodash';
import * as d3 from 'd3';
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
   * _Note_: D3 clips the top and right X axis tick, so the margin
   * should be at least 6 pixels.
   *
   * @property margin {number[]}
   */
  @Input() margin: number[] = [6, 6, 6, 6];

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
   * Pad the D3 charts by 40 pixels to accomodate the axes.
   *
   * @property pad
   */
  private const pad = 30;

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

    if (isChanged('x') || isChanged('y')) {
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
    // Draw the axes.
    this.drawAxes();

    // Reset the data points with a fandy index-dependent
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
   * @private
   */
  private filterValidData() {
    // The X and Y value accessors.
    let x = d => _.get(d, this.x);
    let y = d => _.get(d, this.y);
    // The validity checkers.
    let validX = _.flow(x, _.isFinite);
    let validY = _.flow(y, _.isFinite);
    let isValid = d => validX(d) && validY(d);
    // The validity flag array.
    this.valid = this.data.map(isValid);
    if (!_.some(this.valid)) {
      throw new Error("There is no valid data point for properties" +
                      ` X ${ this.x } and Y ${ this.y } `);
    }
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
    this.svg.selectAll('circle')
      .filter(isHidden)
      .transition()
      .delay(delay)
      .duration(duration)
      .on('end', onEnd)
      .style('visibility', 'hidden');
    this.svg.selectAll('circle')
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

    this.xScale = d3.scaleLinear()
      .nice()
      .range([this.margin[3], this.width - this.pad - this.margin[1]]);
    this.yScale = d3.scaleLinear()
      .nice()
      .range([this.height - this.pad - this.margin[2], this.margin[0]]);

    // Define the domains and accessors.
    this.configurePlot();

    // The value accessors.
    let xValue = (d, i) => {
      return this.valid[i] ? _.get(d, this.x) : this.xDomain[0];
    };
    let yValue = (d, i) => {
      return this.valid[i] ? _.get(d, this.y) : this.yDomain[0];
    };

    // The data point coordinate functions.
    this.dx = (d, i) => this.xScale(xValue(d, i));
    this.dy = (d, i) => this.yScale(yValue(d, i));

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
      .attr('class', 'scatter-plot')
      .attr('viewBox', `0 0 ${ this.width } ${ this.height }`)
      .attr('width', this.width)
      .attr('height', this.height);

    // Draw the axes.
    this.drawAxes();

    // The data points plot portion of the chart.
    let plot = this.svg.append('g')
      .attr('transform', `translate(${ this.pad },0)`)
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
    // The X and Y [min, max] domains.
    this.xDomain = this.getDomain(this.x);
    this.yDomain = this.getDomain(this.y);
    this.xScale.domain(this.xDomain);
    this.yScale.domain(this.yDomain);

    // Filter for the well-defined data points.
    this.filterValidData();
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
    let x1 = _.first(this.xDomain);
    let x2 = _.last(this.xDomain);
    let y1 = (lsq.slope * x1) + lsq.intercept;
    let y2 = (lsq.slope * x2) + lsq.intercept;

    // The sole trend line datum is the array of line start
    // and end point domain values. The coordinates are then
    // scaled from this array.
    let trendData = [[x1, y1, x2, y2]];
    // Draw the trend line.
    plot.selectAll('.trendline')
      .data(trendData)
      .enter().append('line')
        .attr('class', 'trendline')
        .attr('x1', d => this.xScale(d[0]))
        .attr('y1', d => this.yScale(d[1]))
        .attr('x2', d => this.xScale(d[2]))
        .attr('y2', d => this.yScale(d[3]));

    // Show the r-square value.
    let rSquareData = [[lsq.rSquare, x2, y2]];
    plot.selectAll('.r-squared')
      .data(rSquareData)
      .enter().append('text')
        .text(d => `r² = ${ d[0].toFixed(2) }`)
        .attr('class', 'r-squared')
        .attr('x', d => this.xScale(d[1]) - 40)
        .attr('y', d => this.yScale(d[2]) - 10);
  }

  private drawAxes() {
    // Make the axes.
    let xAxis = d3.axisBottom(this.xScale);
    let yAxis = d3.axisLeft(this.yScale);

    // Allow for a callback.
    if (this.onAxis) {
      this.onAxis(this.x, xAxis);
      this.onAxis(this.y, yAxis);
    }

    // The number of pixels between the top and the origin.
    let yOffset = this.height - this.pad - this.margin[2];
    this.svg.append('g')
      .attr('transform', `translate(${ this.pad },${ yOffset })`)
      .attr('class', 'axis x')
      .call(xAxis);

    // The origin is pushed right by the pad + left margin.
    let xOffset = this.pad + this.margin[3];
    this.svg.append('g')
      .attr('transform', `translate(${ xOffset },0)`)
      .attr('class', 'axis y')
      .call(yAxis);
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
    let isDataSelected = (d, i, box) => isWithin(this.dx(d, i), this.dy(d, i), box);
    let selectedData = () => {
      // The selection bounding box.
      let box = d3.event.selection;
      // If some data points are selected, then map the
      // data to their selection state.
      // Otherwise, the default null is returned,
      // which signifies that all data points are shown.
      return box ? this.data.map((d, i) => isDataSelected(d, i, box)) : null;
    };

    // Make the brush.
    let brush = d3.brush();

    // Add the callbacks:

    let onBrushStart = () => {
      // Reshow all elements in this chart until the brush
      // selection is completed.
      let delay = this.pendingTransitionTime;
      this.svg.selectAll('circle')
        .transition()
        .delay(delay)
        .duration(0)
        .style('visibility', null);
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
    let domain = _.filter(this.data, isValid);
    let xValues = _.map(domain, this.x);
    let yValues = _.map(domain, this.y);
    let xMean = _.mean(xValues);
    let yMean = _.mean(yValues);

    // The sums of squares.
    let diffSquare = (d, delta) => Math.pow(d - delta, 2);
    let dxSquares = xValues.map(d => diffSquare(d, xMean));
    let xx = _.sum(dxSquares);
    let dySquares = yValues.map(d => diffSquare(d, yMean));
    let yy = _.sum(dySquares);
    // If all of the X values or all of the Y values are equal,
    // then correlation is undefined so bail.
    if (xx === 0 || yy === 0) {
      return null;
    }
    let dxy = (i) => (xValues[i] - xMean) * (yValues[i] - yMean);
    let crossProduct = _.range(domain.length).map(dxy);
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
   * @method getDomain
   * @private
   * @param property {string} the X or Y property path
   * @return the [min, max] domain
   */
  private getDomain(property) {
    // Note that this.valid is not yet defined, so we find the
    // max and min of this.data instead. this.data might include
    // invalid values, but these are ignored by lodash min and max.
    let values = _.map(this.data, property);
    let min = _.min(values);
    let max = _.max(values);

    return [min, max];
  }
}
