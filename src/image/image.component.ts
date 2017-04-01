import {
  Component, Input, Output, EventEmitter, OnChanges, AfterViewChecked,
  OnDestroy, SimpleChanges
} from '@angular/core';

import { PapayaService } from './papaya.service.ts';

@Component({
  selector: 'qi-image',
  templateUrl: '/public/html/image/image.html'
})

/**
 * The image display component.
 *
 * @class ImageComponent
 * @module image
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
   * The loaded event.
   *
   * @property loaded {EventEmitter}
   */
  @Output() loaded = new EventEmitter();

  /**
   * The coordinate change event.
   *
   * @property coordinateChanged {EventEmitter}
   */
  @Output() coordinateChanged = new EventEmitter();

  /**
   * The error event.
   *
   * @property error {EventEmitter}
   */
  @Output() error = new EventEmitter();

  /**
   * Flag indicating whether this component has already
   * started (or restarted) Papaya.
   *
   * Note: a new component instance is created when the browser returns
   * to the parent page. However, Papaya is a global service and
   * retains the Papaya viewer and content during the navigation.
   * Therefore, this flag marks whether *this instance* called the
   * {{#crossLink "PapayaService/start"}}{{/crossLink}} method.
   * That service method calls Papaya restart if Papaya is already
   * started.
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
      let better = 'The server could not read the' +
                   ` ${ this.image.title } file ${ this.image.name }`;
      message = message.replace(notFoundPrefix, better);
      // Trigger the bound error output.
      this.error.emit(message);
    };
    this.papaya.errorHandler = onError;

    // Post-load processing.
    let onFinishedLoading = (contents: Object) => {
      // Set the image contents property when loaded.
      this.image.contents = contents;
      // Trigger the bound loaded output.
      this.loaded.emit(this.image);
    };
    this.papaya.finishedLoadingCallback = onFinishedLoading;

    // Coordinate change processing.
    let onCoordinateChanged = (coordinate: Object) => {
      // Trigger the bound output.
      this.coordinateChanged.emit(coordinate);
    };
    this.papaya.coordinateChangedCallback = onCoordinateChanged;
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
    // If the input is not a place-holder without a file name
    // and this component instance has not already started
    // Papaya, then start or restart Papaya. See the isStarted
    // property doc for more information.
    if (this.image.name && !this.isStarted) {
      if (this.papaya.isInitialized()) {
        this.papaya.restart(this.image);
      } else {
        this.papaya.start(this.image);
        this.isStarted = true;
      }
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
    // Note - we need to check the isStarted flag as well as
    //   change.isFirstChange() because a change might already be
    //   issued when the place-holder image is replaced by the
    //   fetched image.
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
