import { Injectable } from '@angular/core';

@Injectable()

/**
 * This service encapsulates the `showHelp` flag.
 *
 * @class HelpService
 */
export class HelpService {
  /**
   * Flag indicating whether to display the help pane.
   *
   * @property showHelp
   */
  showHelp = false;

  /**
   * Inverts the `showHelp` flag.
   *
   * @method toggleHelp
   */
  toggleHelp() {
    this.showHelp = !this.showHelp;
  }
}
