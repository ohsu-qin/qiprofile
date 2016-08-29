/**
 * The Volume module.
 *
 * @module volume
 * @main volume
 */
import * as _ from 'lodash';
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PageComponent } from '../page/page.component.ts';
import { SliderDirective } from '../controls/slider.directive.ts';
import { PlayerComponent } from '../controls/player.component.ts';
import { ImageComponent } from '../image/image.component.ts';
import { ImageSequenceService } from '../session/image-sequence.service.ts';
import { VolumeService } from './volume.service.ts';
import help from './volume.help.md';

@Component({
  selector: 'qi-volume',
  templateUrl: '/public/html/volume/volume.html',
  directives: PageComponent.DIRECTIVES.concat(
    [SliderDirective, PlayerComponent, ImageComponent]
  ),
  providers: [ImageSequenceService, VolumeService]
})

/**
 * The Volume main component.
 *
 * @class VolumeComponent
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
   * The volume REST object.
   *
   * @property volume {Object}
   */
  volume: Object;

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
   * The project name.
   *
   * @property project {string}
   * @readOnly
   */
  get project(): string {
    return this.volume.imageSequence.session.subject.project;
  }

  /**
   * Fetches the volume specified by the route parameters as
   * described in
   * {{#crossLink "VolumeComponent/getVolume"}}{{/crossLink}}.
   *
   * @method constructor
   */
  constructor(
    route: ActivatedRoute,
    private location: Location,
    private service: VolumeService
  ) {
    super(help);
    // Set the slider height manually.
    this.sliderHeight = `${ this.calculateSliderHeight() }`;
    // Capture the route parameters.
    this.routeParams = route.params.value;
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
    let volumes = this.volume.imageSequence.volumes;
    return volumes ? volumes.images.length : 0;
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
      this.volume = volume;
    } else {
      this.error = `${this.imageSequence.title} Volume ${volumeNbr}` +
                   'was not found';
    }
  }

  /**
   * @method sessionCount
   * @return {number} the number of parent subject sessions
   */
  sessionCount(): number {
    return this.volume.imageSequence.session.subject.sessions.length;
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
   * @method onSessionChange
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

    //
    // TODO - flush this out as with onTimePointRequest.
    //
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
    const margin = 36;
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
    // The place-holder volume to fill in the title until the real
    // volume is fetched.
    this.volume = this.service.placeHolder(params);

    // Fetch the real volume.
    this.service.getVolume(params).subscribe(volume => {
      if (volume) {
        this.volume = volume;
      } else {
        this.error = `${this.volume.title} was not found`;
      }
    });
  }
}
