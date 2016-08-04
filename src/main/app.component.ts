/**
 * The application entry module.
 *
 * @module main
 * @main
 */
import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';

import { HelpService } from '../help/help.service.ts';
import { SubjectService } from '../subject/subject.service.ts';
import { SessionService } from '../session/session.service.ts';

@Component({
  selector: 'qi-app',
  templateUrl: '/public/html/main/app.html',
  directives: [ROUTER_DIRECTIVES],
  // These services are shared by subcomponents, which should not
  // declare the provider separately.
  providers: [HelpService, SubjectService, SessionService]
})

/**
 * The boot entry point.
 *
 * This component defines the main `<qi-app></qi-app>` HTML body context
 * and provides the following services:
 * * {{#crossLink "HelpService"}}{{/crossLink}}
 * * {{#crossLink "SubjectService"}}{{/crossLink}}
 *
 * @class AppComponent
 */
export class AppComponent {}
