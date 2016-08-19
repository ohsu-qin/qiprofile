import {
  Component, Input, Output, EventEmitter, OnChanges, AfterViewChecked,
  OnDestroy, SimpleChanges
} from '@angular/core';

import { PapayaService } from './papaya.service.ts';

@Component({
  selector: 'qi-volume-image',
  templateUrl: '/public/html/image/image.html'
})

/**
 * The image display component.
 *
 * @module volume
 * @class ImageComponent
 */
export class ImageComponent
implements OnChanges, AfterViewChecked, OnDestroy {
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
   * @property isStarted
   * @private
   */
  private isStarted = false;
  
  /**
   * Monkey-patches the Papaya file loader and error handler.
   *
   * @method constructor
   * @param papaya
   */
  constructor(private papaya: PapayaService) {
    // The callbacks below are fat-arrow lambdas rather than functions
    // in order to circumvent the Javascript function call 'this'
    // nonsense by properly binding *this* to this component.
    let onError = (message: string) => {
      // Improve the file read error.
      const notFoundPrefix = /^There was a problem reading that file \(.*\)/;
      let better = `The server could not read the ${ this.image.title } file ${ this.image.name }`;
      message = message.replace(notFoundPrefix, better);
      // Trigger the bound error output.
      this.error.emit(message);
    };
    this.papaya.errorHandler = onError;

    // Set the image contents property when loaded.
    let onFinishedLoading = (contents: Object) => {
      this.image.contents = contents;
    };
    this.papaya.finishedLoadingCallback = onFinishedLoading;
  }
  
  /**
   * Unsets the
   * {{#crossLink "PapayaService/errorHandler:property"}}{{/crossLink}}
   * and
   * {{#crossLink "PapayaService/finishedLoadingCallback:property"}}{{/crossLink}}
   * properties.
   *
   * @method ngOnDestroy
   */
  ngOnDestroy() {
    this.papaya.errorHandler = null;
    this.papaya.finishedLoadingCallback = null;
  }
  
  /**
   * Render the image in the Papaya container.
   *
   * @method ngAfterViewChecked
   */
  ngAfterViewChecked() {
    // If the input is a place-holder without a file name or if
    // Papaya is already displayed, then bail.
    if (this.image.name && !this.isStarted) {
      this.papaya.start(this.image);
      this.isStarted = true;
    }
  }
  
  /**
   * If the image changed after the initial display, then swap in
   * the new image.
   *
   * @method ngOnChanges
   */
  ngOnChanges(changes: SimpleChanges) {
    // The image change. This should exist and should be the only
    // change, but it doesn't hurt to check.
    let change = changes['image'];
    // Note - we need to check the isStarted flag rather than
    //   change.isFirstChange() because a change is already issued
    //   when the place-holder image is replaced by the fetched
    //   image, even though display of the slider is guarded
    //   by an ngIf.
    if (change && this.isStarted && !change.isFirstChange()) {
      // A bound image value was changed to the current value.  
      let image = change.currentValue;
      // Papaya might have started with an invalid initial image.
      // In that case, it is not yet initialized, so do that now.
      // Otherwise, replace the current image.
      if (this.papaya.isInitialized()) {
        this.papaya.replaceImage(image);
      } else {
        this.papaya.restart(this.image);
      }
    }
  }
}
