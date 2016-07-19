/**
 * The application entry module.
 *
 * @module main
 */
import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ROUTER_DIRECTIVES } from '@angular/router';

import { HelpService } from '../common/help.service.ts';

@Component({
  selector: 'qi-app',
  templateUrl: '/public/html/main/app.html',
  directives: [ROUTER_DIRECTIVES],
  // The HelpService singleton is shared by subcomponents, which
  // should not declare the provider separately.
  providers: [HelpService]
})

/**
 * The boot entry point.
 *
 * This component provides the following services:
 * * Sets the application routes
 * * Provides the `HelpService` for injection by subcomponents
 * * Includes router directives for use by subcomponents
 * * Defines the main `<qi-app></qi-app>` HTML body context
 * * Navigates to the {{#crossLink "CollectionsComponent"}}{{/crossLink}}
 *   on start-up
 *
 * @class AppComponent
 * @constructor
 */
export class AppComponent implements OnInit {
  /**
   * Captures the router and location for use in the
   * {{#crossLink "AppComponent/ngOnInit:method"}}{{/crossLink}}
   * initialization callback.
   *
   * @method constructor
   * @param router the injected router
   * @param location the injected location
   */
  constructor(private router: Router, private location: Location) { }

  /**
   * Kicks the router to get things started.
   *
   * @method ngOnInit
   */
  ngOnInit() {
    this.router.navigateByUrl(this.location.path());
  }
}
