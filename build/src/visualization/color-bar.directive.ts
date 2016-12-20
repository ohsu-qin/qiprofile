import * as _ from 'lodash';
import * as d3 from 'd3';
import {
  Directive, Input, ElementRef, OnChanges, SimpleChange, OnInit
} from '@angular/core';

@Directive({
  selector: '[qi-color-bar]'
})

/**
 * Draws an interpolated color bar. The data points
 * are mapped into the
 * (Inferno)[https://github.com/d3/d3-scale/blob/master/README.md#interpolateInferno]
 * color spectrum.
 *
 * @class ColorBarDirective
 */
export class ColorBarDirective implements OnChanges, OnInit {
  /**
   * The data object array.
   *
   * @property data {number[]}
   */
  @Input() data;

  /**
   * The optional value accessor property name or
   * property path. The default is to use the input
   * data directly.
   *
   * @property property {string}
   */
  @Input() property: string;

  /**
   * The additional data access argument.
   *
   * @property extra {any}
   */
  @Input() extra: any;

  /**
   * The [min, max] domain extent.
   * The default is the data min and max.
   *
   * @property max {number[]}
   */
  @Input() domain: number[];

  /**
   * The bar width
   *
   * @property width {number}
   */
  @Input() width;

  /**
   * The bar height
   *
   * @property height {number}
   */
  @Input() height;

  /**
   * The directive element.
   *
   * @property elementRef {ElementRef}
   */
  private elementRef: ElementRef;

  /**
   * The D3 SVG root group element.
   *
   * @property svg {d3.Selection<any>}
   */
  private svg: d3.Selection<any>;

  /**
   * The bar fill function.
   *
   * @property fill {function}
   */
  private fill: (d: any) => string|number;

  constructor(elementRef: ElementRef) {
    this.elementRef = elementRef;
  }

  ngOnChanges(changes: SimpleChange) {
    let change = changes['data'];
    if (change && !change.isFirstChange()) {
      // Reset the fill based on the new values.
      this.svg.selectAll('.bar')
        .data(change.currentValue)
        .attr('fill', this.fill);
    }
  }

  ngOnInit() {
    // The value access function.
    let accessor = this.property ?
                   d => _.get(d, this.property) :
                   _.identity;

    // The domain.
    let domain =
      this.domain ||
      [d3.min(this.data, accessor), d3.max(this.data, accessor)];

    // The color mapper.
    let color = d3.scaleSequential(d3.interpolateInferno)
      .domain(domain);

    // Make the bar fill function.
    this.fill = (d) => {
      let value = _.isNil(d) ? null : accessor(d);
      return _.isNil(value) ? 'none' : color(value);
    };

    // The root SVG group element.
    this.svg = d3.select(this.elementRef.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    // Build the color bar.
    let barWidth = this.width / this.data.length;
    this.svg.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('width', barWidth)
      .attr('height', this.height)
      .attr('class', 'bar')
      .attr('x', (d, i) => barWidth * i)
      .attr('y', 0)
      .attr('fill', this.fill);
  }
}
