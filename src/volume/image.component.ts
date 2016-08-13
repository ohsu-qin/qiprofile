import papaya from '../../lib/papaya.js';
import {
  Component, Input, Output, EventEmitter, AfterViewChecked
} from '@angular/core';

import ImageStore from '../image/image-store.coffee';

@Component({
  selector: 'qi-volume-image',
  templateUrl: '/public/html/volume/image.html'
})

/**
 * The Volume image display component.
 *
 * @module volume
 * @class VolumeImageComponent
 */
export class VolumeImageComponent implements AfterViewChecked {
  /**
   * The input image data object.
   *
   * @property image {Image}
   */
  @Input() image;
  
  /**
   * The error event.
   *
   * @property error {EventEmitter}
   */
  @Output() error = new EventEmitter();

  /**
   * Flag indicating whether Papaya has started.
   *
   * @property started
   * @private
   */
  private started = false;
  
  /**
   *  Monkey-patches the Papaya error handler to delegate to
   * the parent component error handler.
   *
   * @method constructor
   */
  constructor() {
    //
    papaya.viewer.Display.prototype.drawError = (message) => {
      // Improve a file read error.
      const notFoundPrefix = /^There was a problem reading that file \(.*\)/;
      let better = `The server could not read the ${ this.image.title } file ${ this.image.name }`;
      message = message.replace(notFoundPrefix, better);
      this.error.emit(message);
    };
  }
  
  /**
   *Render the volume image in the Papaya container.
   *
   * @method ngAfterViewChecked
   */
  ngAfterViewChecked() {
    // If the input is a place-holder without a file name or if
    // Papaya is already displayed, then bail.
    if (this.image.name && !this.started) {
      this.startPapaya();
      this.started = true;
    }
  }
  
  /**
   * Start Papaya.
   *
   * @method startPapaya
   * @private
   */
  private startPapaya() {
    // The image url.
    let url = ImageStore.location(this.image);
    
    // The awful Papaya data-passing kludge is to create a global variable
    // and set the container data-params attribute to the variable name.
    window.papayaParams = {
      worldSpace: true,
      showOrientation: true,
      images: [url]
    };

    // Start the renderer.
    papaya.Container.startPapaya();
    // Resize the viewer to work around the following Papaya bug:
    // * Papaya initial display fills in the canvas with the body element
    //   background color, but then resizes the canvas to a smaller dimension,
    //   which automatically refills it to black. That wipes out the padding
    //   between the slice views. Fixing this bug reveals another bug, where
    //   Papaya sets the Swap button css, which mysteriously creates a black
    //   strip on the right. Filling that strip has no effect for some reason.
    //   The work-around is to resize the viewer after the initial display.
    //   That causes a slight flicker, but we can live with that.
    papaya.Container.resizePapaya(null, true);
  }
}
