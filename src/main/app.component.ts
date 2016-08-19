/**
 * The application entry module.
 *
 * @module main
 * @main main
 */
import { Component } from '@angular/core';
import { Router, NavigationStart, ROUTER_DIRECTIVES } from '@angular/router';

import { HelpService } from '../help/help.service.ts';
import { SubjectService } from '../subject/subject.service.ts';
import { SessionService } from '../session/session.service.ts';
import { PapayaService } from '../image/papaya.service.ts';

@Component({
  selector: 'qi-app',
  templateUrl: '/public/html/main/app.html',
  directives: [ROUTER_DIRECTIVES],
  // These services are shared by subcomponents, which should not
  // declare the provider separately.
  providers: [HelpService, SubjectService, SessionService, PapayaService]
})

/**
 * The boot entry point.
 *
 * This component initializes the application as follows:
 * * define the main `<qi-app></qi-app>` HTML body context
 * * provide the following application-wide services:
 *   - {{#crossLink "HelpService"}}{{/crossLink}}
 *   - {{#crossLink "SubjectService"}}{{/crossLink}}
 *   - {{#crossLink "SessionService"}}{{/crossLink}}
 * * clear the help pane on each route transition
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
