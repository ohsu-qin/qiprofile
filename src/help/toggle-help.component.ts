import { Component } from '@angular/core';

import { HelpService } from '../help/help.service.ts';

@Component({
  selector: 'qi-toggle-help',
  templateUrl: '/public/html/help/toggle-help.html'
})

/**
 * The help toggle button component.
 *
 * @module help
 * @class ToggleHelpComponent
 */
export class ToggleHelpComponent {
  constructor(private service: HelpService) {}
  
  /**
   * @method showHelp
   * @return {boolean} whether the help is shown
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
