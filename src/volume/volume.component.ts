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
import { VolumeService } from './volume.service.ts';
import { VolumeImageComponent } from './image.component.ts';
import help from './volume.help.md';

@Component({
  selector: 'qi-volume',
  templateUrl: '/public/html/volume/volume.html',
  directives: PageComponent.DIRECTIVES.concat([VolumeImageComponent]),
  providers: [VolumeService]
})

/**
 * The Volume main component.
 *
 * @class VolumeComponent
 * @extends PageComponent
 */
export class VolumeComponent extends PageComponent {
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
    let params = this.route.params.value;
    // Make a place-holder volume sufficient to display a title
    // until the real volume is read from the database.
    this.volume = service.placeHolder(params);
    
    // Fetch the real volume.
    service.getVolume(params).subscribe(volume => {
      if (volume) {
        this.volume = volume;
      } else {
        this.error = `${ this.volume.title } was not found`;
      }
    });
    // TODO - reset url if volume changes.
    //let path = this.location.path();
  }
}
