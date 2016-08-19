import { Nouislider } from 'ng2-nouislider';
import {
  Component, OnInit, Input, Output, EventEmitter
} from '@angular/core';

@Component({
  selector: 'qi-volume-chooser',
  templateUrl: '/public/html/volume/volume-chooser.html',
  directives: [Nouislider]
})

/**
 * The Volume number chooser component.
 *
 * @module volume
 * @class VolumeVolumeChooserComponent
 */
export class VolumeVolumeChooserComponent implements OnInit {
  /**
   * The volume object input.
   *
   * @property volume {Object}
   */
  @Input() volume;

  /**
   * The volume number change event. This property is bound to
   * the `Nouislider.ngModelChange` callback.
   *
   * @property changed {EventEmitter}
   */
  @Output() changed: EventEmitter<number> = new EventEmitter(true);
  
  /**
   * The selected volume number.
   *
   * @property onChange {number}
   */
  volumeNumber: number;
  
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
   * Sets the *volumeNumber* model property.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    this.volumeNumber = this.volume.number;
  }
  
  /**
   * Forwards the volume number change to this component's
   * {{#crossLink "VolumeVolumeChooserComponent/changed:property"}}{{/crossLink}}
   * callback.
   *
   * @method onChange
   * @param event {EventEmitter} the slider value change event
   */
  onChange(value: number) {
    this.changed.emit(value);
  }
  
  /**
   * @method volumeCount
   * @return {number} the number of volume parent images
   */
  volumeCount(): number {
    return this.volume.imageSequence.volumes.images.length;
  }
}
