import * as _ from 'lodash';
import { Component, ViewContainerRef } from '@angular/core';
import { Overlay } from 'angular2-modal';
import { Modal } from 'angular2-modal/plugins/bootstrap';

import { ActivatedRoute } from '@angular/router';

import { PageComponent } from '../page/page.component.ts';
import { PapayaService } from '../image/papaya.service.ts';
import { ImageSequenceService } from '../session/image-sequence.service.ts';
import { VolumeService } from './volume.service.ts';
import help from './volume.help.md';
import intensityHelp from './intensity.help.md';




import ObjectHelper from '../object/object-helper.coffee';




@Component({
  selector: 'qi-volume',
  templateUrl: '/public/html/volume/volume.html',
  providers: [ImageSequenceService, VolumeService]
})

/**
 * The Volume main component.
 *
 * @class VolumeComponent
 * @module volume
 * @extends PageComponent
 */
export class VolumeComponent extends PageComponent {
  /**
   * The route parameters are retained in case the session or
   * volume changes.
   *
   * @property routeParams {Object}
   */
  routeParams: Object;

  /**
   * The place-holder object for the display title and home
   * navigation project.
   *
   * @property placeHolder {string}
   */
  placeHolder: Object;

  /**
   * The image to display.
   *
   * @property image {Object}
   */
  image: Object;

  /**
   * The loaded volume REST object.
   *
   * @property volume {Object}
   */
  volume: Object;

  /**
   * The current coordinate time series voxel values.
   *
   * @property intensities {number[]}
   */
  intensities: number[];

  /**
   * The gradient voxel values about the current coordinate.
   *
   * @property gradient {number[]}
   */
  gradient: number[];

  /**
   * The gradient legend.
   *
   * @property gradientLegend {Object}
   */
  gradientLegend = {
    axial: 'R-L',
    coronal: 'P-A',
    sagittal: 'I-S'
  };

  /**
   * The slider height is computed to match the Papaya height.
   *
   * @property sliderHeight {string}
   */
  sliderHeight: string;

  /**
   * The slider configuration.
   *
   * @property sliderConfig {Object}
   */
  sliderConfig = {
    orientation: 'vertical',
    direction: 'rtl',
    connect: 'lower',
    behaviour: 'tap-drag',
    step: 1,
    pips: {
      mode: 'steps',
      // TODO - what does density do?
      //   http://refreshless.com/nouislider/pips/ claims that density
      //   "pre-scale[s] the number of pips", whatever that means.
      //   Removing density here or setting it to 1 or 2 introduces
      //   extraneous pips. Setting it to 3 or above shows only the
      //   volume number, which is the desired behavior. Does this
      //   setting work with other volume counts? Why does it work
      //   how it does?
      density: 5
    }
  };

  /**
   * Flag indicating whether to stop an active time point player.
   *
   * @property cancelTimePointPlayer {boolean}
   */
  cancelTimePointPlayer = false;

  /**
   * Flag indicating whether to stop an active session player.
   *
   * @property cancelSessionPlayer {boolean}
   */
  cancelSessionPlayer = false;

  /**
   * The intensity [min, max].
   *
   * @property domain {number[]}
   */
  domain = [0, 400];

  /**
   * The project name.
   *
   * @property project {string}
   * @readOnly
   */
  get project(): string {
    return this.placeHolder.imageSequence.session.subject.project;
  }

  /**
   * The _coordinate_ => {_orientation_: _intensities_, ...}
   * function described in
   * {{#crossLink "VolumeComponent/createGradientFactory"}}{{/crossLink}}
   *
   * @property createGradient
   * @private
   * @static
   */
  private createGradient: Function;

