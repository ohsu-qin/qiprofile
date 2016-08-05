import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import { ErrorComponent } from '../error/error.component.ts';

/**
 * The page utilities.
 *
 * @class PageHelper
 * @static
 */

/**
 * The standard page directives. The directives consist of the following:
 * * {{#crossLink "HomeComponent"}}{{/crossLink}}
 * * {{#crossLink "ToggleHelpComponent"}}{{/crossLink}}
 * * {{#crossLink "HelpComponent"}}{{/crossLink}}
 * * {{#crossLink "ErrorComponent"}}{{/crossLink}}
 *
 * @property PAGE_DIRECTIVES {class[]}
 * @static
 */
let PAGE_DIRECTIVES = [
  HomeComponent, ToggleHelpComponent, HelpComponent, ErrorComponent
];

export { PAGE_DIRECTIVES };
