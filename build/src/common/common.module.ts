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

const DIRECTIVES = [
  PropertyTableComponent
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
