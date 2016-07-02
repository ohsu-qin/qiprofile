import { Injectable } from '@angular/core';

@Injectable()

/**
 * This service encapsulates the `showHelp` flag.
 *
 * @class HelpService
 */
export class HelpService {
  /**
   * @property showHelp flag indicating whether to display
   * the help pane
   */
  showHelp: boolean = false;

  /**
   * Inverts the `showHelp` flag.
   *
   * @method toggleHelp
   */
  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
