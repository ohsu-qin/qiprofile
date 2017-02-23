/**
 * The modeling module exports the following directives:
 * {{#crossLink "ModelingComponent"}}{{/crossLink}}
 *
 * @module modeling
 * @main modeling
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';

import { CommonModule } from '../common/common.module.ts';
import { ModelingComponent } from './modeling.component.ts';
import { ModelingInfoComponent } from './modeling-info.component.ts';

@NgModule({
  imports: [NgCommonModule, CommonModule],
  declarations: [ModelingComponent, ModelingInfoComponent],
  exports: [ModelingComponent]
})

/**
 * The modeling module metadata.
 *
 * @module modeling
 * @class ModelingModule
 */
export class ModelingModule { }
