/**
 * The slider components.
 *
 * @module slider
 * @main slider
 */

 import * as _ from 'lodash';
import * as noUiSlider from 'nouislider';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output
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
  selector: '[qi-slider]',
  providers: []
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
  public el: ElementRef;
  public slider: any;

  /**
   * The slider value. This value is initially set to the
   * `value` input property bound in the parent view.
   * Subsequently, the value is changed when either the slider
   * value or the `value` property is changed.
   */
  private _value: any;

  @Input() name: string;
  @Input() behaviour: string;
  @Input() connect: boolean;
  @Input() limit: number;
  @Input() min: number;
  @Input() max: number;
  @Input() step: number;
  @Input() config: any = {};
  @Input() value: number | number[];
  @Output() changed: EventEmitter<any> = new EventEmitter(true);

  public constructor(el: ElementRef) {
    this.el = el;
  }

  ngOnInit(): void {
    let inputsConfig = JSON.parse(JSON.stringify({
      behaviour: this.behaviour,
      connect: this.connect,
      limit: this.limit,
      start: this._value,
      step: this.step,
      range: this.config.range || {min: this.min, max: this.max}
    }));

    this.slider = noUiSlider.create(
      this.el.nativeElement,
      Object.assign(this.config, inputsConfig)
    );

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
   * precipitate a `changed` event.
   *
   * @method ngOnChanges
   */
  public ngOnChanges(changes: SimpleChanges) {
    let change = changes['value'];
    if (change) {
      this._value = change.currentValue;
      if (this.slider) {
        this.slider.set(this._value);
      }
    }
  }
}
