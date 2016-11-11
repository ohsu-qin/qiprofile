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
   * The optional value {property: {value: label}}
   * associative object, where *property* is the terminal
   * select property.
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
   * @property xSelectionChoices {Object}
   */
  @Input() xSelectionChoices: Object;

  /**
   * The Y axis select options hierarchy Object.
   *
   * @property ySelectionChoices {Object}
   */
  @Input() ySelectionChoices: Object;

  /**
   * The initial X chooser path.
   *
   * @property xSelectionPath {string[]}
   */
  @Input() xSelectionPath: string[];

  /**
   * The initial Y chooser path.
   *
   * @property ySelectionPath {string[]}
   */
  @Input() ySelectionPath: string[];

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
   *.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    if (!this.xSelectionPath) {
      throw new Error('The correlation is missing the X selection path.');
    }
    this.x = _.get(this.xSelectionChoices, this.xSelectionPath);
    if (!this.x) {
      throw new Error('The correlation property was not found for the X' +
                      ' selection path ' + JSON.stringify(this.xSelectionPath));
    }
    this.xValueChoices = _.get(this.valueChoices, _.last(this.xSelectionPath));
    if (!this.ySelectionPath) {
      throw new Error('The correlation is missing the Y selection path.');
    }
    this.y = _.get(this.ySelectionChoices, this.ySelectionPath);
    if (!this.y) {
      throw new Error('The correlation property was not found for the Y' +
                      ' selection path ' + JSON.stringify(this.ySelectionPath));
    }
    this.yValueChoices = _.get(this.valueChoices, _.last(this.ySelectionPath));
  }

  onXChange(path: string) {
    this.x = _.get(this.xSelectionChoices, path);
    this.xValueChoices = _.get(this.valueChoices, _.last(path));
  }

  onYChange(path: string) {
    this.y = _.get(this.ySelectionChoices, path);
    this.yValueChoices = _.get(this.valueChoices, _.last(path));
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
