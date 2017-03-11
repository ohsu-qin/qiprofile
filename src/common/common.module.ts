/**
 * The common module exports the following directives:
 * {{#crossLink "PropertyTableComponent"}}{{/crossLink}}
 *
 * @module common
 * @main common
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { PropertyTableComponent } from './property-table.component.ts';
import { BooleanPipe } from './boolean.pipe.ts';
import { CapitalizePipe } from './capitalize.pipe.ts';
import { ChoicePipe } from './choice.pipe.ts';
import { FloorPipe } from './floor.pipe.ts';
import { MomentPipe } from './moment.pipe.ts';
import { RomanizePipe } from './romanize.pipe.ts';
import { UnderscorePipe } from './underscore.pipe.ts';
import { UnspecifiedPipe } from './unspecified.pipe.ts';

const DIRECTIVES = [
  PropertyTableComponent, BooleanPipe, CapitalizePipe, ChoicePipe,
  FloorPipe, MomentPipe, RomanizePipe, UnderscorePipe, UnspecifiedPipe
];

@NgModule({
  imports: [NgCommonModule],
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
