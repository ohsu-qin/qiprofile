/**
 * The modeling module exports the following directives:
 * {{#crossLink "ModelingComponent"}}{{/crossLink}}
 *
 * @module modeling
 * @main modeling
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { CommonModule } from '../common/common.module.ts';
import { ProtocolModule } from '../protocol/protocol.module.ts';
import { ModelingComponent } from './modeling.component.ts';

@NgModule({
  imports: [NgCommonModule, CommonModule, NgbModule, ProtocolModule],
  declarations: [ModelingComponent],
  exports: [ModelingComponent]
})

/**
 * The modeling module metadata.
 *
 * @module modeling
 * @class ModelingModule
 */
export class ModelingModule { }