  /**
   * Fetches the volume specified by the route parameters as
   * described in
   * {{#crossLink "VolumeComponent/getVolume"}}{{/crossLink}}.
   *
   * @method constructor
   */
  constructor(
    route: ActivatedRoute,
    vcRef: ViewContainerRef, overlay: Overlay, private modal: Modal,
    private papaya: PapayaService, private service: VolumeService
  ) {
    super(help);
    // Capture the route parameters.
    this.routeParams = route.params.value;
    // Prep the modal.
    overlay.defaultViewContainer = vcRef;
    // Make the gradient factory.
    this.createGradient = this.createGradientFactory();
    // Set the slider height manually.
    this.sliderHeight = `${ this.calculateSliderHeight() }`;
    // Fetch the volume.
    this.getVolume(this.routeParams);
  }

  /**
   * Adjusts the slider height.
   *
   * @method onResize
   */
  onResize() {
    // Adjust the slider height.
    this.sliderHeight = `${ this.calculateSliderHeight() }`;
  }

  /**
   * Sets the
   * {{#crossLink "VolumeComponent/volume:property"}}{{/crossLink}}
   * property to notify the respective choosers.
   *
   * @method onLoaded
   * @param volume {Object} the loaded volume
   */
  onLoaded(volume: Object) {
    this.volume = volume;
    // Set the initial intensities.
    let coord = this.papaya.currentCoordinate;
    this.intensities = this.timeSeriesVoxelValues(coord);
    this.gradient = this.gradientVoxelValues(coord);
  }

  /**
   * Turn off any active player and display the standard error
   * pop-up.
   *
   * @method onLoadError
   * @param message {string} the error message
   */
  onLoadError(message: string) {
    // Cancel any active player.
    this.cancelTimePointPlayer = true;
    // Reset on the next cycle.
    let clear = () => {
      this.cancelTimePointPlayer = false;
    };
    setTimeout(clear, 0);
    // Delegate to the standard error handler.
    this.onError(message);
  }

  /**
   * @method volumeCount
   * @return {number} the number of volume parent images
   */
  volumeCount(): number {
    return this.volume ?
           this.volume.imageSequence.volumes.images.length :
           0;
  }

  /**
   * Fetches the requested volume. The request can be the
   * number, `previous` or `next`.
   *
   * This change resets the title by virtue of loading the
   * volume but does not reroute the app or change the page.
   *
   * @method onTimePointRequest
   * @param request {string|number} the number request
   */
  onTimePointRequest(request: string|number) {
    // Cancel the other player, if active.
    this.cancelSessionPlayer = true;
    // Reset on the next cycle.
    let clear = () => {
      this.cancelSessionPlayer = false;
    };
    setTimeout(clear, 0);

    // The target volume number.
    let volumeNbr = this.requestedVolumeNumber(request);
    // The parent image sequence.
    let imageSequence = this.volume.imageSequence;
    // Find the requested volume.
    let volume = this.service.findVolume(imageSequence, volumeNbr);
    // If the volume was found, then capture the new volume
    // and propagate the changed volume number to the chooser.
    // Otherwise, post an error message.
    if (volume) {
      this.placeHolder = volume;
      this.image = volume;
    } else {
      this.error = `${imageSequence.title} Volume ${volumeNbr}` +
                   'was not found';
    }
  }

  /**
   * @method sessionCount
   * @return {number} the number of parent subject sessions
   */
  sessionCount(): number {
    return this.volume ?
           this.volume.imageSequence.session.subject.sessions.length :
           0;
  }

