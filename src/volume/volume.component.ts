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
   * The volume number bound to the volume slider.
   *
   * @property volumeNumber {number}
   */
  volumeNumber: number;

  /**
   * The session number bound to the session slider.
   *
   * @property sessionNumber {number}
   */
  sessionNumber: number;

  /**
   * The slider height is computed to match the Papaya height.
   *
   * @property sliderHeight {string}
   */
  sliderHeight: string;

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
   * Flag indicating whether the volume player is enabled.
   *
   * @property isVolumePlayEnabled {boolean}
   */
  isVolumePlayEnabled = true;

  /**
   * Flag indicating whether to force the volume player to stop.
   *
   * @property stopVolumePlay {boolean}
   */
  stopVolumePlay = false;

  /**
   * Flag indicating whether to loop over the volumes.
   *
   * @property isVolumePlaying {boolean}
   * @private
   */
  private isVolumePlaying = false;

  /**
   * Flag indicating whether the
   * {{#crossLink "VolumeComponent/volume:property"}}{{/crossLink}}
   * REST object is being fetched or the image file is being loaded.
   *
   * @property isLoading {boolean}
   * @private
   */
  private isLoading = false;

  /**
   * The time of the last player iteration, or zero to start.
   *
   * @property stopWatch {number}
   * @private
   */
  private stopWatch = 0;

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
   * If the volume player is on, then turn it off.
   * Note that the error is already displayed by the image
   * component.
   *
   * @method onLoadError
   * @param message {string} the error message
   */
  onLoadError(message: string) {
    this.isLoading = false;
    if (this.isVolumePlaying) {
      this.stopVolumePlay = true;
      this.isVolumePlaying = false;
    }
    // Delegate to the standard error handler.
    this.onError(message);
  }

  /**
   *  If the volume player is on, then queue up the next volume.
   *
   * @method onLoaded
   * @param volume {Object} the loaded volume
   */
  onLoaded(volume: Object) {
    this.isLoading = false;
    if (this.isVolumePlaying) {
      this.playNextVolume();
    }
  }

  /**
   * @method volumeCount
   * @return {number} the number of volume parent images
   */
  volumeCount(): number {
    return this.volume.imageSequence.volumes.images.length;
  }

  /**
   * Mimic the Papaya container height = base width / 1.5.
   * The Papaya parent element width is specified in the
   * CSS as 60% of the base width. Nothing is laid out at
   * this point, so we can't set the height to a percent
   * in the CSS. If we hook into the digest cycle after
   * layout, we run the risk of an infinite redigest loop.
   * A 24 pixel padding is added as well.
   *
   * @method calculateSliderHeight
   * @return the intended slider height
   */
  private calculateSliderHeight(): number {
    const padding = 24;
    let unpadded = (window.innerWidth * 0.6) / 1.5;
    return Math.round(unpadded - padding);
  }

  /**
   * Swaps in the indicated volume image.
   * This change resets the title by virtue of loading the
   * volume but does not reroute the app or change the page.
   *
   * @method onVolumeChange
   * @param value {number} the new volume number
   */
  private onVolumeChange(value: number) {
    let imageSequence = this.volume.imageSequence;
    this.isLoading = true;
    let volume = this.service.findVolume(imageSequence, value);
    if (volume) {
      this.volume = volume;
      this.volumeNumber = volume.number;
    } else {
      this.error = `${this.imageSequence.title} Volume ${value}`;
    }
  }

  /**
   *  Starts or stops the volume player.
   *
   * @method onVolumePlay
   * @param volume {boolean} `true` to start playing,
   *    `false` to stop playing
   */
  onVolumePlay(value: boolean) {
    this.isVolumePlaying = value;
    if (value) {
      this.playNextVolume();
    }
  }

  /**
   * Queues up the next volume.
   *
   * @method playNextVolume
   * @private
   */
  private playNextVolume() {
    let nextNdx = this.volume.number %
      this.volume.imageSequence.volumes.images.length;
    let nextNbr = nextNdx + 1;
    // Wait if necessary.
    let next = () => {
      this.stopWatch = Date.now();
      this.onVolumeChange(nextNbr);
    };
    let delta = Date.now() - this.stopWatch;
    let pause = Math.max(500 - delta, 0);
    setTimeout(next, pause);
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
   * hierarchy is the same except for the session number.
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
   * @param value {number} the new session number
   */
  onSessionChange(value: number) {
    let params = _.merge({}, this.routeParams, { session: value });
    this.getVolume(params);
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
   * @method getVolume
   * @param params {Object} the search parameters
   */
  private getVolume(params) {
    // The place-holder volume to fill in the title until the real
    // volume is fetched.
    this.volume = this.service.placeHolder(params);
    this.volumeNumber = this.volume.number;
    this.sessionNumber = this.volume.imageSequence.session.number;

    // Fetch the real volume.
    this.service.getVolume(params).subscribe(volume => {
      if (volume) {
        this.volume = volume;
        this.volumeNumber = this.volume.number;
        this.sessionNumber = this.volume.imageSequence.session.number;
      } else {
        this.error = `${this.volume.title} was not found`;
      }
    });
  }
}
