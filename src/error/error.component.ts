/**
 * The error handler module.
 *
 * @module error
 * @main error
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'qi-error',
  templateUrl: '/public/html/error/error.html'
})

/**
 * The error component. This component consists of a template and
 * the `error` input string.
 *
 * @class ErrorComponent
 */
export class ErrorComponent {
  /**
   * The error message to display.
   *
   * @property error {string}
   */
  @Input() error: string;
  
  constructor() {}
}
