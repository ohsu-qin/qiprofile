/**
 * The page module exports the following directives:
 * * {{#crossLink "HomeComponent"}}{{/crossLink}}
 * * {{#crossLink "ErrorComponent"}}{{/crossLink}}
 *
 * @module page
 * @main page
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { HomeComponent } from '../home/home.component.ts';
import { ErrorComponent } from '../error/error.component.ts';

const DIRECTIVES = [
  HomeComponent, ErrorComponent
];

// Note: the built-in Angular directives, e.g. *ngIf, are declared
// (and exported?) in the NgCommonModule. These are supposedly
// made globally available implicitly when the root module
// imports the BrowserModule. For some reason, the Delphic Angular
// examples also import the common module separately in feature
// modules, so we blindly do so here and throughout the application.

@NgModule({
  imports: [NgCommonModule, NgbModule],
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
