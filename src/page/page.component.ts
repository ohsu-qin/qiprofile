/**
 * The Page abstraction module.
 *
 * @module page
 * @main page
 */
import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import { ErrorComponent } from '../error/error.component.ts';

/**
 * The abstract page component base class. A *page component* is
 * a component with a distinct url location and HTML page.
 *
 * 
 *
 * @class PageComponent
 * @abstract
 */
export abstract class PageComponent {
  /**
   * The standard page directives. The directives consist of the following:
   * * {{#crossLink "HomeComponent"}}{{/crossLink}}
   * * {{#crossLink "ToggleHelpComponent"}}{{/crossLink}}
   * * {{#crossLink "HelpComponent"}}{{/crossLink}}
   * * {{#crossLink "ErrorComponent"}}{{/crossLink}}
   *
   * @property DIRECTIVES {class[]}
   * @static
   */
  static DIRECTIVES = [
    HomeComponent, ToggleHelpComponent, HelpComponent, ErrorComponent
  ];

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
   * The subclass has the responsibility of adding
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
