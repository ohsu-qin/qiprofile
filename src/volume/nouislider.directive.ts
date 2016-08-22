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

import {
  ControlValueAccessor
} from '@angular/forms';

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
 * `nouislider.ts` is copied from the
 *  `ohsu-qin/ng2-nouislider`
 * fork of `ng2-nouislider`.
 * 
 * The `ng2-nouislider` is forked to fix the following bug:
 * 
 * * ng2-nouislider does not detect changes to the ngModel input.
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
 * `lib/` directory, that in turn results in the infamous `Unexpected token`
 * jspm error. This opaque error has several obscure causes, but none
 * seem to apply to this case. For an unknown reason, copying the file
 * into the directory where it is imported works. Perhaps `jspm.config.js`
 * is missing a magic incantation for the 'lib' directory.
 * 
 * TODO - revisit this when jspm and Angular 2 stabilize in 2017.
 *
 * @module volume
 * @class NouisliderDirective
 */
export class NouisliderDirective implements ControlValueAccessor, OnInit, OnChanges {
  public el: ElementRef;
  public slider: any;
  public value: any;
  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  @Input() name: string;

  @Input() behaviour: string;
  @Input() connect: boolean;
  @Input() limit: number;
  @Input() min: number;
  @Input() max: number;
  @Input() step: number;
  @Input() config: any = {};
  @Input() ngModel: number | number[];
  @Output() ngModelChange: EventEmitter<any> = new EventEmitter(true);

  public constructor(el: ElementRef) {
    this.el = el;
  }

  ngOnInit(): void {
    let inputsConfig = JSON.parse(JSON.stringify({
      behaviour: this.behaviour,
      connect: this.connect,
      limit: this.limit,
      start: this.ngModel,
      step: this.step,
      range: this.config.range || {min: this.min, max: this.max}
    }));

    this.slider = noUiSlider.create(
      this.el.nativeElement,
      Object.assign(this.config, inputsConfig)
    );

    this.slider.on('set', (value: any) => {
      this.writeValue(toValue(value));
    });
  }
  
  public ngOnChanges(changes: SimpleChanges) {
    let change = changes['ngModel'];
    if (change && !change.isFirstChange()) {
      this.value = change.currentValue;
      if (this.slider) {
        this.slider.set(this.value);
      }
    }
  }

  public writeValue(value: any): void {
    if (this.value === value || String(this.value) === String(value)) {
      return;
    }

    this.ngModelChange.emit(value);
    this.value = value;
    if (this.slider) {
      // Note: slider.set recurses to this writeValue function, since
      // this function is registered as a slider.set callback in the
      // constructor. However, the extraneous call with the new value
      // is a no-op because this.value now matches value.
      // TODO - although probably benign, this function should be
      ///  reworked to avoid even the hint of an infinite loop.
      this.slider.set(value);
    }
  }

  // TODO - these register functions don't appear to serve any purpose.
  //   Clarify or remove.
  
  public registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }
}
