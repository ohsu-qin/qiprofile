import * as _ from 'lodash';
import { Component, ViewContainerRef, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { PageComponent } from '../page/page.component.ts';
import { PapayaService } from '../image/papaya.service.ts';
import { ImageSequenceService } from '../session/image-sequence.service.ts';
import { VolumeService } from './volume.service.ts';

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
   * The default horizontal slider configuration.
   *
   * @property HORIZONTAL_SLIDER_CONFIG {Object}
   * @static
   */
  static const HORIZONTAL_SLIDER_CONFIG = {
    connect: 'lower',
    step: 1,
    pips: {
      mode: 'steps',
    }
  };

  /**
   * The default vertical slider configuration.
   *
   * @property VERTICAL_SLIDER_CONFIG {Object}
   * @static
   */
  static const VERTICAL_SLIDER_CONFIG = _.defaults(
    {orientation: 'vertical', direction: 'rtl'},
    VolumeComponent.HORIZONTAL_SLIDER_CONFIG
  );

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
   * @property timePointIntensities {number[]}
   */
  timePointIntensities: number[];

  /**
   * The physical space voxel values about the current coordinate.
   *
   * @property physicalIntensities {number[]}
   */
  physicalIntensities: number[];

  /**
   * The physical intensity gradient chart legend.
   *
   * @property physicalIntensitiesLegend {Object}
   */
  physicalIntensitiesLegend = {
    axial: 'L-R',
    coronal: 'A-P',
    sagittal: 'I-S'
  };

  /**
   * The physical intensity gradient chart width in pixels
   * is a bit less than 20% of the window width to match
   * the CSS .qi-time-series .qi-right setting and allow
   * for a small right margin.
   *
   * @property gradientWidth {number}
   */
  gradientWidth: number;

  /**
   * The intensity charts top position is the image view base
   * plus a small margin.
   *
   * @property intensityGradientsTop{number}
   */
   intensityGradientsTop: number;

  /**
   * The vertical time point slider height is calculated
   * to span the image view height minus a small margin.
   *
   * @property timePointSliderHeight {number}
   */
  timePointSliderHeight: number;

  /**
   * The time point slider configuration.
   *
   * @property timePointSliderConfig {Object}
   */
  timePointSliderConfig: Object;

  /**
   * The session slider configuration.
   *
   * @property sessionSliderConfig {Object}
   */
  sessionSliderConfig: Object;

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
  // TODO - get this from the pipeline.
  domain = [0, 480];

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
   * {{#crossLink "VolumeComponent/createPhysicalIntensitiesFactory"}}{{/crossLink}}
   *
   * @property createPhysicalIntensities
   * @private
   * @static
   */
  private createPhysicalIntensities: Function;

  /**
   * Fetches the volume specified by the route parameters as
   * described in
   * {{#crossLink "VolumeComponent/getVolume"}}{{/crossLink}}.
   *
   * @method constructor
   */
  constructor(
    route: ActivatedRoute, modalService: NgbModal,
    private papaya: PapayaService, private service: VolumeService
  ) {
    super(modalService);

    // Capture the route parameters.
    this.routeParams = route.params.value;
    // Make the physical intensity gradient factory.
    this.createPhysicalIntensities = this.createPhysicalIntensitiesFactory();
    // // Set the dynamic styles.
    // this.calibrateStyles();
    // Fetch the volume.
    this.getVolume(this.routeParams);
  }

  /**
   * Adjusts the slider and intensity chart placement and dimensions.
   *
   * @method onResize
   */
   @HostListener('window:resize', ['$event'])
   onResize() {
    this.calibrateStyles();
  }

  /**
   * Sets the following style properties:
   * * {{#crossLink "VolumeComponent/timePointSliderHeight:property"}}{{/crossLink}}
   * * {{#crossLink "VolumeComponent/gradientWidth:property"}}{{/crossLink}}
   *
   * @method calibrateStyles
   * @private
   */
  private calibrateStyles() {
    // The time point slider height depends on the image viewer height,
    // which is not laid out until the next event loop.
    let calibrateSlider = () => {
      let imgViewHeight = this.imageViewHeight();
      let sliderHeight = this.calculateTimePointSliderHeight(imgViewHeight);
      this.timePointSliderHeight = sliderHeight;
    };
    setTimeout(calibrateSlider, 0);
    // Calibrate the gradient.
    this.gradientWidth = this.calculateIntensityGradientWidth();
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
    // Create the slider configurations, if necessary.
    if (!this.timePointSliderConfig) {
      this.timePointSliderConfig = this.createTimePointSliderConfig(volume);
      this.sessionSliderConfig = this.createSessionSliderConfig(volume);
      // Set the dynamic styles.
      this.calibrateStyles();
    }

    // Update the instance variables.
    // See PapayaService.load() source for a relevant comment.
    this.volume = volume;
    let coord = this.papaya.currentCoordinate;
    this.timePointIntensities = this.timePointVoxelValues(coord);
    this.physicalIntensities = this.physicalVoxelValues(coord);
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
    // and trigger the image swap or load.
    // Otherwise, post an error message.
    //
    // Image swap or load triggers the onLoaded callback,
    // which in turn sets the volume instance variable,
    // which in turn propagates the volume change to the
    // intensity charts.
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
    // Copy and adjust the route parameters.
    let params = _.defaults(
      {session: sessionNbr, volume: this.volume.number},
      this.routeParams
    );
    // Fetch the volume.
    this.getVolume(params);
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
      this.timePointIntensities = this.timePointVoxelValues(coordinate);
      this.physicalIntensities = this.physicalVoxelValues(coordinate);
    }
  }

  private timePointVoxelValues(coordinate: Object): number[] {
    let value = volume => this.volumeVoxelValue(coordinate, volume);
    return this.volume.imageSequence.volumes.images.map(value);
  }

  private volumeVoxelValue(coordinate, volume): number {
    let data = volume.contents && volume.contents.data;
    return data && this.papaya.getVoxelValue(coordinate, data);
  }

  private createTimePointSliderConfig(volume: Object) {
    // The volume count can be deferred in the filter, but not
    // the density.
    let volumeCnt = volume.imageSequence.volumes.images.length;
    // Wrap count to work around the silly Javascript *this* confusion.
    let count = () => this.volumeCount();
    let filter = _.partial(this.pipFilter, count);
    let override = {
      pips: {
        filter: filter,
        density: this.pipDensity(volumeCnt)
      }
    };

    return _.defaultsDeep(override, VolumeComponent.VERTICAL_SLIDER_CONFIG);
  }

  private createSessionSliderConfig(volume: Object) {
    // The session count can be deferred in the filter, but not
    // the density.
    let sessionCnt = volume.imageSequence.session.subject.sessions.length;
    // Wrap count to work around the silly Javascript *this* confusion.
    let count = () => this.sessionCount();
    let filter = _.partial(this.pipFilter, count);
    let override = {
      pips: {
        filter: filter,
        density: this.pipDensity(sessionCnt)
      }
    };

    return _.defaultsDeep(override, VolumeComponent.HORIZONTAL_SLIDER_CONFIG);
  }

  /**
   * The pip density is the larger of 10 or (100 / *count*()).
   *
   * @method pipDensity
   * @private
   * @param count {number} the number of slider values
   * @return {number} the preferred pip density
   */
  private pipDensity(count: number) {
    let n = Math.max(1, count);

    return Math.max(10, 100 / n);
  }

  /**
   * The _value_ => 0|1|2 slider pip function, where
   * * 0 => don't show the value
   * * 1 => show a value in large text
   * * 2 => show a value in small text
   *
   * The values in large text are as follows:
   * * the start and end
   * * if there are 5 or fewer values, then all remaining values
   * * if there are 6-20 values, then every fifth value
   * * if there are more than 20 values, then every tenth value
   * The remaining values are in small text, unless there are more
   * than 20 values, in which case only intermittent values are
   * displayed in small text and the remaining values are not
   * displayed next to their pip.
   *
   * @method pipFilter
   * @private
   * @param count {() => number} a function returning the number of
   *   slider values
   * @param value {number} the input slider value
   * @return {number} the pip display designator
   */
  private pipFilter(count: () => number, value: number): number {
    // If the volume is not yet loaded, then the count is zero.
    // In that case, set the range to one rather than zero.
    // The resulting filter will hide the slider entirely.
    // In fact, the filter will not be employed unless the volume
    // is loaded, but it doesn't hurt to guard against this case.
    let n = Math.max(1, count());
    // The value offset in the range.
    let index = value - 1;
    // The small text is most of the remainder.
    let small = Math.ceil(n / 20);

    // The first, last and quartile pips are large.
    // The pips at the small increment are small.
    // The remainder are not displayed.
    if (value === 1 || value === n || n < 5) {
      return 1;
    } else if (n < 20 && value % 5 === 0 && value < (n * 0.9)) {
      return 1;
    } else if (value % 10 === 0 && value < (n * 0.8)) {
      return 1;
    } else if (index % small === 0) {
      return 2;
    } else {
      return 0;
    }
  }

  /**
   * The physical intensity gradient domain is the 101 voxels centered
   * at the current coordinate.
   *
   * @property PHYSICAL_GRADIENT_DOMAIN
   * @private
   * @static
   */
  private static const PHYSICAL_GRADIENT_DOMAIN = _.range(-50, 51);

  /**
   * Makes the _coordinate_ => {_orientation_: _intensities_, ...}
   * function, where
   * * _orientation_ is `axial`, `coronal` or `sagittal`
   * * _intensities_ is the voxel values over the
   *   {{#crossLink "VolumeComponent/PHYSICAL_GRADIENT_DOMAIN:property"}}{{/crossLink}}
   *   offset from the _coordinate_ _orientation_ x, y or z index.
   *
   * @method createPhysicalIntensitiesFactory
   * @private
   * @return {function} the gradient voxel values factory
   */
  private createPhysicalIntensitiesFactory() {
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
      let z = coordinate.z - dz;
      return z < 0 ? null : this.papaya.getVoxelValueAt(x, y, z);
    };

    // The coordinate => {axial, coronal, sagittal} function.
    return (coordinate) => {
      let axial = _.partial(axialValueFunction, coordinate);
      let coronal = _.partial(coronalValueFunction, coordinate);
      let sagittal = _.partial(sagittalValueFunction, coordinate);
      return {
        axial: VolumeComponent.PHYSICAL_GRADIENT_DOMAIN.map(axial),
        coronal: VolumeComponent.PHYSICAL_GRADIENT_DOMAIN.map(coronal),
        sagittal: VolumeComponent.PHYSICAL_GRADIENT_DOMAIN.map(sagittal)
      };
    };
  }

  private physicalVoxelValues(coordinate: Object): Object {
    return this.createPhysicalIntensities(coordinate);
  }

  /**
   * Mimic the Papaya container height = body width / 1.5.
   * The Papaya parent element width is specified in the
   * CSS as 60% of the body width.
   *
   * Nothing is laid out when this method is initially called,
   * so we can't rely on
   * {{#crossLink "PapayaService/viewerDimensions"}}{{/crossLink}}.
   *
   * @method imageViewHeight
   * @return the image view height truncated to the nearest
   *   integer
   */
  private imageViewHeight(): number {
    let viewerDims = this.papaya.viewerDimensions();
    if (viewerDims) {
      return viewerDims[1];
    } else {
      let rect = document.body.getBoundingClientRect();
      return Math.floor((rect.width * 0.6) / 1.5);
    }
  }

  /**
   * The body width exclusive of the 16px left and right padding.
   *
   * @method bodyInnerWidth
   * @return the body inner width in pixels
   */
  private bodyInnerWidth(): number {
    let rect = document.body.getBoundingClientRect();
    return rect.width - 32;
  }

  /**
   * The gutters on either side of the image display are 20%
   * of the
   * {{#crossLink "VolumeComponent/bodyInnerWidth"}}{{/crossLink}}.
   *
   * @method gutterWidth
   * @return the width of the gutter in pixels
   */
  private gutterWidth(): number {
    return Math.floor(this.bodyInnerWidth() * 0.20);
  }

  /**
   * The slider height is the image view height less the
   * title and player heights.
   *
   * @method calculateTimePointSliderHeight
   * @param imageViewHeight {number}
   * @return the preferred slider height
   */
  private calculateTimePointSliderHeight(
    imageViewHeight: number
  ): number {
    // The title is 20 pixels and the player is 28 pixels.
    // Knock off an inexplicable fudge factor.
    const margin = 24;
    return imageViewHeight - margin;
  }

  /**
   * @method calculateIntensityGradientWidth
   * @return the preferred gradient width
   */
  private calculateIntensityGradientWidth(): number {
    // The margin is an inexplicable fudge factor.
    const margin = 48;
    return this.gutterWidth() - margin;
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
      // Loop back up to the top, if necessary.
      return this.volume.number === 1 ?
        this.volume.imageSequence.volumes.images.length :
        this.volume.number - 1;
    } else if (request === 'next') {
      // Loop back down to the bottom, if necessary.
      let volCnt = this.volume.imageSequence.volumes.images.length;
      let nextNdx = this.volume.number % volCnt;
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
      return this.volume.imageSequence.session.number === 1 ?
        this.volume.imageSequence.session.subject.sessions.length :
        this.volume.imageSequence.session.number - 1;
    } else if (request === 'next') {
      let nextNdx = this.volume.imageSequence.session.number %
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