  /**
   * Replaces the current
   * {{#crossLink "VolumeComponent/volume:property"}}{{/crossLink}}
   * with a comparable session image sequence volume. The volume
   * hierarchy is the same except for the session number. The request
   * can be the session number, `previous` or `next`.
   *
   * For example, if the current volume has hierarchy:
   *
   *     /QIN/Breast/Subject008/Session01/scan/1/registration/1/volume003
   *
   * and the requested session number is `2`, then the new volume is"
   *
   *     /QIN/Breast/Subject008/Session02/scan/1/registration/1/volume003
   *
   * This change resets the title by virtue of loading the
   * new session but does not reroute the app or change the page.
   *
   * @method onSessionRequest
   * @param request {string|number} the number request
   */
  onSessionRequest(request: string|number) {
    // Cancel the other player, if active.
    this.cancelTimePointPlayer = true;
    // Reset on the next cycle.
    let clear = () => {
      this.cancelTimePointPlayer = false;
    };
    setTimeout(clear, 0);

    // The target session number.
    let sessionNbr = this.requestedSessionNumber(request);
    // Update the route params.
    this.routeParams.session = sessionNbr;
    this.routeParams.volume = this.volume.number;
    // Fetch the volume.
    this.getVolume(this.routeParams);
  }

  /**
   * Sets the
   * {{#crossLink "VolumeComponent/intensities:property"}}{{/crossLink}}
   * property for the new coordinate.
   *
   * @method onCoordinateChanged
   * @param coordinate {Object} the new coordinate
   */
  onCoordinateChanged(coordinate: Object) {
    // Papaya centers the coordinate before it invokes the
    // finishedLoading callback. Since the volume variable is
    // not set until the image is loaded, the intensity will
    // not be available on the first call to this coordinate
    // change callback. The loaded callback is therefore
    // also responsible for setting the initial intensities.
    if (this.volume) {
      this.intensities = this.timeSeriesVoxelValues(coordinate);
      this.gradient = this.gradientVoxelValues(coordinate);
    }
  }

  /**
   * Shows the Intensity Tracker modal help pop-up.
   *
   * @method intensityHelp
   */
  intensityHelp() {
    this.modal.alert()
      .size('med')
      .showClose(true)
      .title('Intensity Tracker')
      .body(intensityHelp)
      .open();
  }

  private timeSeriesVoxelValues(coordinate: Object): number[] {
    let value = volume => this.volumeVoxelValue(coordinate, volume);
    return this.volume.imageSequence.volumes.images.map(value);
  }

  private volumeVoxelValue(coordinate, volume): number {
    let data = volume.contents && volume.contents.data;
    return data && this.papaya.getVoxelValue(coordinate, data);
  }

  /**
   * The gradient domain is the 101 voxels centered at the current
   * coordinate.
   *
   * @property GRADIENT_DOMAIN
   * @private
   * @static
   */
  private static const GRADIENT_DOMAIN = _.range(50, -51, -1);

  /**
   * Makes the _coordinate_ => {_orientation_: _intensities_, ...}
   * function, where
   * * _orientation_ is `axial`, `coronal` or `sagittal`
   * * _intensities_ is the voxel values over the
   *   {{#crossLink "VolumeComponent/GRADIENT_DOMAIN:property"}}{{/crossLink}}
   *   offset from the _coordinate_ _orientation_ x, y or z index.
   *
   * @method createGradientFactory
   * @private
   * @return {function} the gradient voxel values factory
   */
  private createGradientFactory() {
    // The value functions vary over one axis and fix the
    // other axes.
    let axialValueFunction = (coordinate, dx) => {
      let x = coordinate.x + dx;
      let y = coordinate.y;
      let z = coordinate.z;
      return x < 0 ? null : this.papaya.getVoxelValueAt(x, y, z);
    };
    let coronalValueFunction = (coordinate, dy) => {
      let x = coordinate.x;
      let y = coordinate.y + dy;
      let z = coordinate.z;
      return y < 0 ? null : this.papaya.getVoxelValueAt(x, y, z);
    };
    let sagittalValueFunction = (coordinate, dz) => {
      let x = coordinate.x;
      let y = coordinate.y;
      let z = coordinate.z + dz;
      return z < 0 ? null : this.papaya.getVoxelValueAt(x, y, z);
    };

    // The coordinate => {axial, coronal, sagittal} function.
    return (coordinate) => {
      let axial = _.partial(axialValueFunction, coordinate);
      let coronal = _.partial(coronalValueFunction, coordinate);
      let sagittal = _.partial(sagittalValueFunction, coordinate);
      return {
        axial: VolumeComponent.GRADIENT_DOMAIN.map(axial),
        coronal: VolumeComponent.GRADIENT_DOMAIN.map(coronal),
        sagittal: VolumeComponent.GRADIENT_DOMAIN.map(sagittal)
      };
    };
  }

