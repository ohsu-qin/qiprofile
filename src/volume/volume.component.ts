/**
 * The Volume module.
 *
 * @module volume
 * @main volume
 */
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PAGE_DIRECTIVES } from '../main/page.ts';
import { VolumeService } from './volume.service.ts';
import { VolumeImageComponent } from './image.component.ts';
import help from './volume.help.md';

@Component({
  selector: 'qi-volume',
  templateUrl: '/public/html/volume/volume.html',
  directives: PAGE_DIRECTIVES.concat([VolumeImageComponent]),
  providers: [VolumeService]
})

/**
 * The Volume main component.
 *
 * @class VolumeComponent
 */
export class VolumeComponent {
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;

  /**
   * A fetch error.
   *
   * @property error {string}
   */
  error: string;
  
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
    private volumeService: VolumeService
  ) {
    this.help = help;
    let params = this.route.params.value;
    this.volume = VolumeService.getVolume(params);
    // TODO - reset url if volume changes.
    //let path = this.location.path();
  }
}
