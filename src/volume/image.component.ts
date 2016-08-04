import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-volume-image',
  templateUrl: '/public/html/volume/volume-image.html'
})

/**
 * The Volume image display component
 *
 * @class VolumeImageComponent
 */
export class VolumeImageComponent {
  @Input() image;

  constructor() {}
}
