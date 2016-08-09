import papaya from '../../lib/papaya.js';
import { Component, Input, AfterViewChecked } from '@angular/core';

@Component({
  selector: 'qi-volume-image',
  templateUrl: '/public/html/volume/image.html'
})

/**
 * The Volume image display component
 *
 * @class VolumeImageComponent
 */
export class VolumeImageComponent implements AfterViewChecked {
  @Input() image;

  constructor() { }
  
  ngAfterViewChecked() {
    papaya.ui.Toolbar.MENU_DATA.menus.splice(1, 4);
    papaya.Container.startPapaya();
  }
}
