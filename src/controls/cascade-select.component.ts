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
   * The select options Object.
   *
   * @property options {Object}
   */
  @Input() options: Object;

  /**
   * The initial selected option path for this and the
   * cascaded selects.
   *
   * @property selOptionPath {string[]}
   */
  @Input() selOptionPath: string[] = [];

  /**
   * The selected option for this select.
   *
   * @property selOption{string}
   */
  selOption: string;

  /**
   * If this select is not terminal, then the child select options
   * are the keys of the
   * {{#crossLink "CascadeSelectComponent/options:property"}}{{/crossLink}}
   * value for this select's
   * {{#crossLink "CascadeSelectComponent/selOption:property"}}{{/crossLink}}.
   * If this select is terminal, then there are no child options.
   *
   * @property childOptions{Object}
   */
  childOptions: Object;

  /**
   * The terminal cascaded path selection.
   *
   * @property value {EventEmitter<any>}
   */
  @Output() value: EventEmitter<any> = new EventEmitter(true);

  constructor() {}

  /**
   * Sets the
   * {{#crossLink "CascadeSelectComponent/selOption:property"}}{{/crossLink}}
   *
   * @method ngOnChanges
   */
  ngOnInit() {
    if (_.isEmpty(this.selOptionPath)) {
      this.selOption = _.keys(this.options)[0];
    } else {
      this.selOption = this.selOptionPath[0];
    }
    this.onOptionChange(true);
  }

  /**
   * Handle a
   * {{#crossLink "CascadeSelectComponent/options:property"}}{{/crossLink}}
   * change by resetting the
   * {{#crossLink "CascadeSelectComponent/selOption:property"}}{{/crossLink}}
   * if the previous value is no longer available in the new options.
   *
   * @method ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    let optionsChange = changes['options'];
    if (optionsChange && !optionsChange.isFirstChange()) {
      if (_.isEmpty(this.options)) {
        throw new Error("The select options cannot be empty")
      }
      if (!(this.selOption in this.options)) {
        this.selOption = _.keys(this.options)[0];
      }
      this.onOptionChange(true);
    }
  }

  /**
   * @method optionKeys
   * @return {string[]} the sorted
   *   {{#crossLink "CascadeSelectComponent/options:property"}}{{/crossLink}}
   *   object keys.
   */
  optionKeys(): string[] {
    return _.keys(this.options).sort();
  }

  /**
   * Sets the
   * {{#crossLink "CascadeSelectComponent/selOption:property"}}{{/crossLink}}
   * to the given option.
   * In addition, if the option value is terminal (i.e., if
   * {{#crossLink "CascadeSelectComponent/isTerminal}}{{/crossLink}}
   * returns `true`), then
   * {{#crossLink "CascadeSelectComponent/value:property"}}{{/crossLink}}
   * is triggered with the
   * {{#crossLink "CascadeSelectComponent/options:property"}}{{/crossLink}}
   * value for the *option* property.
   *
   * @method onSelect
   * @param option {string} the option text
   */
  onSelect(option: string) {
    this.selOption = option;
    this.onOptionChange();
  }

  /**
   * Forwards the child select terminal value to the parent
   * listener.
   *
   * @method onTerminalValue
   * @param value {any} the cascaded terminal selection value
   */
  onTerminalValue(value: any) {
    this.value.emit(value);
  }

  /**
   * If the option value is terminal (i.e., if the value is not a plain
   * Javascript object, then trigger
   * {{#crossLink "CascadeSelectComponent/value:property"}}{{/crossLink}}
   * with the associated
   * {{#crossLink "CascadeSelectComponent/options:property"}}{{/crossLink}}
   * value.
   * Otherwise, set the
   * {{#crossLink "CascadeSelectComponent/childOptions:property"}}{{/crossLink}}.
   *
   * @method onSelectOptionChange
   * @private
   * @param defer {boolean} whether to delay emitting changes until
   *   after the current digest cycle completes
   */
  private onOptionChange(defer=false) {
    // If defer is set, then recurse without defer in the next digest cycle.
    if (defer) {
      let recurse = () => { this.onOptionChange(); }
      setTimeout(recurse, 0);
      return;
    }
    // The child options or terminal terminal value.
    let value = this.options[this.selOption];
    if (_.isPlainObject(value)) {
      this.childOptions = value;
    } else {
      this.value.emit(value);
    }
  }
}
