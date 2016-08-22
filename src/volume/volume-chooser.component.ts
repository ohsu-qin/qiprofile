import {
  Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter
} from '@angular/core';

import { NouisliderDirective } from './nouislider.directive.ts';


@Component({
  selector: 'qi-volume-chooser',
  templateUrl: '/public/html/volume/volume-chooser.html',
  directives: [NouisliderDirective]
})

/**
 * The Volume number chooser component.
 *
 * @module volume
 * @class VolumeVolumeChooserComponent
 */
export class VolumeVolumeChooserComponent implements OnInit, OnChanges {
  /**
   * The volume object input.
   *
   * @property volume {Object}
   */
  @Input() volume;

  /**
   * The button enabled state.
   *
   * @property isEnabled {boolean}
   */
  @Input() isEnabled;

  /**
   * Forces the play state off.
   *
   * @property stopPlay {boolean}
   */
  @Input() stopPlay;

  /**
   * The volume number change event. This event is triggered by
   * {{#crossLink "VolumeVolumeChooserComponent/onChange"}}{{/crossLink}}.
   *
   * @property changed {EventEmitter}
   */
  @Output() changed: EventEmitter<number> = new EventEmitter(true);
  
  /**
   * This play event emits `true` to start looping over the time points,
   * `false` to stop.
   *
   * @property play {EventEmitter<boolean>}
   */
  @Output() play: EventEmitter<boolean> = new EventEmitter(true);
  
  /**
   * The selected volume number.
   *
   * @property volumeNumber {number}
   */
  volumeNumber: number;
  
  /**
   * Flag indicating whether to loop over the volumes.
   *
   * @property isPlaying {boolean}
   */
  isPlaying = false;
  
  /**
   * The slider configuration.
   *
   * @property config {Object}
   */
  config = {
    orientation: 'vertical',
    direction: 'rtl',
    connect: 'lower',
    behaviour: 'tap-drag',
    step: 1,
    pips: {
      mode: 'steps',
      // TODO - what does density do? http://refreshless.com/nouislider/pips/
      //   claims that density "pre-scale[s] the number of pips", whatever
      //   that means. Removing density here or setting it to 1 or 2 introduces
      //   extraneous pips. Setting it to 3 or above shows only the volume
      //   number, which is the desired behavior. Does this setting work with
      //   other volume counts? Why does it work how it does?
      density: 5
    }
  };
  
  /**
   * Sets the
   * {{#crossLink "VolumeVolumeChooserComponent/volumeNumber:property"}}{{/crossLink}}
   * model property to the input
   * {{#crossLink "VolumeVolumeChooserComponent/volume:property"}}{{/crossLink}}
   * _number_.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    this.volumeNumber = this.volume.number;
  }
  
  /**
   * If the input volume changed, then reset the
   * {{#crossLink "VolumeVolumeChooserComponent/volumeNumber:property"}}{{/crossLink}}
   * value.
   *
   * @method ngOnChange
   */
  ngOnChanges(changes: SimpleChanges) {
    let volChange = changes['volume'];
    if (volChange && !volChange.isFirstChange()) {
      let value = volChange.currentValue.number;
      if (value !== this.volumeNumber) {
        this.volumeNumber = value;
      }
    }
    
    let stopChange = changes['stopPlay'];
    if (stopChange && !stopChange.isFirstChange()) {
      if (stopChange.currentValue) {
        this.isPlaying = false;
      }
    }
  }
  
  /**
   * Forwards the volume number change event. This method
   * is bound to the `Nouislider.ngModelChange` callback.
   *
   * @method onChange
   * @param value the new volume number
   */
  onChange(value: number) {
    this.changed.emit(value);
  }
  
  /**
   * Toggles looping over the time points.
   *
   * @method togglePlay
   */
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    this.play.emit(this.isPlaying);
  }
  
  /**
   * @method volumeCount
   * @return {number} the number of volume parent images
   */
  volumeCount(): number {
    return this.volume.imageSequence.volumes.images.length;
  }
}
