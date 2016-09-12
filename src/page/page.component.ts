/**
 * The abstract page component base class. A *page component* is
 * a component with a distinct url location and HTML page.
 *
 * @class PageComponent
 * @module page
 * @abstract
 */
export abstract class PageComponent {
  /**
   * The help content.
   *
   * @property help {string}
   */
  help: string;

  /**
   * The error message to display.
   *
   * @property error {string}
   */
  error: string;

  /**
   * The help string is fed into the help pull-down when the help button
   * is clicked. The standard mechanism is the `qi-help` directive
   * included by partial.pug in the help block. Superclasses which
   * don't supply a help argument are responsible for overriding
   * the help block, e.g. as is done by
   * {{#crossLink "CollectionsComponent"}}{{/crossLink}}.
   *
   * @method constructor
   * @param help {string} the optional help text
   */
  constructor(help?: string) {
    this.help = help;
  }

  /**
   * Sets the error property which triggers the error pop-pup.
   * The subclass has the responsibility of binding an error event
   * to this handler, e.g.:
   *
   *     qi-some-directive((error)="onError($event)")
   *
   * @method onError
   * @param message {string} the error messaage
   */
  onError(message: string) {
    this.error = message;
  }

  /**
   * Unsets the error property.
   *
   * @method clearError
   */
  clearError() {
    this.error = null;
  }
}
