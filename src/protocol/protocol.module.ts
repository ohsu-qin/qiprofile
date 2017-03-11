/**
 * The protocol module exports the following directives:
 * * {{#crossLink "ProtocolComponent"}}{{/crossLink}}
 *
 * @module protocol
 * @main protocol
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { CommonModule } from '../common/common.module.ts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProtocolComponent } from './protocol.component.ts';

const DIRECTIVES = [
  ProtocolComponent
];

@NgModule({
  imports: [NgCommonModule, CommonModule, NgbModule],
  declarations: DIRECTIVES,
  exports: DIRECTIVES
})

/**
 * The protocol module metadata.
 *
 * @module protocol
 * @class ProtocolModule
 */
export class ProtocolModule { }
