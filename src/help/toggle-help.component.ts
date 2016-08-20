import { Component } from '@angular/core';

import { HelpService } from '../help/help.service.ts';

@Component({
  selector: 'qi-toggle-help',
  templateUrl: '/public/html/help/toggle-help.html'
})

/**
 * The help toggle button component.
 *
 * @class ToggleHelpComponent
 */
export class ToggleHelpComponent {
  constructor(private service: HelpService) {}
  
  /**
   * Flag indicating whether the help is shown.
   *
   * @property showHelp  {boolean}
   * @readOnly
   */
  get showHelp(): boolean {
    return this.service.showHelp;
  }

  /**
   * Toggles the help flag.
   *
   * @method toggleHelp
   */
  toggleHelp() {
    this.service.toggleHelp();
  }
}
