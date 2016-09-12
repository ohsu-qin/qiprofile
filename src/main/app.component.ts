import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

import { HelpService } from '../help/help.service.ts';

@Component({
  selector: 'qi-app',
  templateUrl: '/public/html/main/app.html'
})

/**
 * The boot entry point.
 *
 * This component initializes the application as follows:
 * * Define the main `<qi-app></qi-app>` HTML body context.
 * * Clear the help pane on each route transition.
 *
 * @class AppComponent
 */
export class AppComponent {
  constructor(router: Router, helpService: HelpService) {
    let start = router.events.filter(event => event instanceof NavigationStart);
    start.subscribe(event => {
      // Don't change the help state if the navigation is a no-op.
      // Otherwise, clear the help state.
      if (router.url !== event.url) {
        helpService.showHelp = false;
      }
    });
  }
}