  private gradientVoxelValues(coordinate: Object): Object {
    return this.createGradient(coordinate);
  }

  /**
   * Mimic the Papaya container height = base width / 1.5.
   * The Papaya parent element width is specified in the
   * CSS as 60% of the base width. Nothing is laid out at
   * this point, so we can't set the height to a percent
   * in the CSS. If we hook into the digest cycle after
   * layout, we run the risk of an infinite redigest loop.
   * A 36 pixel bottom margin is added as well.
   *
   * @method calculateSliderHeight
   * @return the intended slider height
   */
  private calculateSliderHeight(): number {
    const margin = 48;
    let unpadded = (window.innerWidth * 0.6) / 1.5;
    return Math.round(unpadded - margin);
  }

  /**
   * Determines the requested volume number. The request
   * can be the number, `previous` or `next`.
   *
   * @method timePointRequestVolume
   * @param request {string|number} the number request
   * @private
   */
  private requestedVolumeNumber(request: string|number) {
    if (_.isInteger(request)) {
      return request;
    } else if (request === 'previous') {
      return this.volume.number === 1 ?
        this.volume.imageSequence.volumes.images.length :
        this.volume.number - 1;
    } else if (request === 'next') {
      let nextNdx = this.volume.number %
            this.volume.imageSequence.volumes.images.length;
      return nextNdx + 1;
    } else  {
      throw new Error(`Time point request not supported: ${ request }`);
    }
  }

  /**
   * Determines the requested session number. The request
   * can be the number, `previous` or `next`.
   *
   * @method requestedSessionNumber
   * @param request {string|number} the number request
   * @private
   */
  private requestedSessionNumber(request: string|number) {
    if (_.isInteger(request)) {
      return request;
    } else if (request === 'previous') {
      return this.routeParams.session == 1 ?
        this.volume.imageSequence.session.subject.sessions.length :
        this.routeParams.session - 1;
    } else if (request === 'next') {
      let nextNdx = this.routeParams.session %
            this.volume.imageSequence.session.subject.sessions.length;
      return nextNdx + 1;
    } else  {
      throw new Error(`Session request not supported: ${ request }`);
    }
  }

  /**
   * Fetches the volume specified by the given parameters.
   * This method sets the
   * {{#crossLink "VolumeComponent/volume:property"}}{{/crossLink}} to
   * a {{#crossLink "VolumeService/placeHolder"}}{{/crossLink}} and then
   * attempts to fetch the specified object. If successful, the
   * {{#crossLink "VolumeComponent/volume:property"}}{{/crossLink}} is
   * set to the fetched object. Otherwise, this component's
   * {{#crossLink "PageComponent/error:property"}}{{/crossLink}} is
   * set to an error message, which is then displayed in a pop-up.
   *
   * Setting the
   * {{#crossLink "VolumeComponent/volume:property"}}{{/crossLink}}
   * property value triggers the image component image load. When
   * the image is loaded the
   * {{#crossLink "PageComponent/onLoaded"}}{{/crossLink}} callback
   * notifies the choosers.
   *
   * @method getVolume
   * @param params {Object} the search parameters
   */
  private getVolume(params) {
    // The place-holder volume fills in the title until the real
    // volume is fetched.
    this.placeHolder = this.service.placeHolder(params);

    // Fetch the real volume.
    this.service.getVolume(params).subscribe(volume => {
      if (volume) {
        // Set the image, which will trigger image load.
        this.image = volume;
      } else {
        this.error = `${this.placeHolder.title} was not found`;
      }
    });
  }
}
