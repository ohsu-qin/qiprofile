import * as _ from 'lodash';
import {
  Component, Input, Output, OnInit, EventEmitter
} from '@angular/core';

@Component({
  selector: 'qi-correlation',
  templateUrl: '/public/html/visualization/correlation.html'
})

/**
 * The correlation component coordinates X, Y property selection
 * and data series display.
 *
 * @module visualization
 * @class CorrelationComponent
 */
export class CorrelationComponent implements OnInit {
  /**
   * The data object array.
   *
   * @property data {Object[]}
   */
  @Input() data: Object[];

  /**
   * This input domain filter is relayed from this component
   * to the embedded
   * {{#crossLink "ScatterPlotDirective/selection:property}}{{/crossLink}}.
   *
   * @property selection {boolean[]}
   */
  @Input() selection: boolean[];

  /**
   * The optional color chooser property path.
   *
   * @property color {string}
   */
  @Input() color: string;

  /**
   * The optional symbol type chooser function.
   *
   * @property symbolType {function}
   */
  @Input() symbolType: (d: Object) => string;

  /**
   * The X axis select options Object.
   *
   * @property xOptions {Object}
   */
  @Input() xOptions: Object;

  /**
   * The Y axis select options Object.
   *
   * @property yOptions {Object}
   */
  @Input() yOptions: Object;

  /**
   * The initial X option selection path.
   *
   * @property xSelOptionPath {string[]}
   */
  @Input() xSelOptionPath: string[];

  /**
   * The initial Y option selection path.
   *
   * @property ySelOptionPath {string[]}
   */
  @Input() ySelOptionPath: string[];

  /**
   * The X property path.
   *
   * @property x {string}
   */
  x: string;

  /**
   * The Y property path.
   *
   * @property y {string}
   */
  y: string;

  /**
   * The select event transmits a user brush domain object select.
   *
   * @property select {EventEmitter<boolean[]>}
   */
  @Output() select: EventEmitter<boolean[]> = new EventEmitter(true);

  constructor() {}

  /**
   * Sets the initial
   * {{#crossLink "CorrelationComponent/x:property}}{{/crossLink}}
   * and
   * {{#crossLink "CorrelationComponent/y:property}}{{/crossLink}}
   * property paths.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    this.x = _.reduce(this.xSelOptionPath, _.get, this.xOptions);
    this.y = _.reduce(this.ySelOptionPath, _.get, this.yOptions);
  }

  onXChange(property: string) {
    this.x = property;
  }

  onYChange(property: string) {
    this.y = property;
  }

  /**
   * Forwards the user brush select to the parent component.
   *
   * @method onBrushSelect
   * @param selected {boolean[]} the selected state
   */
  onBrushSelect(selected: boolean[]) {
    this.select.emit(selected);
  }
}
