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
import Subject from '../subject/subject.data.coffee';
import Session from '../session/session.data.coffee';
import Scan from '../session/scan.data.coffee';
import Registration from '../session/registration.data.coffee';
import Volume from './volume.data.coffee';
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
    private service: VolumeService
  ) {
    this.help = help;
    let params = this.route.params.value;

    // Make a place-holder volume sufficient to display a title.
    // The secondary key consists of the subject, session number,
    // scan number and volume number.
    this.volume = service.secondaryKey(params);
    // Fill in enough of the volume hierarchy to display a title.
    let scan;
    let reg = this.volume.registration;
    if (reg) {
      scan = reg.scan;
      Scan.extend(scan, scan.session);
      reg._cls = 'Registration';
      Registration.extend(reg, scan, reg.number);
      Volume.extend(this.volume, reg, this.volume.number);
    } else {
      scan = this.volume.scan;
      scan._cls = 'Scan';
      Scan.extend(scan, scan.session);
      Volume.extend(this.volume, scan, this.volume.number);
    }
    Subject.extend(scan.session.subject);
    Session.extend(scan.session, scan.session.subject, scan.session.number);
    
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
