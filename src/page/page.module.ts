/**
 * The page module imports the modal module and
 * exports the following directives:
 * {{#crossLink "HomeComponent"}}{{/crossLink}}
 * {{#crossLink "ToggleHelpComponent"}}{{/crossLink}}
 * {{#crossLink "HelpComponent"}}{{/crossLink}}
 * {{#crossLink "ErrorComponent"}}{{/crossLink}}
 *
 * @module page
 * @main page
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalModule } from 'angular2-modal';
// Note: the from location below should be 'angular2-modal/plugins/bootstrap',
// but that fails on a 404. Specifying the exact file succeeds, although
// this needs to be tested in the volume help.
// TODO - verify the volume help and amend the qualifier above.
// TODO - can this bug be tracked down? Is it a typings error? jspm error?
//   The lib was added to typings.json, but that has no effect. The lib
//   v. 2.0.1 added some esm work and now builds with WebPack 2. Is that
//   a problem? Post this as an issue in the lib GitHub.
import { BootstrapModalModule } from 'angular2-modal/plugins/bootstrap/index.js';

import { HomeComponent } from '../home/home.component.ts';
import { ToggleHelpComponent } from '../help/toggle-help.component.ts';
import { HelpComponent } from '../help/help.component.ts';
import { ErrorComponent } from '../error/error.component.ts';

// The goofy Angular module construct requires that we both declare
// and export the common Page directives so that the root module
// import can make them available globally.
//
// The built-in Angular directives, e.g. *ngIf, are declared
// (and exported?) in the CommonModule. These are supposedly
// made globally available implicitly when the root module
// imports the BrowserModule. For some reason, the Delphic Angular
// examples also import the common module separately in feature
// modules, so we blindly do so here.

const DIRECTIVES = [
  HomeComponent, ToggleHelpComponent, HelpComponent, ErrorComponent
];

@NgModule({
  imports: [
    CommonModule, ModalModule.forRoot(), BootstrapModalModule
  ],
  declarations: DIRECTIVES,
  exports: DIRECTIVES
})

/**
 * The page module metadata.
 *
 * @module page
 * @class PageModule
 */
export class PageModule { }
