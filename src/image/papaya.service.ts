import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import papaya from '../../lib/papaya.js';
import ImageStore from '../image/image-store.coffee';

@Injectable()

/**
 * The Papaya facade service.
 *
 * @class PapayaService
 */
export class PapayaService {
  /**
   * The function called when an image load error is encountered.
   *
   * @property errorHandler {function}
   */
  errorHandler: (message: string) => {};

  /**
   * The function called when image load is successfully completed.
   * The *contents* callback parameter is a {header, data} object,
   * where *header* is the loaded Papaya volume header and *data*
   * is the Papaya volume *imageData*.
   *
   * Note: this callback is called if and only if there is not an
   * image load error. The client is responsible for capturing an
   * error in the
   * {{#crossLink "PapayaService/errorHandler:property"}}{{/crossLink}}.
   *
   * @property finishedLoadingCallback {function}
   */
  finishedLoadingCallback: (contents: Object) => {};

  /**
   * The Papaya viewer if Papaya is started, undefined otherwise.
   * The Papaya viewer controls the display.
   *
   * @property viewer {any}
   * @readOnly
   */
  get viewer(): any {
    if (papaya.papayaContainers && papaya.papayaContainers[0]) {
      return papaya.papayaContainers[0].viewer;
    }
  }

  /**
   * Monkey-patches Papaya to disable drag-and-drop, replace the
   * error handler and inject a finished load callback.
   */
  constructor() {
    // Note: this constructor is called on refresh. In that case,
    //   Papaya is already monkey-patched. If we patch it again,
    //   the finishedLoad recursion will result in an infinite loop.
    //   Guard against that with the isPatched function.
    if (!this.isPapayaPatched()) {
      this.disableDnD();
      this.replaceErrorHandler();
      this.injectFinishedLoadingCallback();
    }
  }

  /**
   * In the case of a hot reload, a new PapayaService is created but
   * the previous patched Papaya library is retaioned. If that is the
   * case, the papaya.viewer.Viewer.prototype._finishedLoading patch
   * function already exists. This method returns whether that function
   * exists, which serves as a proxy for whether Papaya is already
   * monkey-patched.
   *
   * @method isPapayaPatched
   * @return {boolean} whether Papaya has already been monkey-patched
   */
  private isPapayaPatched(): boolean {
    return !!papaya.viewer.Viewer.prototype._finishedLoading;
  }

  /**
   * Returns whether the
   * {{#crossLink "PapayaService/viewer:property"}}{{/crossLink}}
   * has been successfully initialized.
   *
   * @method isInitialized
   * @return {boolean} whether the viewer is initialized
   */
  isInitialized(): boolean {
    return this.viewer && this.viewer.initialized;
  }

  /**
   * Starts Papaya on the given image and overlays.
   *
   * @method start
   * @param image {Image} the {{#crossLink "Image"}}{{/crossLink}}
   *   to display
   * @param overlays {Image[]} the image overlays
   */
  start(image: Object, overlays=[]) {
    // Papaya expectes an array with base image first followed by the
    // overlays.
    let images = [image].concat(overlays);
    // The image urls.
    let urls = images.map(ImageStore.location);
    // Delegate to the helper method.
    this.startPapaya(urls);
  }

  /**
   * Restarts Papaya on the given image and overlays.
   *
   * @method restart
   * @param image {Image} the {{#crossLink "Image"}}{{/crossLink}}
   *   to display
   * @param overlays {Image[]} the image overlays
   */
  restart(image: Object, overlays=[]) {
    // Make the urls array as in the start method above.
    let images = [image].concat(overlays);
    let urls = images.map(ImageStore.location);
    // Restart the viewer.
    this.viewer.restart(urls, true, false);
  }

  /**
   * Swaps a new image into the existing Papaya viewer and repaints the
   * slice views.
   *
   * @method replaceImage
   * @param image {Object} the new {{#crossLink "Image"}}{{/crossLink}}
   *   object
   */
  replaceImage(image: Object) {
    // The Papaya viewer controls the display.
    if (_.isNil(this.viewer)) {
      throw new Error("Papaya is not yet initialized");
    }
    // The Papaya volume (not the parent VolumeComponent volume).
    let volume = this.viewer.volume;

    let url = ImageStore.location(image);
    // Prepare for the swap.
    volume.urls = [];
    volume.rawData = [];
    volume.loadedFileCount = 0;
    // Reset the url and file name.
    volume.urls[0] = url;
    volume.fileName = _.last(url.split('/'));
    // The Papaya Volume class has two flavors of loaded flags,
    // which, of course, are undocumented, but are both used
    // for slightly different purposes.
    volume.loaded = volume.isLoaded = false;
    // If the image has already been loaded, then swap in the
    // previous image content and redraw.
    if (image.contents) {
      // Clobber the volume state.
      volume.header = image.contents.header;
      volume.imageData = image.contents.data;
      // The volume.finishedLoad callback.
      volume.onFinishedRead = () => {
        this.viewer.drawEmptyViewer();
        this.viewer.drawViewer(true, false);
      };
      // Simulate load finish.
      // Note: the Papaya undocumented viewer.finishedLoading function
      // differs from the undocumented volume.finishedLoad function.
      // We call finishedLoadingCallback as well to simulate a
      // complete Papaya image load async trigger chain.
      volume.finishedLoad();
      this.finishedLoadingCallback(image.contents);
    } else {
      // Adapted from the Volume ctor.
      let pad: boolean = volume.params && volume.params.padAllImages;
      volume.header = new papaya.volume.Header(pad);
      volume.imageData = new papaya.volume.ImageData(pad);
      // The load completion callback.
      let onLoaded = () => {
        // Check for an error.
        if (volume.error) {
          // Kill Papaya.
          this.viewer.resetViewer();
          this.viewer.drawEmptyViewer("Black");
          this.viewer.drawHelpMessage();
          this.viewer.container.display.drawError(volume.error.message);
        } else {
          // Redraw the viewer.
          this.viewer.drawEmptyViewer();
          this.viewer.drawViewer(true, false);
          // Patch in the load callback to cache the content.
          if (this.finishedLoadingCallback) {
            let contents = {
              header: volume.header,
              data: volume.imageData
            };
            this.finishedLoadingCallback(contents);
          }
        }
      };
      // Load the image.
      volume.readURLs([url], onLoaded);
    }
  }

