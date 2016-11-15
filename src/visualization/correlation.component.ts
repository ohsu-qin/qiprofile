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
   * @property domainSelection {boolean[]}
   */
  @Input() domainSelection: boolean[];

  /**
   * The optional value {path: {value: label}} associative object,
   * where *path* is the property select choice path.
   *
   * @property valueChoices {Object}
   */
  @Input() valueChoices: Object;

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
   * The X axis select options hierarchy Object.
   *
   * @property xPropertyChoices {Object}
   */
  @Input() xPropertyChoices: Object;

  /**
   * The Y axis select options hierarchy Object.
   *
   * @property yPropertyChoices {Object}
   */
  @Input() yPropertyChoices: Object;

  /**
   * The initial X chooser path.
   *
   * @property xPropertyPath {string[]}
   */
  @Input() xPropertyPath: string[];

  /**
   * The initial Y chooser path.
   *
   * @property yPropertyPath {string[]}
   */
  @Input() yPropertyPath: string[];

  /**
   * The select event transmits a user brush domain object select.
   *
   * @property select {EventEmitter<boolean[]>}
   */
  @Output() select: EventEmitter<boolean[]> = new EventEmitter(true);

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
   * The X {value: label} associative object.
   *
   * @property xValueChoices {Object}
   */
  xValueChoices: Object;

  /**
   * The Y {value: label} associative object.
   *
   * @property yValueChoices {Object}
   */
  yValueChoices: Object;

  /**
   * The correlation chart margin has a small pad at the top
   * for the cascade select control and bottom for spacing.
   *
   * @property margin {number[]}
   */
  const margin = [6, 0, 6, 0];

  constructor() {}

  /**
   * Sets the initial
   * {{#crossLink "CorrelationComponent/x:property}}{{/crossLink}}
   * and
   * {{#crossLink "CorrelationComponent/y:property}}{{/crossLink}}
   * property paths and the
   * {{#crossLink "CorrelationComponent/xValueChoices:property}}{{/crossLink}}
   * and
   * {{#crossLink "CorrelationComponent/yValueChoices:property}}{{/crossLink}}
   * value choices.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    if (!this.xPropertyPath) {
      throw new Error('The correlation is missing the X selection path.');
    }
    this.x = _.get(this.xPropertyChoices, this.xPropertyPath);
    if (!this.x) {
      throw new Error('The correlation property was not found for the X' +
                      ' selection path ' + this.xPropertyPath);
    }
    this.xValueChoices = _.get(this.valueChoices, this.xPropertyPath);
    if (!this.yPropertyPath) {
      throw new Error('The correlation is missing the Y selection path.');
    }
    this.y = _.get(this.yPropertyChoices, this.yPropertyPath);
    if (!this.y) {
      throw new Error('The correlation property was not found for the Y' +
                      ' selection path ' + this.yPropertyPath);
    }
    this.yValueChoices = _.get(this.valueChoices, this.yPropertyPath);
  }

  /**
   * Updates the
   * {{#crossLink "CorrelationComponent/x:property}}{{/crossLink}}
   * and
   * {{#crossLink "CorrelationComponent/xValueChoices:property}}{{/crossLink}}.
   *
   * @method onXChange
   */
  onXChange(path: string) {
    this.x = _.get(this.xPropertyChoices, path);
    this.xValueChoices = _.get(this.valueChoices, path);
  }

  /**
   * Updates the
   * {{#crossLink "CorrelationComponent/y:property}}{{/crossLink}}
   * and
   * {{#crossLink "CorrelationComponent/yValueChoices:property}}{{/crossLink}}.
   *
   * @method onYChange
   */
  onYChange(path: string) {
    this.y = _.get(this.yPropertyChoices, path);
    this.yValueChoices = _.get(this.valueChoices, path);
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
