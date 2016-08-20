import * as noUiSlider from 'nouislider';
import {
  Directive,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  Provider
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

export function toValue(value: string[]): number|number[] {
  if (value.length == 1) {
    return parseFloat(value[0]);
  } else if (value.length > 1) {
    return value.map(parseFloat);
  } else {
    return 0;
  }
}

const NOUISLIDER_CONTROL_VALUE_ACCESSOR = new Provider(
  NG_VALUE_ACCESSOR, {
    useExisting: forwardRef(() => Nouislider),
    multi: true
  });

@Directive({
  selector: '[nouislider]',
  providers: [NOUISLIDER_CONTROL_VALUE_ACCESSOR]
})
export class Nouislider implements ControlValueAccessor, OnInit, OnChanges {
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
    if (this.value == value || String(this.value) == String(value)) {
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