  /**
   * Starts Papaya on the given image URLs.
   *
   * @method startPapaya
   * @private
   * @param urls {string[]} the base image and overlays
   */
  private startPapaya(urls=[]) {
    // The awful Papaya data-passing kludge is to create a global variable
    // and set the container data-params attribute to the variable name.
    window.papayaParams = {
      worldSpace: true,
      showOrientation: true,
      images: [urls]
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

  /**
   * Removes the 'Drag a file' message from the Papaya Viewer.drawEmptyViewer
   * function. Adds a new Viewer.drawHelpMessage function that displays a
   * 'Select a Time Point' message. This function should be called on load
   *  error.
   *
   * @method disableDnD
   * @private
   */
  private disableDnD() {
    papaya.viewer.Viewer.prototype.drawEmptyViewer = function (color) {
      // The default color is the background.
      if (!color) {
        color = this.bgColor;
      }
      // Clear the area.
      this.context.fillStyle = color;
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };

    papaya.viewer.Viewer.prototype.drawHelpMessage = function () {
      // The message text padding size.
      const pad = 6;

      // Scale the message text.
      const fontSize = 18;
      this.context.font = fontSize + "px sans-serif";
      const text = "Select a Time Point to display";
      let metrics = this.context.measureText(text);
      let textWidth = metrics.width;

      // Make a right arrow image which points to the Time Point slider.
      // Scale the right arrow image using the x:y ratio of 1.47.
      const arrowAspectRatio = 1.47;
      let arrowWidth = fontSize * arrowAspectRatio;

      // Position the message.
      // For some reason, the image draws larger than the indicated size.
      // Adjust for this by using a horizontal pad factor of 6 * pad.
      let locX = (this.canvas.width / 2) - ((arrowWidth + textWidth + (6 * pad)) / 2);
      let locY = this.canvas.height - 22;

      // Draw the arrow.
      let arrow = new Image(arrowWidth, fontSize);
      // Point to the Time Point slider.
      arrow.src = 'static/media/arrow-right.png';
      arrow.onload = () => { this.context.drawImage(arrow, locX, locY - pad - fontSize); };

      // Draw the revised help text.
      this.context.fillStyle = "MediumSpringGreen";
      let offset = arrowWidth + (6 * pad);
      this.context.fillText(text, locX + offset, locY);
    };
  }

  /**
   * Monkey-patches the Papaya image loader to call the
   * {{#crossLink "PapayaService/errorHandler:property"}}{{/crossLink}},
   * if it exists, otherwise throw an exception.
   *
   * @method replaceErrorHandler
   * @throws a default error if there is no error handler
   * @private
   */
  private replaceErrorHandler() {
    // If there is an error handler, then delegate to that function.
    // Otherwise, throw an error.
    let onError = (message) => {
      if (this.errorHandler) {
        this.errorHandler(message);
      } else {
        // Improve a file read error message.
        const notFoundPrefix = 'There was a problem reading that file';
        let better = `The server could not read the image file`;
        message = message.replace(notFoundPrefix, better);
        throw new Error(`File load was unsuccessful: ${ message }`);
      }
    };
    papaya.viewer.Display.prototype.drawError = onError;
  }

  /**
   * Monkey-patches the Papaya image loader to call the
   * {{#crossLink "PapayaService/finishedLoadingCallback:property"}}{{/crossLink}}
   * with the loaded Papaya volume {header, data} object.
   *
   * @method injectFinishedLoadingCallback
   * @private
   */
  private injectFinishedLoadingCallback() {
    // The base implementation.
    papaya.viewer.Viewer.prototype._finishedLoading =
      papaya.viewer.Viewer.prototype.finishedLoading;
    // Clobber the Papaya function. In the function body, *this* is
    // the viewer and *self* is the service.
    let self = this;
    papaya.viewer.Viewer.prototype.finishedLoading = function() {
      this._finishedLoading();
      if (self.finishedLoadingCallback) {
        let contents = {
          header: this.volume.header,
          data: this.volume.imageData
        };
        // Delegate to the callback.
        self.finishedLoadingCallback(contents);
      }
    };
  }
}
