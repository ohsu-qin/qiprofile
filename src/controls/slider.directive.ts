import * as _ from 'lodash';
import * as noUiSlider from 'nouislider';
import {
  Directive, ElementRef, HostBinding, EventEmitter,
  Input, Output, OnInit, OnChanges, SimpleChanges
} from '@angular/core';

function toValue(value: string[]): number|number[] {
  if (value.length === 1) {
    return parseFloat(value[0]);
  } else if (value.length > 1) {
    return value.map(parseFloat);
  } else {
    return 0;
  }
}

@Directive({
  selector: '[qiSlider]'
})

/**
 * The slider wrapper. This directive is adapted from the
 *  `ohsu-qin/ng2-nouislider` fork of `ng2-nouislider`.
 *
 * `ng2-nouislider` is forked to fix the following bugs:
 * * ng2-nouislider does not detect changes to the input value.
 * * ng2-nouislider does not propagate changes to the parent
 *   component.
 *
 * The base `ng2-nouislider` implementation operates under a
 * misconception fostered by misleading Angular documentation
 * that a custom control can implement Angular two-way `[(ngModel)]`
 * binding (cf.
 * https://github.com/angular/angular/issues/6639#issuecomment-242310492
 * ). The implementation below clears up that misconception and
 * provides both input and output change detection.
 *
 * The fork `nouislider.ts` is then copied to this `qiprofile` source
 * code directory because the jspm install of the fork GitHub project
 * results in the following import error:
 *
 *     Error loading http://localhost:3000/angular2/core as "angular2/core" from
 *     http://localhost:3000/jspm_packages/github/ohsu-qin/ng2-nouislider@0.3.0/nouislider.js
 *
 * This error occurs even though there is no reference to "angular2/core"
 * in the library, only "@angular/core".
 *
 * Although it would be preferable to place `nouislider.ts` in the
 * `lib` directory, that in turn results in the infamous `Unexpected token`
 * jspm error. This opaque error has several obscure causes, but none
 * seem to apply to this case. For an unknown reason, placing the file
 * into this `src/controls` directory works. Perhaps `jspm.config.js`
 * is missing a magic incantation for the `lib` directory.
 *
 * @module controls
 * @class SliderDirective
 */
export class SliderDirective implements OnInit, OnChanges {
  /**
   * The slider HTML element.
   *
   * @property el {ElementRef}
   */
  public el: ElementRef;

  /**
   * The noUiSlider object.
   *
   * @property slider {Object}
   */
  public slider: Object;

  /**
   * The optional slider starting value.
   *
   * @property value {number}
   */
  @Input() value: number;

  /**
   * The optional noUiSlider name.
   *
   * @property name {string}
   */
  @Input() name: string;

  /**
   * The required slider minimum value.
   *
   * @property min {number}
   */
  @Input() min: number;

  /**
   * The required slider maximum value.
   *
   * @property max {number}
   */
  @Input() max: number;

  /**
   * The optional slider jump step increment. The default is
   * a fluent slider.
   *
   * @property step {number}
   */
  @Input() step: number;

  /**
   * The optional noUiSlider behaviour.
   *
   * @property behaviour {string}
   */
  @Input() behaviour: string;

  /**
   * The optional noUiSlider handle bar connect flag.
   *
   * @property connect {boolean}
   */
  @Input() connect: boolean;

  /**
   * The optional noUiSlider supplementary configuration.
   * This configuration overrides any other input
   * configuration properties.
   *
   * @property config {Object}
   */
  @Input() config = {};

  /**
   * The optional slider height in pixels.
   *
   * @property height {number}
   */
  @Input() height: number;

  /**
   * The optional slider width in pixels.
   *
   * @property width {number}
   */
  @Input() width: number;

  /**
   * The value change emitter.
   *
   * @property changed {function}
   */
  @Output() changed: EventEmitter<any> = new EventEmitter(true);

  /**
   * The slider value. This value is initially set to the
   * *value* input property bound in the parent view.
   * Subsequently, the value is changed when either the slider
   * value or the *value* property is changed.
   *
   * @property _value {number}
   * @private
   */
  private _value: number;

  public constructor(el: ElementRef) {
    this.el = el;
  }

  @HostBinding('style.height.px') height;

  @HostBinding('style.width.px') width;

  ngOnInit(): void {
    if (_.isNil(this.min)) {
      throw new Error("The slider is missing the min input variable");
    }
    if (_.isNil(this.max)) {
      throw new Error("The slider is missing the max input variable");
    }
    // The default initial value is the minimum.
    if (_.isNil(this._value)) {
      this._value = this.min;
    }

    // The noUiSlider configuration.
    let config = JSON.parse(JSON.stringify({
      behaviour: this.behaviour,
      connect: this.connect,
      start: this._value,
      step: this.step,
      range: {min: this.min, max: this.max}
    }));
    Object.assign(config, this.config);

    // Make the slider.
    this.slider = noUiSlider.create(this.el.nativeElement, config);
    // Handle the value set event.
    this.slider.on('set', (sliderValue: any) => {
      let value = toValue(sliderValue);
      if (!_.isEqual(this._value, value)) {
        this._value = value;
        this.changed.emit(value);
      }
    });
  }

  /**
   * Handles a change to the slider value that arises externally
   * rather than by the slider user action. The change does not
   * precipitate a
   * {{#crossLink "SliderDirective/changed:property"}}{{/crossLink}}
   * event.
   *
   * @method ngOnChanges
   */
  public ngOnChanges(changes: SimpleChanges) {
    let valueChange = changes['value'];
    if (valueChange) {
      this._value = valueChange.currentValue;
      if (this.slider) {
        this.slider.set(this._value);
      }
    }
  }
}
