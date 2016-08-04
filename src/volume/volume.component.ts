/**
 * The Volume module.
 *
 * @module volume
 * @main
 */
import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import { VolumeService } from './volume.service.ts';
import { VolumeImageComponent } from './image.component.ts';
import help from './volume.help.md';

@Component({
  selector: 'qi-volume',
  templateUrl: '/public/html/volume/volume.html',
  directives: [HomeComponent, ToggleHelpComponent,
               VolumeImageComponent, HelpComponent],
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
   * The volume REST object.
   *
   * @property volume {Object}
   */
  volume: Object;

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
