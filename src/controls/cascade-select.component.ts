import * as _ from 'lodash';
import {
  Component, Input, Output, OnInit, OnChanges, EventEmitter
} from '@angular/core';

@Component({
  selector: 'qi-cascade-select',
  templateUrl: '/public/html/controls/cascade-select.html'
})

/**
 * The cascade select component has subselects.
 *
 * @module controls
 * @class CascadeSelectComponent
 */
export class CascadeSelectComponent implements OnInit, OnChanges {
  /**
   * The select choices Object.
   *
   * @property choices {Object}
   */
  @Input() choices: Object;

  /**
   * The initial selection path for this chooser and the cascaded
   * child choosers.
   *
   * @property selectionPath {string[]}
   */
  @Input() set selectionPath(value: string | string[]) {
    this._selectionPath = _.isString(value) ? value.split('.') : value;
  }

  /**
   * The cascaded selection path change event.
   *
   * @property selectionChange {EventEmitter<any>}
   */
  @Output() selectionChange: EventEmitter<any> = new EventEmitter(true);

  get selectionPath(): string[] {
    return this._selectionPath;
  }

  /**
   * The selected choice.
   *
   * @property selection{string}
   */
  selection: string;

  /**
   * If this chooser is not terminal, then the child chooser choices
   * are the keys of the
   * {{#crossLink "CascadeSelectComponent/choices:property"}}{{/crossLink}}
   * value for this select's
   * {{#crossLink "CascadeSelectComponent/selection:property"}}{{/crossLink}}.
   * If this chooser is terminal, then there are no child choices.
   *
   * @property childChoices{Object}
   */
  childChoices: Object;

  /**
   * The internal
   * {{#crossLink "CascadeSelectComponent/selectionPath:property"}}{{/crossLink}}
   * representation.
   *
   * @property _selectionPath {string[]}
   * @private
   */
  private _selectionPath: string[];

  constructor() {}

  /**
   * Sets the
   * {{#crossLink "CascadeSelectComponent/selection:property"}}{{/crossLink}}
   *
   * @method ngOnChanges
   */
  ngOnInit() {
    if (_.isEmpty(this.selectionPath)) {
      this.selection = _.keys(this.choices)[0];
    } else {
      this.selection = this.selectionPath[0];
    }
    this.onSelect(true);
  }

  /**
   * Handle a
   * {{#crossLink "CascadeSelectComponent/choices:property"}}{{/crossLink}}
   * change by resetting the
   * {{#crossLink "CascadeSelectComponent/selection:property"}}{{/crossLink}}
   * if the previous value is no longer available in the new choices.
   *
   * @method ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    let choicesChange = changes['choices'];
    if (choicesChange && !choicesChange.isFirstChange()) {
      if (_.isEmpty(this.choices)) {
        throw new Error("The select choices cannot be empty");
      }
      if (!(this.selection in this.choices)) {
        this.selection = _.keys(this.choices)[0];
      }
      this.onSelect(true);
    }
  }

  /**
   * @method choiceKeys
   * @return {string[]} the sorted
   *   {{#crossLink "CascadeSelectComponent/choices:property"}}{{/crossLink}}
   *   object keys.
   */
  choiceKeys(): string[] {
    return _.keys(this.choices).sort();
  }

  /**
   * Sets the
   * {{#crossLink "CascadeSelectComponent/selection:property"}}{{/crossLink}}
   * to the given choice.
   * In addition, if the choice value is terminal (i.e., if
   * {{#crossLink "CascadeSelectComponent/isTerminal}}{{/crossLink}}
   * returns `true`), then
   * {{#crossLink "CascadeSelectComponent/value:property"}}{{/crossLink}}
   * is triggered with the
   * {{#crossLink "CascadeSelectComponent/choices:property"}}{{/crossLink}}
   * value for the *choice* property.
   *
   * @method onSelectChange
   * @param choice {string} the choice text
   */
  onSelectChange(choice: string) {
    this.selection = choice;
    this.onSelect();
  }

  /**
   * Forwards the select path to the parent listener.
   * The select path is formed by prepending this select's
   * selection to the given child select path.
   *
   * @method onTerminalSelect
   * @param value {string} the cascaded terminal selection path
   */
  onChildSelect(value: string) {
    let path = `${ this.selection }.${ value }`;
    this.selectionChange.emit(path);
  }

  /**
   * If the choice value is terminal (i.e., if the value is not a plain
   * Javascript object, then trigger
   * {{#crossLink "CascadeSelectComponent/value:property"}}{{/crossLink}}
   * with the associated
   * {{#crossLink "CascadeSelectComponent/choices:property"}}{{/crossLink}}
   * value.
   * Otherwise, set the
   * {{#crossLink "CascadeSelectComponent/childChoices:property"}}{{/crossLink}}.
   *
   * @method onSelect
   * @private
   * @param defer {boolean} whether to delay emitting changes until
   *   after the current digest cycle completes
   */
  private onSelect(defer=false) {
    // If defer is set, then recurse without defer in the next digest cycle.
    if (defer) {
      let recurse = () => { this.onSelect(); };
      setTimeout(recurse, 0);
      return;
    }
    // The child choices or terminal property path.
    let value = this.choices[this.selection];
    if (!value) {
      throw new Error('The selection choice is not recognized: ' +
                      this.selection);
    }
    if (_.isPlainObject(value)) {
      this.childChoices = value;
    } else {
      this.selectionChange.emit(this.selection);
    }
  }
}
