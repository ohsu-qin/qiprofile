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
import { CommonModule as NgCommonModule } from '@angular/common';

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
  imports: [NgCommonModule],
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
