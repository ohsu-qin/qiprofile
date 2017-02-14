/**
 * This Subject Detail module exports the
 * {{#crossLink "SubjectComponent"}}{{/crossLink}}
 * directive.
 *
 * @module subject
 * @main subject
 */

import { NgModule } from '@angular/core';
import { CommonModule as NgCommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { AccordionModule } from 'ng2-accordion';

import { PageModule } from '../page/page.module.ts';
import { CommonModule } from '../common/common.module.ts';
import { VisualizationModule } from '../visualization/visualization.module.ts';
import { FloorPipe } from '../common/floor.pipe.ts';
import { CapitalizePipe } from '../common/capitalize.pipe.ts';
import { ChoicePipe } from '../common/choice.pipe.ts';
import { BooleanPipe } from '../common/boolean.pipe.ts';
import { UnspecifiedPipe } from '../common/unspecified.pipe.ts';
import { MomentPipe } from '../date/moment.pipe.ts';
import { RomanizePipe } from '../roman/romanize.pipe.ts';
import { TnmSizePipe } from '../clinical/tnm-size.pipe.ts';
import { TnmStagePipe } from '../clinical/tnm-stage.pipe.ts';
import { SubjectComponent } from './subject.component.ts';

const ROUTE_CONFIG: Routes = [
  {
    path: '',
    component: SubjectComponent
  },
];

@NgModule({
  imports: [
    NgCommonModule, AccordionModule, CommonModule, PageModule,
    RouterModule.forChild(ROUTE_CONFIG), VisualizationModule
  ],
  declarations: [
    SubjectComponent, FloorPipe, CapitalizePipe, ChoicePipe, MomentPipe,
    BooleanPipe, UnspecifiedPipe, RomanizePipe, TnmSizePipe, TnmStagePipe
  ],
  exports: [SubjectComponent]
})

/**
 * The subject module metadata.
 *
 * @module subject
 * @class SubjectModule
 */
export default class SubjectModule { }
