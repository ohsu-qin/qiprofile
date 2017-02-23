/**
 * The common module exports the following directives:
 * {{#crossLink "PropertyTableComponent"}}{{/crossLink}}
 *
 * @module common
 * @main common
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
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

import { PropertyTableComponent } from './property-table.component.ts';
import { BooleanPipe } from './boolean.pipe.ts';
import { CapitalizePipe } from './capitalize.pipe.ts';
import { ChoicePipe } from './choice.pipe.ts';
import { FloorPipe } from './floor.pipe.ts';
import { MomentPipe } from './moment.pipe.ts';
import { RomanizePipe } from './romanize.pipe.ts';
import { UnspecifiedPipe } from './unspecified.pipe.ts';

const DIRECTIVES = [
  PropertyTableComponent, BooleanPipe, CapitalizePipe, ChoicePipe, FloorPipe,
  MomentPipe, RomanizePipe, UnspecifiedPipe
];

@NgModule({
  imports: [NgCommonModule, ModalModule.forRoot(), BootstrapModalModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES
})

/**
 * The common module metadata.
 *
 * @module common
 * @class CommonModule
 */
export class CommonModule { }
