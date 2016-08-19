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
   * The route parameters are retained in case the session or volume changes.
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
   * The project name.
   *
   * @property project {string}
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
   * Swaps in the new volume image. 
   *
   * @method onVolumeChange
   * @param value {number} the new volume number
   */
  onVolumeChange(value: number) {
    let imageSequence = this.volume.imageSequence;
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
  
  /**
   * Fetches the new volume image, if necessary, and swaps in
   * the new volume. 
   *
   * @method getVolume
   * @param volume {number} the new volume number
   */
  getVolume(volume: number) {
    // Fetch the real volume.
    service.getVolume(this.routeParams).subscribe(fetched => {
      if (fetched) {
        this.volume = fetched;
      } else {
        this.error = `${ this.volume.title } was not found`;
      }
    });
    
  }
}
