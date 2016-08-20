/**
 * The Volume module.
 *
 * @module volume
 * @main volume
 */
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PageComponent } from '../page/page.component.ts';
import { ImageSequenceService } from '../session/image-sequence.service.ts';
import { ImageComponent } from '../image/image.component.ts';
import { VolumeService } from './volume.service.ts';
import { VolumeVolumeChooserComponent } from './volume-chooser.component.ts';
import help from './volume.help.md';

@Component({
  selector: 'qi-volume',
  templateUrl: '/public/html/volume/volume.html',
  directives: PageComponent.DIRECTIVES.concat(
    [VolumeVolumeChooserComponent, ImageComponent]
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
    return this.volume ? this.volume.imageSequence.session.subject.project : null;
  }

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private service: VolumeService
  ) {
    super(help);
    
    // The route parameters.
    this.routeParams = this.route.params.value;
    
    // The place-holder volume to fill in the title until the real
    // volume is fetched.
    this.volume = service.placeHolder(this.routeParams);

    // Fetch the real volume.
    service.getVolume(this.routeParams).subscribe(volume => {
      if (volume) {
        this.volume = volume;
      } else {
        this.error = `${ this.volume.title } was not found`;
      }
    });
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
   * Swaps in the new volume image. 
   *
   * @method onVolumeChange
   * @param value {number} the new volume number
   */
  onVolumeChange(value: number) {
    let imageSequence = this.volume.imageSequence;
    this.isLoading = true;
    let volume = this.service.findVolume(imageSequence, value);
    if (volume) {
      this.volume = volume;
    } else {
      this.error = `${ this.imageSequence.title } Volume ${ value } was not found`;
    }
  }
  
  /**
   * Fetches, if necessary, and swaps in the volume for the
   * new session with the same volume number and image sequence
   * number. This change does not reroute the app or change the
   * page.
   *
   * @method onSessionChange
   * @param session {number} the new session number
   */
  onSessionChange(session: number) {
    // TODO
  }
}
